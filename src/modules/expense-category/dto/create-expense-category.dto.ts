import { IsNotEmpty } from "class-validator";

export class CreateExpenseCategoryDto {
    @IsNotEmpty()
    description: string;
    
    active?: boolean;
}
