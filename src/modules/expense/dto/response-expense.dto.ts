type ExpenseParam = {
  id: number;
  param: string;
}

export class ExpenseParamsDto {
  costCenters: ExpenseParam[];
  projects: ExpenseParam[]
  categories: ExpenseParam[];
  reports: ExpenseParam[];
}