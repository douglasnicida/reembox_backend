import { Controller, Get, Post, Body, Put, Param, HttpStatus, Query, Patch } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { MyResponse } from '@/interceptors/response.interceptor';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { PayloadStruct, Role } from '@/interfaces/model_types';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @MyResponse("Despesa criada com sucesso", HttpStatus.CREATED)
  @Roles(Role.USER, Role.FINANCE, Role.APPROVER)
  async create(@Body() dto: CreateExpenseDto, @AuthenticatedUser() user: PayloadStruct) {
    return await this.expenseService.create(dto, user);
  }

  @Get()
  @MyResponse("Foram encontradas {length} despesas")
  @Roles(Role.FINANCE, Role.APPROVER)
  findAll(@PaginationParams() pagination: Pagination, @AuthenticatedUser() user: PayloadStruct) {
    return this.expenseService.findAll(pagination, user);
  }

  @Get('/findAllByCompany')
  @MyResponse("Foram encontradas {length} despesas")
  @Roles(Role.FINANCE, Role.APPROVER)
  findAllByCompany(@AuthenticatedUser() user: PayloadStruct) {
    return this.expenseService.findAllByCompany(user);
  }
  
  @MyResponse("Parâmetros da despesa obtidos com sucesso")
  @Get('/params')
  findParams(@AuthenticatedUser() user: PayloadStruct) {
    return this.expenseService.findParams(user)
  }

  @Get(':id')
  @MyResponse("Despesa obtida com sucesso")
  @Roles(Role.FINANCE, Role.APPROVER)
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(+id);
  }

  @Put(':id')
  @MyResponse("Despesa atualizada com sucesso")
  @Roles(Role.USER, Role.FINANCE, Role.APPROVER)
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto, @AuthenticatedUser() user: PayloadStruct) {
    await this.expenseService.update(+id, dto, user);
  }

  @Patch('/addExpenseToReport/:id')
  @MyResponse("Despesa adicionada ao relatório com sucesso")
  @Roles(Role.FINANCE, Role.APPROVER, Role.USER)
  async addExpenseToReport(
    @Body() dto: UpdateExpenseDto,
    @Param('id') id: string,
    @AuthenticatedUser () user: PayloadStruct
  ) {
    // Chama o método do serviço para adicionar a despesa ao relatório
    const expense = await this.expenseService.findOne(+id); // Supondo que você tenha um método para encontrar a despesa pelo ID
    if (!expense) {
      throw new Error('Despesa não encontrada.');
    }

    return await this.expenseService.addExpensesToReport(dto, expense);
  }
}
