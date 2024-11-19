import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { Paginated, Pagination } from '@/decorators/pagination.decorator';
import { Expense, Prisma, Report, ReportStatus } from '@prisma/client';
import { PayloadStruct } from '@/interfaces/model_types';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReportDto, user: PayloadStruct) {
    const { approverId, ...report } = dto

    const approver = await this.prisma.user.findFirst({ where: { managerId: approverId } })
    
    if (!approver) {
      throw new UnprocessableEntityException(`Usuário com id=${approverId} não existe ou não é um aprovador`)
    }

    const { id } = await this.prisma.report.create({
      data: {
        ...report,
        creator: {
          connect: { id: user.id }
        },
        approver: {
          connect: { id: approverId }
        }
      },
    })
    
    await this.prisma.report.update({
      where: { id },
      data: {
        code: `RPT-${id}`
      }  
    })
  }

  async findAll(pagination: Pagination, user?: PayloadStruct, status?: ReportStatus): Promise<Paginated<Report>> {
    const { page, limit, size, offset } = pagination;

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: "desc"
      },
      where: {
        ...(user ? { creatorId: user.id } : {}),
        ...(status ? { status: status } : {})
      }
    } as Prisma.ReportFindManyArgs

    const [reports, total] = await this.prisma.$transaction([
      this.prisma.report.findMany(query),
      this.prisma.report.count()
    ])

    if (total <= 0) {
      throw new NotFoundException("Nenhum relatório foi encontrado.")
    }

    return { 
      items: reports,
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page, 
      size,
    };
  }

  async findOne(id: number) {
    return this.prisma.report
    .findUniqueOrThrow({ 
      where: { id }, 
      include: {
        expenses: true,
      } 
    })
    .catch(() => { 
      throw new NotFoundException(`Relatório com id = ${id} não encontrada`) 
    })
  }

  async findOneByUser(id: number, user: PayloadStruct) {
    const report = await this.prisma.report
    .findUniqueOrThrow({ 
      where: { id }, 
      include: {
        expenses: true,
      } 
    })
    .catch(() => { 
      throw new NotFoundException(`Relatório com id = ${id} não encontrada`) 
    })

    // Usuário só pode obter os relatórios que são dele
    if (report.creatorId !== user.id) {
      throw new ForbiddenException(`Não foi possível obter o relatório com id = ${id}`) 
    }

    return report
  }

  async update(id: number, dto: UpdateReportDto) {
    await this.prisma.report
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Relatório com id = ${id} não encontrado`) }) 

    await this.prisma.report.update({
      where: { id },
      data: {
        ...dto
      }
    })
  }

  async submitForApproval(id: number) {
    const report = await this.prisma.report
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Relatório com id = ${id} não encontrado`) })
    
    const hasExpenses = await this.prisma.reportExpense.count({ where: { reportId: id }})
      
    // Não pode submeter relatório sem despesas
    if (hasExpenses < 1) {
      throw new ConflictException(`Relatório com id = ${id} não pode ser submetido, pois não possui despesas`)
    }

    if (report.status !== ReportStatus.OPEN) {
      throw new BadRequestException(`O relatório não pode ser aprovado, pois não está mais aberto.`)
    }

    await this.prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.SUBMITTED
      }
    })
  }

  async managerApproveReport(id: number) {
    const report = await this.prisma.report
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Relatório com id = ${id} não encontrado`) })

    if (report.status !== ReportStatus.SUBMITTED) {
      throw new BadRequestException(`O relatório não pode ser aprovado, pois não está com status submetido.`)
    }

    await this.prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.APPROVED
      }
    })
  }

  async financialApproveReport(id: number) {
    const report = await this.prisma.report
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Relatório com id = ${id} não encontrado`) })

    if (report.status !== ReportStatus.APPROVED) {
      throw new BadRequestException(`O relatório não pode ser pago, pois não está com status aprovado.`)
    }

    await this.prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.PENDING_PROCESSING
      }
    })
  }

  async rejectReport(id: number) {
    const report = await this.prisma.report
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Relatório com id = ${id} não encontrado`) })

    // if (![ReportStatus.SUBMITTED, ReportStatus.APPROVED].includes(report.status)) {
    //   throw new BadRequestException(`O relatório não pode ser reprovado, pois não está com status submetido ou aprovado.`)
    // }

    await this.prisma.report.update({
      where: { id },
      data: {
        status: ReportStatus.REJECTED
      }
    })
  }

  // TODO: Falta testar este endpoint de adicionar despesa
  async addExpense(id: number, expensesIDs: number[]) {
    const report: Report = await this.prisma.report.findUniqueOrThrow({ where: { id: id } });

    const expenses: Expense[] = await this.prisma.expense.findMany({ 
      where: { 
        id: { in: expensesIDs}
      }
    })

    await this.prisma.reportExpense.createMany({
      data: expenses.map(expense => ({
        reportId: report.id,
        expenseId: expense.id
      }))
    });
  }

  async getParams(userId: number) {
    const reports = await this.prisma.report.findMany({ 
      where: {
        creator: {
          id: userId
        }
      },
      select: {
        id: true,
        code: true,
        name: true
      }
    })

    return reports.map(({ id, code, name }) => ({
      id,
      param: `${code} - ${name}`
    }))
  }
}
