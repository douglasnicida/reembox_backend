import { IsNotEmpty, Length } from "class-validator";

export class CreateJobTitleDto {
    @IsNotEmpty({message:  'Cargo do usuário não pode ser vazio.'})
    title : string;
}
