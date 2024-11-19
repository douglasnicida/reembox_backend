import { Roles } from "@prisma/client";
import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({message: 'Nome é obrigatório.'})
    name: string;

    @IsNotEmpty({message: 'Número de telefone é obrigatório.'})
    @Length(11, 11, {message:  'Número de telefone inválido.'})
    phone:  string;

    cpf: string;

    // @IsNotEmpty({message: 'Vínculo com empresa obrigatório.'})
    // companyID: number;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    role: Roles;
}
