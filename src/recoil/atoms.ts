import { atom } from "recoil";
import { selector } from "recoil";
import { MonthDataType, UserType } from "../type";

export const userState = atom<UserType>({
  key: "userState",
  default: null,
});

export const detailsTotalsState = atom({
  key: "detailsTotalsState",
  default: new Array(5).fill(0),
});

export const incomeState = atom<number>({
  key: "incomeState",
  default: 0,
});

export const fixedState = atom<number>({
  key: "fixedState",
  default: 0,
});

export const savingState = atom<number>({
  key: "savingState",
  default: 0,
});

export const yearState = atom<number>({
  key: "yearState",
  default: new Date().getFullYear(),
});

export const monthState = atom<number>({
  key: "monthState",
  default: new Date().getMonth() + 1,
});

export const monthDataState = atom<MonthDataType>({
  key: "monthDataState",
  default: null,
});

export const livingTotalState = selector({
  key: "livingTotalState",
  get: ({ get }) => {
    const detailsTotals = get(detailsTotalsState);
    return detailsTotals.reduce((acc, total) => acc + total, 0);
  },
});
