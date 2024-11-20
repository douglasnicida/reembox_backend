import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { MyResponse } from '@/interceptors/response.interceptor';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @MyResponse("Empresa criada com sucesso", HttpStatus.CREATED)
  async create(@Body() dto: CreateCompanyDto) {
    await this.companyService.create(dto);
  }

  @Get()
  @MyResponse("Foram encontradas {length} empresas")
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @MyResponse("Empresa obtida com sucesso")
  findOne(@Param('id') id: number) {
    return this.companyService.findOne(+id);
  }

  @Patch(':id')
  @MyResponse("Empresa atualizada com sucesso")
  update(@Param('id') id: number, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(+id, dto);
  }

  @Delete(':id')
  @MyResponse()
  remove(@Param('id') id: number) {
    return this.companyService.remove(+id);
  }
}
