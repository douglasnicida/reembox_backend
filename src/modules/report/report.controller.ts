import { Controller, Get, Post, Body, Param, Put, HttpStatus, Patch } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { MyResponse } from '@/interceptors/response.interceptor';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { Roles } from '@/decorators/roles.decorator';
import { ReportStatus } from '@prisma/client';
import { PayloadStruct, Role } from '@/interfaces/model_types';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @MyResponse("Relatório criado com sucesso", HttpStatus.CREATED)
  @Roles(Role.USER, Role.FINANCE, Role.APPROVER)
  async create(@Body() dto: CreateReportDto, @AuthenticatedUser() user: PayloadStruct) {
    await this.reportService.create(dto, user);
  }

  @Get()
  @MyResponse("Foram encontrados {length} relatórios")
  @Roles(Role.USER, Role.FINANCE, Role.APPROVER)
  findAllByUser(@PaginationParams() pagination: Pagination, @AuthenticatedUser() user: PayloadStruct) {
    return this.reportService.findAll(pagination, user);
  }

  @Get(':id')
  @MyResponse("Relatório obtido com sucesso")
  @Roles(Role.USER)
  findOneByUser(@Param('id') id: string, @AuthenticatedUser() user: PayloadStruct) {
    return this.reportService.findOneByUser(+id, user);
  }

  @Get(':id')
  @MyResponse("Relatório obtido com sucesso")
  @Roles(Role.FINANCE, Role.APPROVER)
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  @Put(':id')
  @MyResponse("Relatório atualizado com sucesso")
  @Roles(Role.USER, Role.FINANCE, Role.APPROVER)
  async update(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    await this.reportService.update(+id, dto);
  }

  @Patch('/submit/:id')
  @MyResponse("Relatório submitido com sucesso")
  @Roles(Role.USER, Role.FINANCE, Role.APPROVER)
  async submitForApproval(@Param('id') id: string) {
    await this.reportService.submitForApproval(+id);
  }

  @Patch('/manager/approve/:id')
  @MyResponse("Relatório aprovado com sucesso")
  @Roles(Role.APPROVER)
  async managerApproveReport(@Param('id') id: string) {
    await this.reportService.managerApproveReport(+id);
  }

  @Patch('/financial/admit/:id')
  @MyResponse("Relatório enviado para processamento")
  @Roles(Role.FINANCE)
  async financialApproveReport(@Param('id') id: string) {
    await this.reportService.financialApproveReport(+id);
  }

  @Patch('/approver/reject/:id')
  @MyResponse("Relatório rejeitado com sucesso")
  @Roles(Role.APPROVER, Role.FINANCE)
  async rejectReport(@Param('id') id: string) {
    await this.reportService.rejectReport(+id);
  }

  @Get()
  @MyResponse("Foram encontrados {length} relatórios")
  @Roles(Role.APPROVER, Role.FINANCE)
  findByStatus(@PaginationParams() pagination: Pagination, @Param('status') status: ReportStatus) {
    return this.reportService.findAll(
        pagination, 
        undefined, 
        status as ReportStatus
    );
  }
} 
