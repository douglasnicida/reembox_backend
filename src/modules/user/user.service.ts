import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { Prisma, User } from '@prisma/client';
import { Pagination } from '@/decorators/pagination.decorator';
import { Role } from '@/interfaces/model_types';

export interface UserWithCompanyName {
  id: number,
  name: string,
  company: { 
    id: number,
    name: string 
  }
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOneById(id: number) : Promise<UserWithCompanyName>{
    return this.prisma.user.findUnique({ 
      where: { id }, 
      select: {
        id: true,
        name: true,
        company: {
          select: { 
            id: true,
            name: true 
          }
        }
      }
    });
  }

  async findAll(pagination: Pagination, companyId: number) {
    const { page, limit, size, offset } = pagination;

    const whereQuery = {
      company: {
        id: companyId
      },
      auth: {
        role: {
          in: [Role.USER]
        }
      }
    } as Prisma.UserWhereInput

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: "desc"
      },
      where: whereQuery,
      select: {
        id: true,
        cpf: true,
        name: true,
        phone: true,
        jobTitle: {
          select: {
            title: true,
          }
        },
        createdAt: true,
        updatedAt: true,
        active: true
      }
    } as Prisma.UserFindManyArgs

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany(query),
      this.prisma.user.count({ where: whereQuery })
    ])

    if (total <= 0) {
      throw new NotFoundException("Nenhum usuário foi encontrado.")
    }

    return { 
      items: users,
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page, 
      size,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Esse usuário não existe');
    }

    const newUser: User = {
      ...user,
      phone: updateUserDto.phone ?? user.phone,
      name: updateUserDto.name ?? user.name,
    } 
    
    return await this.prisma.user.update({
      where:  { id },
      data: newUser
    });
  }

  async changeJobTitle(id: number, jobTitleID: number) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: Number(id) } });

    const jobTitle = await this.prisma.jobTitle.findUniqueOrThrow({ where: { id: jobTitleID }})

    return await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        jobTitle: { connect: { id: jobTitle.id } }
      }
    })
  }

  async getApprovers(companyID: number) {
    return await this.prisma.user.findMany({
      where: {
        managerId: null,
        companyId: companyID
      },
      select: {
        id: true,
        name: true
      }
    })
  }

  async remove(id: number) {
    const { active } = await this.prisma.user
    .findUniqueOrThrow({ where: { id } })
    .catch(() => { throw new NotFoundException(`Colaborador com id = ${id} não encontrado`) })

    await this.prisma.user.update({ where: { id }, data: { active: !active } })

    return active;
  }
}
