import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAllocationDto } from './dto/create-allocation.dto';
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

  async create(dto: CreateAllocationDto) {
    await this.userService.findOneById(dto.userId)
    await this.projectService.findOne(dto.projectId)

    await this.prisma.allocation.create({
      data: dto,
    });
  }

  async findOne(projectId: number) {
    const project = await this.projectService.findOne(projectId);
  
    if (!project) {
      throw new Error('Projeto não encontrado');
    }
  
    const allocations = await this.prisma.allocation.findMany({
      where: {
        projectId: projectId,
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        user: {
          select: {
            id: true,
            name: true,
            jobTitle: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (allocations.length === 0) {
      throw new NotFoundException(`${project.key}: não há alocações!`)
    }
  
    return allocations
  }

  async findAllByUser(pagination: Pagination, f: QueryFilter, userId: number) {
    const { page, limit, size, offset } = pagination;

    console.log(userId);
    

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
            key: true,
            active: true,
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
            allocations: { 
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    jobTitle: {
                      select: {
                        title: true
                      }
                    }
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

    const filteredAllocations = allocations.map(({ project, ...rest }) => {
      console.log(project.allocations);
      
      return {
        id: rest.id,
        startDate: rest.startDate,
        estimatedEndDate: rest.estimatedEndDate,
        endDate: rest.endDate,
        project: {
          name: project.name,
          key: project.key,
        },
        customer: {
          id: project.customer.id,
          name: project.customer.name,
        },
        allocations: project.allocations.map(({ user })=> ({
          id: user.id,
          name: user.name,
          jobTitle: user.jobTitle?.title
        })),
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
      { project: { name: { contains: f.q, mode: 'insensitive' } } },
      { project: { key: { contains: f.q, mode: 'insensitive' } } },
      // { project: { customer: { name: { contains: f.q, mode: 'insensitive' } } } },
    ],
    project: {
      companyId: companyId,
    },
    ...filter,
  } as Prisma.AllocationWhereInput;
  
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
        estimatedEndDate: true,
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

  async getParams(companyId: number) {
    const projects = await this.projectService.getParams(companyId)
    const data = await this.userService.getParams(companyId)

    const users = data.map(user => ({
      id: user.id,
      param: `${user.name}, ${user.jobTitle?.title}`
    }))

    console.log(users);
    

    return { projects, users }
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
