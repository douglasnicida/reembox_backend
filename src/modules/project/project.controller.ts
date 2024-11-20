import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { MyResponse } from '@/interceptors/response.interceptor';
import { Pagination, PaginationParams } from '@/decorators/pagination.decorator';
import { AuthenticatedUser } from '@/decorators/auth-user.decorator';
import { PayloadStruct } from '@/interfaces/model_types';
import { FilterParams, QueryFilter } from '@/decorators/filter.decorator';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @MyResponse("Projeto criado com sucesso", HttpStatus.CREATED)
  async create(@Body() dto: CreateProjectDto, @AuthenticatedUser() user: PayloadStruct) {
    await this.projectService.create(dto, user.companyID);
  }

  @Get()
  @MyResponse("Foram encontrados {length} projetos")
  findAll(
    @FilterParams() filter: QueryFilter, 
    @PaginationParams() pagination: Pagination, 
    @AuthenticatedUser() user: PayloadStruct
  ) {
    return this.projectService.findAll(pagination, filter, user.companyID);
  }

  @Get(':id')
  @MyResponse("Projeto obtido com sucesso")
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Patch(':id')
  @MyResponse("Projeto atualizado com sucesso")
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    await this.projectService.update(+id, dto);
  }

  @Delete(':id')
  @MyResponse()
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
