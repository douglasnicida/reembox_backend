import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseCategoryDto } from './create-expense-category.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateExpenseCategoryDto extends PartialType(CreateExpenseCategoryDto) {
    @IsNotEmpty()
    description: string;
}
