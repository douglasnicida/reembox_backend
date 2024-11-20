import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { Paginated, Pagination } from '@/decorators/pagination.decorator';
import { Prisma, Project } from '@prisma/client';
import { QueryFilter } from '@/decorators/filter.decorator';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, companyId: number) {
    const project = await this.prisma.project.findUnique({ where: { key: dto.key } })

    if (project) {
      console.log(project);
      throw new ConflictException("Esse projeto já existe")
    }

    await this.prisma.company
      .findUniqueOrThrow({ where: { id: companyId } })
      .catch(() => { 
        throw new NotFoundException(`Empresa com id = ${companyId} não encontrada`) 
    })

    await this.prisma.customer
      .findUniqueOrThrow({ where: { id: dto.customerId } })
      .catch(() => { 
        throw new NotFoundException(`Cliente com id = ${dto.customerId} não encontrado`) 
    })

    await this.prisma.project.create({ 
      data: {
        name: dto.name,
        key: dto.key,
        company: {
          connect: { id: companyId }
        },
        customer: {
          connect: { id: dto.customerId }
        }
      } 
    })
  }

  async findAll(
    pagination: Pagination, 
    f: QueryFilter,
    companyId: number
  ): Promise<Paginated<Project>> {
    const { page, limit, size, offset } = pagination;

    const filter = f ? {
      OR: [
        { key: { contains: f.q, mode: 'insensitive' } },
        { name: { contains: f.q, mode: 'insensitive' } },
        { customer: {
          name: { contains: f.q, mode: 'insensitive' }
        }},
      ],
      active: f.active
    } as Prisma.ProjectWhereInput : {}

    const whereQuery = {
      company: {
        id: companyId
      },
      ...filter
    } as Prisma.ProjectWhereInput

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      },
      where: whereQuery,
      select: {
        id: true,
        key: true,
        customer: {
          select: {
            name: true,
          }
        },
        name: true,
        createdAt: true,
        updatedAt: true,
        active: true
      }
    } satisfies Prisma.ProjectFindManyArgs

    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany(query),
      this.prisma.project.count({ where: whereQuery })
    ])

    if (total <= 0) {
      throw new NotFoundException("Não há tipos de despesa cadastradas.")
    }

    return { 
      items: projects as unknown as Project[],
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page + 1, 
      size,
    };
  }

  async findOne(id: number): Promise<Project> {
    return this.prisma.project
    .findUniqueOrThrow({ where: { id } })
    .catch(() => { 
      throw new NotFoundException(`Projeto com id = ${id} não encontrado`) 
    })
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.prisma.project
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Projeto com id = ${id} não encontrado`) })

    await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        customer: {
          connect: { id: dto.customerId }
        }
      }
    })
  }

  async remove(id: number) {
    const { active } = await this.prisma.project
    .findUniqueOrThrow({ where: { id } })
    .catch(() => { throw new NotFoundException(`Projeto com id = ${id} não encontrado`) })

    await this.prisma.project.update({ where: { id }, data: { active: !active } })

    return active;
  }

  async getParams(companyId: number) {
    const projects =  await this.prisma.project.findMany({ 
      where: {
        company: {
          id: companyId
        }
      },
      select: {
        id: true,
        key: true,
        name: true,
      }
    })

    return projects.map(({ id, key, name }) => ({
      id,
      param: `${key} - ${name}`
    }))
  }
}
