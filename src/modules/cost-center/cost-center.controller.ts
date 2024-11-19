import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CostCenterService } from './cost-center.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { PayloadStruct } from '@/interfaces/model_types';
import { MyResponse } from '@/interceptors/response.interceptor';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';
import { FilterParams, QueryFilter } from '@/decorators/filter.decorator';

@Controller('cost-centers')
export class CostCenterController {
  constructor(private readonly costCenterService: CostCenterService) {}

  @Post()
  @MyResponse('Centro de custo criado com sucesso!')
  async create(@Body() dto: CreateCostCenterDto, @AuthenticatedUser() user: PayloadStruct) {
    await this.costCenterService.create(dto, user.companyID);
  }

  @Get(':id')
  @MyResponse('Centro de custo retornado com sucesso!')
  findOne(@Param('id') id: string) {
    return this.costCenterService.findOne(+id);
  }

  @Get()
  @MyResponse("Foram encontrados {length} centro de custos.")
  findAll(
    @FilterParams() filter: QueryFilter,
    @PaginationParams() pagination: Pagination, 
    @AuthenticatedUser() user: PayloadStruct)
  {
    return this.costCenterService.findAll(pagination, filter, user.companyID);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCostCenterDto) {
    return this.costCenterService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costCenterService.remove(+id);
  }
}
