import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDTO {
    @IsNotEmpty({message: "E-mail obrigatório"})
    @IsEmail()
    email: string;
    
    @IsNotEmpty({message: "Senha obrigatória"})
    password: string;

}