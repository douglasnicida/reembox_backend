import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { MyResponse } from '@/interceptors/response.interceptor';
import { Receipt } from '@prisma/client';

@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post()
  @MyResponse("Recibo criado com sucesso.", HttpStatus.CREATED)
  async create(@Body() createReceiptDto: CreateReceiptDto) {
    const receipt: Receipt = await this.receiptService.create(createReceiptDto);
  
    return receipt.id;
  }

  @Get('/findWithExpense/:id')
  findAll(@Param('id') id: string) {
    return this.receiptService.findAll(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReceiptDto: UpdateReceiptDto) {
    return this.receiptService.update(+id, updateReceiptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receiptService.remove(+id);
  }
}
