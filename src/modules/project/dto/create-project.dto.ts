import { IsNotEmpty, IsNumber, Length } from "class-validator";

export class CreateProjectDto {
  @IsNotEmpty({ message: "O nome é obrigatório" })
  @Length(3, 255)
  name: string;

  @IsNotEmpty({ message: "A chave do projeto é obrigatória" })
  @Length(2, 10)
  key: string;

  @IsNotEmpty({ message: "O cliente é obrigatório" })
  @IsNumber({}, { message: "Deve ser um ID numérico" })
  customerId: number;
}
