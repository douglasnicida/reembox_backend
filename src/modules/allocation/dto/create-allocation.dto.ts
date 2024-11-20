import { IsArray, IsDate, IsInt, IsNotEmpty, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAllocationDto {
  @IsInt({ message: 'O userId deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O userId é obrigatório.' })
  @IsPositive({ message: 'O userId deve ser um número positivo.' })
  userId: number;

  @IsDate({ message: 'A startDate deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A startDate é obrigatória.' })
  startDate: Date;

  @IsDate({ message: 'A estimatedEndDate deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A estimatedEndDate é obrigatória.' })
  estimatedEndDate: Date;
}

export class CreateAllocationsDto {
  @IsInt({ message: 'O projectId deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O projectId é obrigatório.' })
  @IsPositive({ message: 'O projectId deve ser um número positivo.' })
  projectId: number;

  @IsArray({ message: 'Os colaboradores devem ser fornecidos como um array.' })
  @ValidateNested({ each: true })
  @Type(() => CreateAllocationDto)
  allocations: CreateAllocationDto[];
}