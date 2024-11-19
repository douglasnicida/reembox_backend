import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobTitleDto } from './dto/create-job-title.dto';
import { UpdateJobTitleDto } from './dto/update-job-title.dto';
import { JobTitle, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/service/prisma.service';
import { Paginated, Pagination } from '@/decorators/pagination.decorator';

@Injectable()
export class JobTitleService {
  constructor(private prisma: PrismaService) {}

  async create(createJobTitleDto: CreateJobTitleDto, companyID: number){
    const jobTitle : JobTitle = await this.prisma.jobTitle.findFirst({where:  {title: createJobTitleDto.title}});

    await this.prisma.company.findUniqueOrThrow({where: {id: companyID}});
    
    if(jobTitle){
      throw new ConflictException('Job Title already exists');
    }

    await this.prisma.jobTitle.create({data: {
      title: createJobTitleDto.title,
      company: {connect: {id: companyID}},
    }});
  }

  async findAll(
    pagination: Pagination, 
    name: string, 
    companyId: number
  ): Promise<Paginated<JobTitle>> {
    const { page, limit, size, offset } = pagination;

    const filter = name ? {
      OR: [
        { title: { contains: name, mode: 'insensitive' } },
      ],
    } as Prisma.JobTitleWhereInput : {}

    const whereQuery = {
      company: {
        id: companyId,
      },
      ...filter
    } as Prisma.JobTitleWhereInput

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        title: 'asc'
      },
      where: whereQuery,
      select: {
        id: true,
        title: true,
        companyId: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    } satisfies Prisma.JobTitleFindManyArgs;

    const [jobTitles, total] = await this.prisma.$transaction([
      this.prisma.jobTitle.findMany(query),
      this.prisma.jobTitle.count({ where: whereQuery })
    ])

    if (total <= 0) {
      throw new NotFoundException("Nenhum cargo foi encontrado.")
    }

    return { 
      items: jobTitles.map((jobTitle) => ({
        id: jobTitle.id,
        title: jobTitle.title,
        numOfEmployees: jobTitle._count.users,
      })),
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page + 1, 
      size,
    };
  }

  async findOne(id: number) {
    return await this.prisma.jobTitle.findUnique({where: {id: id}});
  }

  async update(id: number, companyId: number, updateJobTitleDto: UpdateJobTitleDto) {
    const auxJobTitle = await this.prisma.jobTitle.findFirst({where: {
      companyId: companyId,
      title: updateJobTitleDto.title
    }})

    if(auxJobTitle) {
      throw new ConflictException('A JobTitle with this name already exists.')
    }

    return await this.prisma.jobTitle.update(
      {
        where: {id: id}, 
        data: updateJobTitleDto
      });
  }

  async remove(id: number) {
    return await this.prisma.jobTitle.delete({where: {id: id}});
  }
}
