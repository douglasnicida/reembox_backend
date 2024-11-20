import { Expense, User } from "@prisma/client";

type ApproverFormat = {
    id: number;
    name: string;
}

export class ReportParamsDto {
    approvers: ApproverFormat[];
    expenses: Expense[];
}