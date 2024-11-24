import { IsNotEmpty, IsOptional, Length, Matches } from "class-validator";

export class ApprovalRagDto {
  @IsOptional()
  @Length(3, 255)
  remarks?: string;

  @IsNotEmpty({ message: "O modelo de treinamento é obrigatório" })
  @Length(3, 255)
  llmModel: string;

  @IsNotEmpty({ message: "O modelo de embedding é obrigatório" })
  @Length(3, 255)
  embeddingModel: string;
}
