import { Controller, Get, Post, Body, Patch, Param, HttpStatus } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { PayloadStruct, Role } from '@/interfaces/model_types';
import { Roles } from '@/decorators/roles.decorator';
import { MyResponse } from '@/interceptors/response.interceptor';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { FilterParams, QueryFilter } from '@/decorators/filter.decorator';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';
import { CreateAllocationDto } from './dto/create-allocation.dto';

@Controller('allocations')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.APPROVER)
  @MyResponse("Alocação criada com sucesso", HttpStatus.CREATED)
  async create(@Body() dto: CreateAllocationDto) {
    await this.allocationService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.APPROVER)
  @MyResponse("Foram encontrados {length} alocações")
  findAll(
    @PaginationParams() pagination: Pagination, 
    @FilterParams() filter: QueryFilter, 
    @AuthenticatedUser() user: PayloadStruct) {
    return this.allocationService.findAll(pagination, filter, user.companyID);
  }

  @Get('/my')
  @MyResponse("Foram encontrados {length} alocações")
  findAllByUser(
    @PaginationParams() pagination: Pagination, 
    @FilterParams() filter: QueryFilter,
    @AuthenticatedUser() user: PayloadStruct) {
    return this.allocationService.findAllByUser(pagination, filter, user.userID);
  }

  @Get('/params')
  @Roles(Role.ADMIN, Role.APPROVER)
  @MyResponse("Foram encontrados {length} parâmetros na criação de alocação")
  getParams(@AuthenticatedUser() user: PayloadStruct) {
    return this.allocationService.getParams(user.companyID)
  }

  @Get(':id')
  @MyResponse("Alocação obtida com sucesso")
  findOne(@Param('id') projectId: number) {
    return this.allocationService.findOne(+projectId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.APPROVER)
  @MyResponse("Alocação finalizada com sucesso")
  async update(@Param('id') id: string, @Body() dto: UpdateAllocationDto) {
    await this.allocationService.finalizeAllocation(+id, dto);
  }
}
