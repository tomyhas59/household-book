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
          <RadioContainer>
            {DETAIL_CATEGORIES.concat(["수입", "고정 지출", "저축"])
              .sort((a, b) => a.localeCompare(b))
              .map((category) => (
                <RadioLabel key={category}>
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={categoryTitle === category}
                    onChange={() => setCategoryTitle(category)}
                  />
                  <span>{category}</span>
                </RadioLabel>
              ))}
          </RadioContainer>
          <Button type="submit">+</Button>
        </Form>
      </TransactionFormContainer>
    );
  }
);

export default TransactionForm;

const TransactionFormContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: #78c0fe;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const Input = styled.input`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  outline: none;

  &:focus {
    border-color: #007bff;
  }

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 0.9rem;
  }
`;

const RadioContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 1rem;
  cursor: pointer;

  input[type="radio"] {
    margin-right: 8px;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Button = styled.button`
  padding: 12px;
  font-size: 1.2rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 1rem;
  }
`;
