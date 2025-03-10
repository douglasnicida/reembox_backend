import { BadRequestException, ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from 'prisma/service/prisma.service';
import { Expense, Prisma, ReportExpense } from '@prisma/client';
import { Paginated, Pagination } from '@/decorators/pagination.decorator';
import { PayloadStruct } from '@/interfaces/model_types';
import { CostCenterService } from '../cost-center/cost-center.service';
import { ProjectService } from '../project/project.service';
import { ExpenseCategoryService } from '../expense-category/expense-category.service';
import { ReportService } from '../report/report.service';
import { ExpenseParamsDto } from './dto/response-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private readonly costCenterService: CostCenterService,
    private readonly projectService: ProjectService,
    private readonly expenseCategoryService: ExpenseCategoryService,
    @Inject(forwardRef(() => ReportService)) private readonly reportService: ReportService
  ) {}

  async create(dto: CreateExpenseDto, user: PayloadStruct) {
    // Cria a despesa
    const expense: Expense = await this.prisma.expense.create({
      data: await this.upsert(dto, user)
    })

    if (dto.reportId) {
      await this.addExpensesToReport(dto, expense)
    }

    return expense.id;
  }

  async findAll(pagination: Pagination, user: PayloadStruct): Promise<Paginated<Expense>> {
    const { page, limit, size, offset } = pagination;

    const query = {
      skip: offset,
      take: limit,
      orderBy: {
        expenseDate: "desc"
      },
      where: {
        companyId: user.companyID
      },
      select: {
        id: true,
        expenseDate: true,
        value: true,
        quantity: true,
        project: {
          select: {
            key: true,
          }
        },
        costCenter: {
          select: {
            code: true
          }
        },
        category: {
          select: {
            description: true
          }
        }
      }
    } satisfies Prisma.ExpenseFindManyArgs

    const [expenses, total] = await this.prisma.$transaction([
      this.prisma.expense.findMany(query),
      this.prisma.expense.count({where: query.where})
    ])

    if (total <= 0) {
      throw new NotFoundException("Nenhuma despesa foi encontrada.")
    }

    return { 
      items: expenses,
      totalItems: total, 
      totalPages: Math.ceil(total / limit), 
      currentPage: page, 
      size,
    };
  }

  async findAllByCompany(user: PayloadStruct) {

    const expenses = await this.prisma.expense.findMany({
      orderBy: {
        expenseDate: "desc"
      },
      where: {
        companyId: user.companyID
      },
      include: {
        project: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            description: true
          }
        }
      }
    });
    return expenses;
  }
  
  async findOne(id: number) {
    const expense = await this.prisma.expense
    .findUniqueOrThrow({ 
      where: { id } ,
      include: {
        project: {select: {id: true, name: true}},
        costCenter: {select: {id: true, description: true}},
        category: {select: {id: true, description: true}},
      }
    })
    .catch(() => { 
      throw new NotFoundException(`Despesa com id = ${id} não encontrada`) 
    })

    const receipts = await this.prisma.receipt.findMany({where: {expenseId: id}})
    return {
      ...expense,
      receipts
    }
  }

  async update(id: number, dto: UpdateExpenseDto, user: PayloadStruct) {
    const expense: Expense = await this.prisma.expense
      .findUniqueOrThrow({ where: { id } })
      .catch(() => { throw new NotFoundException(`Despesa com id = ${id} não encontrado`) }) 

    await this.prisma.expense.update({
      where: { id },
      data: await this.upsert(dto, user)
    })

    // alterando valor dos totais após atualização de valores
    const reportExpenses: ReportExpense[] = await this.prisma.reportExpense.findMany({
      where: {
        expenseId: id,
      }
    })

    const totalDiff = (dto.quantity * dto.value) - (expense.quantity * expense.value)

    reportExpenses.forEach(async (reportExpense: ReportExpense) => {
      const currentReport = await this.prisma.report.findUnique({
        where: { id: reportExpense.reportId },
      });

      if (currentReport) {
        const newTotal = currentReport.total + totalDiff
        const newReport = await this.prisma.report.update({
          where: { id: reportExpense.reportId },
          data: {
            total: newTotal
          }
        })
      }
      
    })

    
    // if (dto.reportId) {
    //   await this.addExpensesToReport(dto, expense)
    // }
  }

  private async upsert(dto: CreateExpenseDto | UpdateExpenseDto, user: PayloadStruct) {
    const { projectId, costCenterId, categoryId, reportCode, ...rest } = dto

    await this.prisma.costCenter
      .findUniqueOrThrow({ where: { id: costCenterId } })
      .catch(() => { 
        throw new NotFoundException(`Centro de custo com id = ${costCenterId} não foi encontrado`) 
      })

    await this.prisma.project
      .findUniqueOrThrow({ where: { id: projectId } })
      .catch(() => { 
        throw new NotFoundException(`Projeto com id = ${costCenterId} não foi encontrado`) 
      })

    await this.prisma.expenseCategory
      .findUniqueOrThrow({ where: { id: categoryId } })
      .catch(() => { 
        throw new NotFoundException(`Categoria de despesa com id = ${costCenterId} não foi encontrado`) 
      })
      
    if (dto.reportId) {
      await this.prisma.report
      .findUniqueOrThrow({ where: { id: dto.reportId } })
      .catch(() => { 
        throw new NotFoundException(`Relatório com id = ${dto.reportId} não foi encontrado`) 
      })
    }

    return {
      ...rest,
      costCenter: {
        connect: { id: costCenterId }
      },
      project: { 
        connect:  { id : projectId }
      },
      company: {  
        connect: { id: user.companyID }
      },
      category: {
        connect: { id: categoryId }
      },
    } as Prisma.ExpenseCreateInput;
  }

  async addExpensesToReport(dto: CreateExpenseDto | UpdateExpenseDto, expense: Expense) {
    // Verificar se a relação entre a despesa e o relatório já existe
    if(dto.reportId) {
      const existingRelation = await this.prisma.reportExpense.findUnique({
        where: {
            // Supondo que você tenha uma combinação única de reportCode e expenseId
            expenseId_reportId: {
                reportId: dto.reportId,
                expenseId: expense.id
            }
        }
      });

      // Se a relação já existir, podemos optar por não fazer nada ou lançar um erro
      if (existingRelation) {
          throw new ConflictException('A relação entre a despesa e o relatório já existe.');
      }
    }
    
    const report = await this.prisma.report.findUnique({ where: { id: dto.reportId } });
    if(report.status != 'OPEN'){
      throw new BadRequestException('O relatório não está aberto.');
    }

    // Se não existir, prosseguir com a criação da relação
    const { expense: createdExpense } = await this.prisma.reportExpense.create({
        data: {
            expense: { 
                connect: { id: expense.id }
            },
            report: { 
                connect: { id: dto.reportId }
            }
        },
        include: {
            expense: {
                select: {
                    value: true,
                    quantity: true
                }
            }
        }
    });

    // Calcular valor total das despesas

    report.total += createdExpense.quantity * createdExpense.value;

    await this.prisma.report.update({
        where: { id: report.id },
        data: {
            total: report.total
        }
    });
}

  async findParams(user: PayloadStruct): Promise<ExpenseParamsDto> {
    const costCenters = await this.costCenterService.getParams(user.companyID)
    const projects = await this.projectService.getParams(user.companyID)
    const categories = await this.expenseCategoryService.getParams(user.companyID)
    const reports = await this.reportService.getParams(user.id)

    return {
      costCenters,
      projects,
      categories,
      reports
    }
  }
}
