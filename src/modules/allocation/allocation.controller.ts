import { Controller, Get, Post, Body, Patch, Param, HttpStatus } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { CreateAllocationsDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { PayloadStruct, Role } from '@/interfaces/model_types';
import { Roles } from '@/decorators/roles.decorator';
import { MyResponse } from '@/interceptors/response.interceptor';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { FilterParams, QueryFilter } from '@/decorators/filter.decorator';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';

@Controller('allocations')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.APPROVER)
  @MyResponse("Alocação criada com sucesso", HttpStatus.CREATED)
  async create(@Body() dto: CreateAllocationsDto) {
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

  @Patch(':id')
  @Roles(Role.ADMIN, Role.APPROVER)
  @MyResponse("Alocação finalizada com sucesso")
  async update(@Param('id') id: string, @Body() dto: UpdateAllocationDto) {
    await this.allocationService.finalizeAllocation(+id, dto);
  }
}
