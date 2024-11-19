import { IsNotEmpty } from "class-validator";

export class CreateReportDto {
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name: string;

  @IsNotEmpty({ message: "Objetivo do relatório é obrigatório" })
  goal: string;

  @IsNotEmpty({ message: "Aprovador do relatório é obrigatório" })
  approverId: number;
}
