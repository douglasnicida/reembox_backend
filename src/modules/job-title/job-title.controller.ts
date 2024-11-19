import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { JobTitleService } from './job-title.service';
import { CreateJobTitleDto } from './dto/create-job-title.dto';
import { UpdateJobTitleDto } from './dto/update-job-title.dto';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { PayloadStruct } from '@/interfaces/model_types';
import { MyResponse } from '@/interceptors/response.interceptor';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';

@Controller('job-titles')
export class JobTitleController {
  constructor(private readonly jobTitleService: JobTitleService) {}

  @Post()
  @MyResponse("Cargo criado com sucesso")
  create(@Body() dto: CreateJobTitleDto, @AuthenticatedUser() user: PayloadStruct) {
    return this.jobTitleService.create(dto, user.companyID);
  }

  @Get(':id')
  @MyResponse("Cargo obtido com sucesso")
  findOne(@Param('id') id: string) {
    return this.jobTitleService.findOne(+id);
  }

  @Get()
  @MyResponse("Foram encontrados {length} cargos")
  async findAll(
    @PaginationParams() pagination: Pagination, 
    @Query('q') description: string,  
    @AuthenticatedUser() user: PayloadStruct
  ) {  
    return this.jobTitleService.findAll(
      pagination, 
      description, 
      user.companyID
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJobTitleDto, @AuthenticatedUser() user: PayloadStruct) {
    return this.jobTitleService.update(+id, user.companyID, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobTitleService.remove(+id);
  }
}
