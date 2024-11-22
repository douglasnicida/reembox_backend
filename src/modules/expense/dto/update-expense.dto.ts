import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
    notes?: string;
    categoryId?: number;
    quantity?: number;
    value?: number;
    reportId?: number;
    expenseDate?: Date;
}
