import { IsDefined, IsISO8601, IsInt, IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, IsPositive } from "class-validator";

export class CreateExpenseDto {
  @IsNotEmpty({ message: "A data de criação é obrigatória" })
  @IsISO8601({}, { message: "A data deve estar no formato ISO 8601" })
  expenseDate: Date;

  @IsNotEmpty({ message: "Valor é obrigatório" })
  @IsNumber({ maxDecimalPlaces: 4 }, { message: "Valor deve ser um número"})
  @IsPositive({ message: "Valor deve ser um número positivo" })
  value: number;

  @IsNotEmpty({ message: "Quantidade é obrigatória" })
  @IsPositive({ message: "Valor deve ser um número positivo" })
  @IsInt({ message: "Valor deve ser um número inteiro" })
  quantity: number;

  @IsDefined({ message: "Notas é obrigatória" })
  notes: string;

  @IsOptional({ message: "Código do relatório deve existir" })
  reportCode?: string;

  // @IsNotEmpty({message: "Deve existir pelo menos um comprovante de pagamento"})
  receiptIds: number[];

  @IsNotEmpty({ message: "Centro de Custo é obrigatório" })
  @IsPositive({ message: "Centro de Custo deve ser um ID numérico" })
  @IsInt({ message: "Centro de Custo deve ser um ID numérico" })
  costCenterId: number;

  @IsNotEmpty({ message: "Projeto é obrigatório" })
  @IsPositive({ message: "Projeto deve ser um ID numérico" })
  @IsInt({ message: "Projeto deve ser um ID numérico" })
  projectId: number;

  @IsNotEmpty({ message: "Categoria da despesa é obrigatória" })
  @IsPositive({ message: "Categoria da despesa deve ser um ID numérico" })
  @IsInt({ message: "Categoria da despesa deve ser um ID numérico" })
  categoryId: number;
}