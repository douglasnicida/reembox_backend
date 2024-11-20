import { Injectable } from '@nestjs/common';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { PrismaService } from 'prisma/service/prisma.service';

@Injectable()
export class ReceiptService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createReceiptDto: CreateReceiptDto) {

    return await this.prismaService.receipt.create({
      data: createReceiptDto,
    });
  }

  findAll() {
    return `This action returns all receipt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} receipt`;
  }

  update(id: number, updateReceiptDto: UpdateReceiptDto) {
    return this.prismaService.receipt.update({data: updateReceiptDto, where: {id}});
  }

  remove(id: number) {
    return `This action removes a #${id} receipt`;
  }
}
