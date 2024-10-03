import { atom } from "recoil";
import { selector } from "recoil";

export const userState = atom({
  key: "userState",
  default: {
    nickname: "",
    email: "",
    id: "",
  },
});

export const detailsTotalsState = atom({
  key: "detailsTotalsState",
  default: new Array(5).fill(0),
});

export const incomeState = atom({
  key: "incomeState",
  default: 0,
});

export const fixedState = atom({
  key: "fixedState",
  default: 0,
});

export const savingState = atom({
  key: "savingState",
  default: 0,
});

export const yearState = atom({
  key: "yearState",
  default: new Date().getFullYear().toString(),
});

export const monthState = atom({
  key: "monthState",
  default: new Date().getMonth() + 1,
});

export const dataByDateState = atom({
  key: "dataByDateState",
  default: {},
});

export const livingTotalState = selector({
  key: "livingTotalState",
  get: ({ get }) => {
    const detailsTotals = get(detailsTotalsState);
    return detailsTotals.reduce((acc, total) => acc + total, 0);
  },
});
