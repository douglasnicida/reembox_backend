import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { Paginated, Pagination } from '@/decorators/pagination.decorator';
import { Expense, Prisma, Report, ReportExpense, ReportStatus } from '@prisma/client';
import { PayloadStruct, Role } from '@/interfaces/model_types';
import { ApproverFormat, ReportParamsDto } from './dto/response-report.dto';
import { ExpenseService } from '../expense/expense.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
    private readonly expenseService: ExpenseService,
    private readonly userService: UserService
  ) {}

  async create(dto: CreateReportDto, user: PayloadStruct) {
    const { approverID, expensesIds, ...report } = dto;

    const { id } = await this.prisma.report.create({
      data: {
        ...report,
        creator: {
          connect: { id: user.userID }
        },
        approver: {
          connect: { id: approverID }
        },
        total: 0,
        status: ReportStatus.OPEN
      },
    });
  
    await this.prisma.report.update({
      where: { id },
      data: {
        code: `RPT-${id}`
      }  
    });
  
    if (expensesIds.length > 0) {
      const expenses = await this.prisma.expense.findMany({
        where: {
          id: { in: expensesIds }
        }
      });
  
      // Verifique se todas as despesas foram encontradas
      if (expenses.length !== expensesIds.length) {
        throw new NotFoundException('Algumas despesas não foram encontradas.');
      }
  
      // Crie as associações entre o relatório e as despesas
      await this.prisma.reportExpense.createMany({
        data: expenses.map(expense => ({
          reportId: id,
          expenseId: expense.id
        }))
      });

      // atualizando valor do total do relatório
      await this.prisma.report.update({
        data: {
          total: expenses.reduce((acc, expense) => acc + (expense.value * expense.quantity), 0)
        },
        where: {
          id
        }
      })
    }
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
        ...(user ? { creator: {companyId: user.companyID} } : {}),
        ...(status ? { status: status } : {})
      },
      include: {
        creator: { select: { name: true } },
        approver: { select: { name: true } },
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

  async findAllByCreator(pagination: Pagination, user: PayloadStruct, status?: ReportStatus): Promise<Paginated<Report>> {
    const { page, limit, size, offset } = pagination;

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        updatedAt: "desc"
      },
      where: {
        AND: [
          {creatorId: user.userID},
          {...(status ? { status: status } : {})}
        ]
      },
      include: {
        creator: { select: { name: true } },
        approver: { select: { name: true } },
      }
    } as Prisma.ReportFindManyArgs

    const [reports, total] = await this.prisma.$transaction([
      this.prisma.report.findMany(query),
      this.prisma.report.count({
        where: {
          AND: [
            {creatorId: user.userID},
            {...(status ? { status: status } : {})}
          ]
        }
      })
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

  async findAllByCompany(user: PayloadStruct, query?: any) {

    if(!user) { throw new NotFoundException('Usuário não autenticado.') }
    const findManyQuery = {
      where: {
        creator: { companyId: user.companyID },
        ...(query.year && {
          createdAt: {
            gte: new Date(`${query.year}-01-01T00:00:00Z`), // Data de início do ano
            lt: new Date(`${Number(query.year) + 1}-01-01T00:00:00Z`) // Data de início do próximo ano
          }
        })
      }
    } as Prisma.ReportFindManyArgs
    
    const reports = await this.prisma.report.findMany(findManyQuery);
    
    return reports;
  }

  async findOne(id: number) {
    return this.prisma.report
    .findUniqueOrThrow({ 
      where: { id }, 
      include: {
        expenses: {
          select: {expense: true}, 
        },
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
    const report = await this.prisma.report
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Relatório com id = ${id} não encontrado`) }) 

    if(report.status != 'OPEN') { throw new ForbiddenException('Não é possível atualizar um relatório fechado.') }

    await this.prisma.report.update({
      where: { id },
      data: {
        ...dto
      }
    })
  }

  async approvedReports(user: PayloadStruct) {

    const { role } = await this.prisma.auth.findUniqueOrThrow({
      where: {
        userId: user.userID
      },
      select: {
        role: true
      }
    });

    if(!role || (role != Role.FINANCE && role != Role.ADMIN)) throw new NotFoundException('Financeiro não encontrado')

    const reports = await this.prisma.report.findMany({
      where: {
        creator: { companyId: user.companyID },
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        goal: true,
        createdAt: true,
        total: true,
        status: true,
        approver: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            name: true
          }
        }
      }
    })

    return reports;
  }

  async underApprove(approverID: number){

    const approver = await this.userService.findOneById(approverID);

    if(!approver) throw new NotFoundException('Aprovador não encontrado')

    const reports = await this.prisma.report.findMany({
      where: {
        approverId: approver.id,
        status: 'SUBMITTED'
      },
      select: {
        id: true,
        name: true,
        goal: true,
        createdAt: true,
        total: true,
        status: true,
        approver: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            name: true
          }
        }
      }
    })

    return reports;
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

  async reOpenRejectedReport(id: number) {
    const report = await this.prisma.report.findUnique({where: {id} });

    if(!report) {
      throw new NotFoundException('Nenhum relatório encontrado.')
    }

    if(report.status !== 'REJECTED') {
      throw new ForbiddenException('Relatório não possui status de rejeitado para essa ação.')
    }

    await this.prisma.report.update({
      data: {
        status: 'OPEN'
      },
      where: {
        id: report.id
      }
    });
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

    // atualizando valor do total do relatório
    await this.prisma.report.update({
      data: {
        total: expenses.reduce((acc, expense) => acc + (expense.value * expense.quantity), report.total)
      },
      where: {
        id
      }
    })
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
        name: true,
      }
    })

    return reports.map(({ id, code, name }) => ({
      id,
      param: `${code} - ${name}`
    }))
  }

  async findParams(user: PayloadStruct): Promise<ReportParamsDto> {
    const approvers: ApproverFormat[] = await this.userService.getApprovers(user.companyID)
    const expenses: any[] = await this.expenseService.findAllByCompany(user)
    return { approvers, expenses }
  }

  async delete(id: number){
    const report = await this.prisma.report.findFirstOrThrow({where: {id}})

    await this.prisma.report.delete({where: {id: report.id}})
  }
}
