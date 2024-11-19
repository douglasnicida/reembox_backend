import { User } from "@prisma/client";

export enum Role {
  ADMIN = 'ADMIN',
  SUPERUSER = 'SUPERUSER',
  FINANCE = 'FINANCE',
  APPROVER = 'APPROVER',
  USER = 'USER',
}

export interface IAuthenticate {
  readonly user: User;
  readonly token: string;
}

export interface PayloadStruct{
  id: number;
  email: string;
  companyID: number;
  userID: number;
}