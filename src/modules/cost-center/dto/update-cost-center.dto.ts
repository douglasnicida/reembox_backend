import { PartialType } from '@nestjs/mapped-types';
import { CreateCostCenterDto } from './create-cost-center.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateCostCenterDto extends PartialType(CreateCostCenterDto) {
    @IsNotEmpty()
    description: string;
}
