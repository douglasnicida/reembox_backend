import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { Paginated, Pagination } from '@/decorators/pagination.decorator';
import { Customer, Prisma } from '@prisma/client';
import { QueryFilter } from '@/decorators/filter.decorator';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}
  
  async create(dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.findFirst({ where: {
      OR: [
        { email: dto.email },
        { phone: dto.phone }
      ]
    }})

    if (customer) {
      throw new ConflictException("Esse cliente já existe")
    }

    return this.prisma.customer.create({ data: { ...dto }})
  }

  async findOne(id: number) {
    return this.prisma.customer
    .findUniqueOrThrow({ where: { id } })
    .catch(() => { 
      throw new NotFoundException(`Cliente com id = ${id} não encontrado`) 
    })
  }

  async findAll(
    pagination: Pagination, 
    f: QueryFilter,
    companyId: number
  ): Promise<Paginated<Customer>> {
    const { page, limit, size, offset } = pagination;

    const filter = f ? {
      OR: [
        { name: { contains: f.q, mode: 'insensitive' } },
        { phone: { contains: f.q, mode: 'insensitive' } },
        { email: { contains: f.q, mode: 'insensitive' } },
      ],
      active: f.active
    } as Prisma.CustomerWhereInput : {}

    const whereQuery = {
      projects: {
        some: {
          companyId,
        }
      },
      ...filter
    } as Prisma.CustomerWhereInput

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      },
      where: whereQuery,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        active: true,
      }
    } satisfies Prisma.CustomerFindManyArgs;

    const [customers, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany(query),
      this.prisma.customer.count({ where: whereQuery })
    ])

    if (total <= 0) {
      throw new NotFoundException("Nenhum cliente foi encontrado.")
    }

    return { 
      items: customers as Customer[],
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page + 1, 
      size,
    };
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.prisma.customer
    .findUniqueOrThrow({ where: { id } })
    .catch(() => { throw new NotFoundException(`Cliente com id = ${id} não encontrado`) })

    await this.prisma.customer.update({
      where: { id },
      data: {
        ...dto
      }
    })
  }

  async remove(id: number) {
    const { active } = await this.prisma.customer
    .findUniqueOrThrow({ where: { id } })
    .catch(() => { throw new NotFoundException(`Cliente com id = ${id} não encontrado`) })

    await this.prisma.customer.update({ where: { id }, data: { active: !active } })

    return active;
  }
}
