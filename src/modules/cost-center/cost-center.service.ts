import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { generateCode } from '@/utils/generate-code';
import { CostCenter, Prisma } from '@prisma/client';
import { Paginated, Pagination } from '@/decorators/pagination.decorator';
import { QueryFilter } from '@/decorators/filter.decorator';

@Injectable()
export class CostCenterService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCostCenterDto, companyID: number) {
    await this.prisma.costCenter.create({
      data: {
        ...dto,
        code: generateCode(5),
        company: {connect: {id: companyID}}
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.costCenter.findUniqueOrThrow({where: {id: id}});
  }

  async findAll(
    pagination: Pagination, 
    f: QueryFilter,
    companyId: number
  ): Promise<Paginated<CostCenter>> { 
    const { page, limit, size, offset } = pagination;
    
    const filter = f ? {
      OR: [
        { description: { contains: f.q, mode: 'insensitive' } },
        { code: { contains: f.q, mode: 'insensitive' } },
      ],
      active: f.active
    } as Prisma.CostCenterWhereInput : {}

    const whereQuery = {
      company: {
        id: companyId
      },
      ...filter
    } as Prisma.CostCenterWhereInput

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      },
      where: whereQuery,
      select: {
        id: true,
        code: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        active: true,
      }
    } satisfies Prisma.CostCenterFindManyArgs

    const [costCenters, total] = await this.prisma.$transaction([
      this.prisma.costCenter.findMany(query),
      this.prisma.costCenter.count({ where: whereQuery })
    ])

    if (total <= 0) {
      throw new NotFoundException("Não há centros de custo cadastrado.")
    }

    return { 
      items: costCenters as CostCenter[],
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page + 1, 
      size,
    };
  }

  async getParams(companyId: number) {
    const costCenters =  await this.prisma.costCenter.findMany({ 
      where: {
        company: {
          id: companyId
        }
      },
      select: {
        id: true,
        code: true,
        description: true
      }
    })

    return costCenters.map(({ id, code, description }) => ({
      id,
      param: `${code} - ${description}`
    }))
  }

  async update(id: number, updateCostCenterDto: UpdateCostCenterDto) {
    await this.prisma.costCenter.findFirstOrThrow({
      where: {
        id: id
      }
    })

    return this.prisma.costCenter.update({
      where: {
        id: id
      },
      data: {
        description: updateCostCenterDto.description
      }
    });
  }

  async remove(id: number) {
    const { active } = await this.prisma.costCenter
    .findUniqueOrThrow({ where: { id } })
    .catch(() => { throw new NotFoundException(`Centro de Custo com id = ${id} não encontrado`) })

    await this.prisma.costCenter.update({ where: { id }, data: { active: !active } })

    return active;
  }
}
