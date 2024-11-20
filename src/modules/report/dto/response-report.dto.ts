import { Expense } from "@prisma/client";

export type ApproverFormat = {
    id: number;
    name: string;
}

export class ReportParamsDto {
    approvers: ApproverFormat[];
    expenses: Expense[];
}