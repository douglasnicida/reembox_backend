import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'prisma/service/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}
  
  async create(dto: CreateCompanyDto) {
    const company = await this.prisma.company.findUnique({ where: { cnpj: dto.cnpj } })

    if (company) {
      throw new ConflictException("Essa empresa já existe")
    }

    await this.prisma.company.create({ 
      data: {
        ...dto,
        logo: "any",
        address: {
          create: dto.address
        }
      } 
    })
  }

  findAll() {
    return this.prisma.company.findMany();
  }

  async findOne(id: number) {
    return this.prisma.company
      .findUniqueOrThrow({ 
        where: { id },
        select: {
          project: {
            select: {
              customer: true
            }
          }
        }
      })
      .catch(() => { 
        throw new NotFoundException(`Empresa com id = ${id} não encontrada`) 
      })
  }

  async update(id: number, dto: UpdateCompanyDto) {
    await this.prisma.company
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Empresa com id = ${id} não encontrada`) })

    const { address, ...updatedCompany } = dto

    await this.prisma.company.update({
      where: { id },
      data: {
        ...updatedCompany,
        address: {
          update: {
            ...address
          }
        }
      }
    })
  }

  async remove(id: number) {
    const { active } = await this.prisma.company
    .findUniqueOrThrow({ where: { id } })
    .catch(() => { 
      throw new NotFoundException(`Empresa com id = ${id} não encontrada`) 
    })

    await this.prisma.company.update({ where: { id }, data: { active: !active } })

    return active;
  }
}
