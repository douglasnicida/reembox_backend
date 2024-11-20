import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { IsFQDN, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  cpnj?: never;
  founded_year?: never;
}
