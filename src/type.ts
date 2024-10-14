export type TransactionType = {
  id: number;
  amount: number;
  date: number;
  description: string;
  type: string;
} | null;

export type MonthDataType = {
  id?: number;
  month?: number;
  year?: number;
  budget?: number;
  note?: string;
  transactions?: TransactionType[];
} | null;

export type UserType = {
  id: number;
  nickname: string;
  email: string;
  months: MonthDataType[];
} | null;
