import { ConflictException, Injectable, NotFoundException, Query } from '@nestjs/common';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { Paginated, Pagination } from '@/decorators/pagination.decorator';
import { ExpenseCategory, Prisma } from '@prisma/client';
import { QueryFilter } from '@/decorators/filter.decorator';

@Injectable()
export class ExpenseCategoryService {
  constructor(private prisma: PrismaService){}

  async create(dto: CreateExpenseCategoryDto, companyId: number) {
    const expenseCategory = await this.prisma.expenseCategory.findFirst({
      where: {
        description: dto.description
      }
    })

    if(expenseCategory) {
      throw new ConflictException('Categoria de despesa já existe.');
    }

    await this.prisma.expenseCategory.create({
        data: {
          description: dto.description,
          active: dto.active ?? true,
          company: {connect: { id: companyId }},
        }
    });
  }

  async findAll(
    pagination: Pagination, 
    f : QueryFilter,
    companyId: number
  ): Promise<Paginated<ExpenseCategory>> {
    const { page, limit, size, offset } = pagination;

    const filter = f ? {
      OR: [
        { description: { contains: f.q, mode: 'insensitive' } },
      ],
      active: f.active
    } as Prisma.ExpenseCategoryWhereInput : {}

    const whereQuery = {
      company: {
        id: companyId
      },
      ...filter
    } as Prisma.ExpenseCategoryWhereInput

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      },
      where: whereQuery,
      select: {
        id: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        active: true,
      }
    } satisfies Prisma.ExpenseCategoryFindManyArgs

    const [expenseCategories, total] = await this.prisma.$transaction([
      this.prisma.expenseCategory.findMany(query),
      this.prisma.expenseCategory.count({ where: whereQuery })
    ])

    if (total <= 0) {
      throw new NotFoundException("Não há tipos de despesa cadastradas.")
    }

    return { 
      items: expenseCategories as ExpenseCategory[],
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page + 1, 
      size,
    };
  }

  async findOne(id: number) {
    return this.prisma.expenseCategory.findUniqueOrThrow({
      where: {id: id}
    });
  }

  async update(id: number, dto: UpdateExpenseCategoryDto) {
    await this.prisma.expenseCategory.findUniqueOrThrow({ where: { id } });

    return this.prisma.expenseCategory.update({
      where: {
        id: id
      },
      data: {
        ...dto
      }
    });
  }

  async remove(id: number) {
    const { active } = await this.prisma.expenseCategory
    .findUniqueOrThrow({ where: { id } })
    .catch(() => { throw new NotFoundException(`Tipo de despesa com id = ${id} não encontrado`) })

    await this.prisma.expenseCategory.update({ where: { id }, data: { active: !active } })

    return active;
  }

  async getParams(companyId: number) {
    const expenseCategories = await this.prisma.expenseCategory.findMany({ 
      where: {
        company: {
          id: companyId
        }
      },
      select: {
        id: true,
        description: true
      }
    })

    return expenseCategories.map(({ id, description }) => ({
      id,
      param: description
    }))
  }
}
