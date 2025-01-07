import axios from "axios";
import React, {
  forwardRef,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { BASE_URL } from "../config/config";
import { MonthDataType, UserType } from "../type";
import { DETAIL_CATEGORIES } from "./../pages/Main";
import { useSetRecoilState } from "recoil";
import { loadingState } from "../recoil/atoms";

export type PropsType = {
  setMonthData: React.Dispatch<React.SetStateAction<MonthDataType>>;
  monthData: MonthDataType;
  year: number;
  month: number;
  user: UserType;
};

const TransactionForm = forwardRef<HTMLDivElement, PropsType>(
  ({ setMonthData, monthData, user, year, month }: PropsType, ref) => {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState<number | "">("");
    const [categoryTitle, setCategoryTitle] = useState<string>("고정 지출");
    const dateRef = useRef<HTMLInputElement | null>(null);
    const setLoading = useSetRecoilState(loadingState);

    const addTransaction = async (e: SyntheticEvent) => {
      e.preventDefault();
      if (!description || Number(amount) <= 0) return;
      setLoading(true);
      const newTransaction = {
        date: date || 0,
        amount: parseFloat(amount),
        description,
        type: categoryTitle,
      };

      try {
        const response = await axios.post(
          `${BASE_URL}/api/add`,
          newTransaction,
          {
            params: {
              monthId: monthData?.id || null,
              userId: user?.id,
              year: year,
              month: month,
            },
          }
        );

        setAmount("");
        setDate("");
        setDescription("");

        setMonthData((prev) => {
          if (prev?.transactions) {
            return {
              ...prev,
              transactions: [...prev.transactions, response.data],
            };
          }
          return prev;
        });
        if (dateRef.current) dateRef.current.focus();
      } catch (err) {
        console.error("transaction add error", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (dateRef.current) dateRef.current.focus();
    }, [dateRef]);

    return (
      <TransactionFormContainer ref={ref}>
        <Form onSubmit={addTransaction}>
          <Input
            ref={dateRef}
            type="number"
            placeholder="날짜"
            value={date}
            onChange={(e: { target: { value: any } }) => {
              const value = e.target.value;
              setDate(Number(value) > 31 ? Number(value) % 10 : Number(value));
            }}
          />
          <Input
            type="text"
            placeholder="상세"
            value={description}
            onChange={(e: {
              target: { value: React.SetStateAction<string> };
            }) => setDescription(e.target.value)}
          />
          <Input
            type="number"
            placeholder="비용"
            value={amount}
            min="0"
            onChange={(e: {
              target: { value: React.SetStateAction<string> };
            }) => setAmount(e.target.value)}
          />
          <Select
            value={categoryTitle}
            onChange={(e) => setCategoryTitle(e.target.value)}
          >
            {DETAIL_CATEGORIES.concat(["수입", "고정 지출", "저축"])
              .sort((a, b) => a.localeCompare(b))
              .map((category) => (
                <option key={category}>{category}</option>
              ))}
          </Select>
          <Button type="submit">+</Button>
        </Form>
      </TransactionFormContainer>
    );
  }
);

export default TransactionForm;

const TransactionFormContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #2c3e50;
  opacity: 0.7;
  padding: 20px;
  border-radius: 10px;
  width: 20%;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 480px) {
    width: 50%;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
`;

const Input = styled.input`
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 16px;
  width: 100%;
  margin-bottom: 10px;
  outline: none;
  &:focus {
    border-color: #4b9fef;
  }
`;

const Select = styled.select`
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 16px;
  width: 100%;
  margin-bottom: 10px;
  outline: none;
  &:focus {
    border-color: #4b9fef;
  }
`;

const Button = styled.button`
  padding: 12px 0;
  font-size: 18px;
  background-color: #4b9fef;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #357bbd;
  }
  &:active {
    background-color: #2d649b;
  }
`;
