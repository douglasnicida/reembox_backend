import { IsDate, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAllocationDto } from './create-allocation.dto';

export class UpdateAllocationDto extends PartialType(CreateAllocationDto) {
  @IsDate({ message: 'A endDate deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A endDate é obrigatória.' })
  endDate: Date;
}