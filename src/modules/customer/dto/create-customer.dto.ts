import { IsNotEmpty, Length, Matches } from "class-validator";

export class CreateCustomerDto {
  @IsNotEmpty({ message: "O nome é obrigatório" })
  @Length(3, 255)
  name: string;

  @IsNotEmpty({ message: "O e-mail é obrigatório" })
  @Length(3, 50)
  email: string;
  
  @IsNotEmpty({ message: "O telefone é obrigatório" })
  @Matches(
    /^[0-9]{11}$/, 
    { message: 'O número de telefone deve conter 11 dígitos, incluindo o DDD e o número (formato: DDDXXXXXXXXX)' }
  )
  phone: string;
}
