import { IsArray, IsDate, IsISO8601, IsInt, IsNotEmpty, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAllocationDto {
  @IsInt({ message: 'O colaborador deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O colaborador é obrigatório.' })
  @IsPositive({ message: 'O colaborador deve ser um número positivo.' })
  userId: number;

  @IsISO8601({}, { message: "A data deve estar no formato ISO 8601" })
  @IsNotEmpty({ message: 'A data de início é obrigatória.' })
  startDate: Date;

  @IsISO8601({}, { message: "A data deve estar no formato ISO 8601" })
  @IsNotEmpty({ message: 'A data estimada de fim é obrigatória.' })
  estimatedEndDate: Date;

  @IsInt({ message: 'O projeto deve ser um número inteiro.' })
  @IsNotEmpty({ message: 'O projeto é obrigatório.' })
  @IsPositive({ message: 'O projeto deve ser um número positivo.' })
  projectId: number;
}