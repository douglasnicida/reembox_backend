import { IsFQDN, IsNotEmpty, IsNumber, IsNumberString, IsString, Length, Matches } from "class-validator";
import { Transform } from "class-transformer";
import { isCNPJ } from "@/validators/br-documents.decorator";

export class Address {
  @IsNotEmpty({ message: "A rua é obrigatória" })
  street: string

  @IsNotEmpty({ message: "O bairro é obrigatório" })
  neighbor: string;

  @IsNotEmpty({ message: "O complemento é obrigatório" })
  complement: number;

  @IsNotEmpty({  message: "O número é obrigatório" })
  @IsNumber({}, { message: "Deve ser um número inteiro"})
  number: number;

  @IsNotEmpty({ message: "A cidade é obrigatória" })
  @IsString({ message: "A cidade deve ser um texto" })
  city: string;

  @IsNotEmpty({ message: "O estado é obrigatório" })
  @IsString({ message: "O estado deve ser um texto" })
  uf: string;

  @IsNotEmpty({ message: 'O CEP é obrigatório.' })
  @Length(8, 8)
  cep: string;
}

export class CreateCompanyDto {
  @IsNotEmpty({message: "O CNPJ é obrigatório"})
  // @isCNPJ()
  @Length(14, 14)
  cnpj: string

  @IsNotEmpty({ message: "O nome da empresa é obrigatório" })
  @Length(3, 80, { message: "O tamanho deve ser entre 3 e 80"})
  name: string

  @IsFQDN()
  @IsNotEmpty({ message: "O website é obrigatório" })
  website: string

  @IsNotEmpty({ message: "O ano de fundação da empresa é obrigatório" })
  @IsNumberString({}, { message: "O ano de fundação da empresa deve ser um inteiro" })
  @Matches(/^(19|20)\d{2}$/, { message: "O ano de fundação da empresa deve ter 4 dígitos" })
  founded_year: string

  @IsNotEmpty({ message: "O endereço é obrigatório" })
  address: Address
}
