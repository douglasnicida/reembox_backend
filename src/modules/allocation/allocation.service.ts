import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAllocationsDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { UserService } from '../user/user.service';
import { ProjectService } from '../project/project.service';
import { QueryFilter } from '@/decorators/filter.decorator';
import { Allocation, Prisma } from '@prisma/client';
import { Pagination } from '@/decorators/pagination.decorator';

@Injectable()
export class AllocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
  ) {}

  async create(dto: CreateAllocationsDto) {
    await this.userService.findMany(dto.allocations.map(alloc => alloc.userId))
    await this.projectService.findOne(dto.projectId)

    const allocations = dto.allocations.map(alloc => ({
      projectId: dto.projectId,
      userId: alloc.userId,
      startDate: alloc.startDate,
      estimatedEndDate: alloc.estimatedEndDate,
    }));

    await this.prisma.allocation.createMany({
      data: allocations,
    });
  }

  async findAllByUser(pagination: Pagination, f: QueryFilter, userId: number) {
    const { page, limit, size, offset } = pagination;

    const filter: Prisma.AllocationWhereInput = f ? {
      OR: [
        { project: { name: { contains: f.q, mode: 'insensitive' } }},
        { project: { key: { contains: f.q, mode: 'insensitive' } } },
        { project: { customer: { name: { contains: f.q, mode: 'insensitive' } } } },
      ],
      endDate: f.areAllocationsFinished ? { not: null } : null
    } : {};

    const whereQuery = {
      user: {
        id: userId
      },
      ...filter
    } as Prisma.AllocationWhereInput


    const query = {
      skip: offset,
      take: limit,
      where: whereQuery,
      orderBy: {
        startDate: "desc"
      },
      select: {
        id: true,
        startDate: true,
        estimatedEndDate: true,
        endDate: true,
        project: {
          select: {
            name: true,
            active: true,
            customer: {
              select: {
                name: true,
              },
            },
            allocations: { 
              select: {
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    } satisfies Prisma.AllocationFindManyArgs;

    const [allocations, total] = await this.prisma.$transaction([
      this.prisma.allocation.findMany(query),
      this.prisma.allocation.count({ where: whereQuery })
    ])
  
    const filteredAllocations = allocations.map(allocation => {
      return {
        ...allocation,
        // Filtra os usuários que não são o próprio usuário
        projectUsers: allocation.project.allocations
          .filter(allocation => allocation.userId !== userId)
          .map(allocation => allocation.user),
      };
    });

    if (total <= 0) {
      throw new NotFoundException("Nenhuma alocação foi encontrada.")
    }

    return { 
      items: filteredAllocations as unknown as Allocation[],
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page + 1, 
      size,
    };
  }

  async findAll(pagination: Pagination, f: QueryFilter, companyId: number) {
    const { page, limit, size, offset } = pagination;

    const filter: Prisma.AllocationWhereInput = f ? {
      endDate: f.areAllocationsFinished ? { not: null } : null
    } : {};

    const whereQuery = {
      OR: [
        { project: { name: { contains: f.q, mode: 'insensitive' } }},
        { project: { key: { contains: f.q, mode: 'insensitive' } } },
        { project: { customer: { name: { contains: f.q, mode: 'insensitive' } } } },
        { customer: {
          name: { contains: f.q, mode: 'insensitive' }
        }},
      ],
      projects: {
        some: {
          companyId,
        }
      },
      ...filter
    } as Prisma.AllocationWhereInput

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      },
      where: whereQuery,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        project: {
          select: {
            key: true,
            name: true,
            customer: {
              select: {
                name: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            jobTitle: {
               select: {
                title: true,
               }
            },
          },
        },
      }
    } satisfies Prisma.AllocationFindManyArgs;

    const [allocations, total] = await this.prisma.$transaction([
      this.prisma.allocation.findMany(query),
      this.prisma.allocation.count({ where: whereQuery })
    ])

    if (total <= 0) {
      throw new NotFoundException("Nenhuma alocação foi encontrada.")
    }

    return { 
      items: allocations as unknown as Allocation[],
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page + 1, 
      size,
    };
  }

  async finalizeAllocation(id: number, dto: UpdateAllocationDto) {
    await this.prisma.allocation
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Alocação com id = ${id} não encontrada`) })

    await this.prisma.allocation.update({
      where: { id },
      data: {
        endDate: dto.endDate,
      },
    });
  }
}
