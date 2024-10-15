import React, { SyntheticEvent, useEffect, useRef, useState } from "react";

import axios from "axios";
import { BASE_URL } from "../config/config";
import { MonthDataType, TransactionType, UserType } from "../type";
import styled from "styled-components";
import { useRecoilValue } from "recoil";
import { livingTotalState } from "../recoil/atoms";

export type PropsType = {
  categoryTitle: string;
  setTotalItem?: React.Dispatch<React.SetStateAction<number>>;
  onTotalChange?: (total: number) => void;
  monthData: MonthDataType;
  year: number;
  month: number;
  user: UserType;
  color?: string;
};

const CommonForm: React.FC<PropsType & { height: string; isBar: Boolean }> = ({
  categoryTitle,
  setTotalItem,
  color,
  monthData,
  year,
  user,
  month,
  height,
  onTotalChange,
  isBar,
}) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);
  const [hoveredTitle, setHoveredTitle] = useState(false);
  const [editFormById, setEditFormById] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editDate, setEditDate] = useState<number | "">("");
  const [date, setDate] = useState<number | "">("");
  const dateRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const listItemRef = useRef<HTMLFormElement | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [per, setPer] = useState(0);
  const livingTotal = useRecoilValue(livingTotalState);

  useEffect(() => {
    if (monthData && Array.isArray(monthData.transactions)) {
      const categoryData = monthData.transactions.filter(
        (item) => item?.type === categoryTitle
      );
      setTransactions(categoryData);
    } else {
      setTransactions([]);
    }
  }, [monthData, categoryTitle]);

  useEffect(() => {
    const total = transactions
      .filter((transaction) => transaction?.amount !== null)
      .reduce((acc, transaction) => acc + transaction?.amount!, 0);

    const newPercentage = livingTotal > 0 ? (total / livingTotal) * 100 : 0;
    setPer(newPercentage);
    if (setTotalItem) {
      setTotalItem(total);
    }
    if (onTotalChange) {
      onTotalChange(total);
    }

    setTotal(total);
  }, [transactions, setTotalItem, onTotalChange, livingTotal]);

  const addTransaction = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!description || Number(amount) <= 0) return;

    const newTransaction = {
      date: date || 0,
      amount: parseFloat(amount),
      description,
      type: categoryTitle,
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/add`, newTransaction, {
        params: {
          monthId: monthData?.id || null,
          userId: user?.id,
          year: year,
          month: month,
        },
      });
      console.log("add res", response.data);
      setTransactions([...transactions, response.data]);
      setAmount("");
      setDate("");
      setDescription("");
      dateRef.current?.focus();
    } catch (err) {
      console.error("transaction add error", err);
    }
  };

  const copyPreviousMonthData = async () => {
    let previousMonth = month - 1;
    let previousYear = year;

    if (previousMonth < 1) {
      previousMonth = 12;
      previousYear = year - 1;
    }

    try {
      // 이전 달 데이터 가져오기
      const response = await axios.get(`${BASE_URL}/api/getTransactions`, {
        params: {
          month: previousMonth,
          year: previousYear,
          userId: user?.id,
          type: categoryTitle,
        },
      });

      const previousTransactions = response.data;

      if (previousTransactions.length > 0) {
        // 이번 달 데이터 있으면 데이터 삭제
        if (monthData?.id) {
          await axios.delete(`${BASE_URL}/api/deleteAll`, {
            params: {
              userId: user?.id,
              monthId: monthData.id,
              type: categoryTitle,
            },
          });
        }
        // 이전 달 데이터 추가하기
        const promises = previousTransactions.map(
          async (transaction: TransactionType) => {
            const newTransaction = {
              date: transaction?.date || 0,
              amount: transaction?.amount,
              description: transaction?.description,
              type: categoryTitle,
            };

            await axios.post(`${BASE_URL}/api/add`, newTransaction, {
              params: {
                monthId: monthData?.id || null,
                userId: user?.id,
                year: year,
                month: month,
              },
            });
          }
        );

        // 모든 요청이 완료될 때까지 기다리기
        await Promise.all(promises);

        // 새로 추가한 거래를 다시 가져와서 상태 업데이트
        setTransactions(previousTransactions);
        alert("이전 달 데이터가 복사되었습니다.");
      } else {
        alert("이전 달에 복사할 데이터가 없습니다.");
      }
    } catch (err) {
      console.error("데이터 복사 중 오류 발생", err);
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/delete`, {
        params: {
          userId: user?.id,
          transactionId: id,
        },
      });

      console.log(response.data);

      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction?.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAllTransaction = async () => {
    try {
      if (window.confirm("전체 삭제하시겠습니까?")) {
        const response = await axios.delete(`${BASE_URL}/api/deleteAll`, {
          params: {
            userId: user?.id,
            monthId: monthData?.id,
            type: categoryTitle,
          },
        });
        console.log(response.data);
        setTransactions([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModifyForm = async (id: number) => {
    const prevTransaction = transactions.find(
      (transaction) => transaction?.id === id
    );
    setEditFormById(id);
    if (prevTransaction) {
      setEditDescription(prevTransaction.description);
      setEditAmount(prevTransaction.amount);
      setEditDate(prevTransaction.date === 0 ? "" : prevTransaction.date);
    }
  };

  const editTransaction = async (e: SyntheticEvent, id: number) => {
    e.preventDefault();

    if (!editDescription || !editAmount) return;

    const updateTransaction = {
      date: editDate || 0,
      amount: editAmount,
      description: editDescription,
    };

    try {
      const response = await axios.put(
        `${BASE_URL}/api/update`,
        updateTransaction,
        {
          params: {
            userId: user?.id,
            transactionId: id,
          },
        }
      );

      const updatedTransactions = transactions.map((transaction) => {
        if (transaction?.id === id) {
          return {
            ...transaction,
            ...response.data,
          };
        }
        return transaction;
      });

      setTransactions(updatedTransactions);
      setAmount("");
      setDate("");
      setDescription("");
      setEditFormById(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        listItemRef.current &&
        !listItemRef.current.contains(e.target as Node)
      ) {
        setEditFormById(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [transactions]);

  return (
    <Container style={{ height: height }}>
      <TitleContainer
        onMouseEnter={() => setHoveredTitle(true)}
        onMouseLeave={() => setHoveredTitle(false)}
      >
        <CopyButton onClick={copyPreviousMonthData}>📂</CopyButton>
        <Title>{categoryTitle}</Title>
        {hoveredTitle && (
          <AllDeleteButton onClick={deleteAllTransaction}>x</AllDeleteButton>
        )}
      </TitleContainer>
      <List ref={listRef} style={{ maxHeight: "70%" }}>
        {transactions.map((transaction, index) => (
          <React.Fragment key={index}>
            {editFormById === transaction?.id ? (
              <Form
                key={transaction.id}
                onSubmit={(e: React.SyntheticEvent<Element, Event>) =>
                  editTransaction(e, transaction.id)
                }
                ref={listItemRef}
              >
                <Input
                  type="number"
                  placeholder="날짜"
                  value={editDate}
                  onChange={(e: { target: { value: any } }) => {
                    const value = e.target.value;
                    setEditDate(
                      Number(value) > 31 ? Number(value) % 10 : Number(value)
                    );
                  }}
                  min="1"
                  max="31"
                />
                <Input
                  type="text"
                  placeholder="상세"
                  value={editDescription}
                  onChange={(e: {
                    target: { value: React.SetStateAction<string> };
                  }) => setEditDescription(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="비용"
                  value={editAmount}
                  onChange={(e: { target: { value: any } }) =>
                    setEditAmount(Number(e.target.value))
                  }
                />
                <Button type="submit">+</Button>
                <Button
                  style={{
                    backgroundColor: "red",
                    border: "none",
                    color: "#fff",
                  }}
                  type="button"
                  onClick={() => setEditFormById(null)}
                >
                  x
                </Button>
              </Form>
            ) : (
              <ListItem
                key={transaction?.id}
                onMouseEnter={() => {
                  if (transaction) {
                    setHoveredItemId(transaction.id);
                  }
                }}
                onMouseLeave={() => setHoveredItemId(null)}
                onClick={() => {
                  if (transaction) {
                    handleModifyForm(transaction.id);
                  }
                }}
              >
                <ListItemText>
                  {transaction?.date ? `${transaction?.date}일` : ""}
                </ListItemText>
                <ListItemText>{transaction?.description}</ListItemText>
                <ListItemText style={{ color: color }}>
                  {transaction?.amount?.toLocaleString()}
                </ListItemText>
                {hoveredItemId === transaction?.id ? (
                  <Button onClick={() => deleteTransaction(transaction.id)}>
                    x
                  </Button>
                ) : (
                  <TransparentButton></TransparentButton>
                )}
              </ListItem>
            )}
          </React.Fragment>
        ))}{" "}
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
          <Button type="submit">+</Button>
        </Form>
      </List>
      <TotalContainer>
        <Total>
          {isBar ? (
            <ProgressContainer>
              <ProgressBar $percentage={per}>
                <p>{per.toFixed(0)}%</p>
              </ProgressBar>
            </ProgressContainer>
          ) : null}
          <p>{total?.toLocaleString()}</p>
        </Total>
      </TotalContainer>
    </Container>
  );
};

export default CommonForm;

export const Container = styled.div`
  position: relative;
  font-family: Arial, sans-serif;
  border: 1px solid #e0e0e0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  background-color: #f9f9f9;
`;

export const TitleContainer = styled.h2`
  text-align: center;
  font-size: 1.4rem;
  padding-top: 10px;
  position: relative;

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

export const CopyButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  border: none;
  padding: 2px;
  border-radius: 5px;
  cursor: pointer;
  background-color: transparent;
  &:hover {
    background-color: #f0f0f0;
  }
  &:hover::before {
    content: "이전 달 데이터 복사";
    position: absolute;
    top: 100%;
    left: 100%;
    background-color: #f9e79f;
    color: #333;
    padding: 5px;
    border-radius: 3px;
    white-space: nowrap; // 텍스트 줄 바꿈 없이 표시
    z-index: 1;
  }
`;

export const Title = styled.div`
  font-size: 1.3rem;
  color: #2c3e50;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const AllDeleteButton = styled.button`
  background-color: transparent;
  position: absolute;
  top: 0;
  right: 5%;
  border: none;
  color: #e74c3c;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: #c0392b;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const List = styled.div`
  overflow-y: auto;
  flex: 1;
`;

export const ListItem = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.5fr auto;
  gap: 6px;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 5px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    display: flex;
    flex-wrap: wrap;
  }
`;

export const ListItemText = styled.div`
  color: #333;
  font-size: 0.7rem;
  word-break: keep-all;
  @media (max-width: 480px) {
    width: auto;
  }
`;

export const Button = styled.button`
  width: 15px;
  height: 15px;
  cursor: pointer;
  font-size: 0.9rem;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: rgba(128, 128, 128, 0.7);
  }
`;

export const TransparentButton = styled.button`
  background-color: transparent;
  border: none;
  width: 15px;
  height: 15px;
`;

export const CancelButton = styled.button`
  width: 15px;
  height: 15px;
  cursor: pointer;
  font-size: 0.9rem;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #c51162;
  }
`;

export const Form = styled.form`
  display: flex;
  align-items: center;
  position: relative;
  > input:first-child {
    width: 50%;
  }
  @media (max-width: 480px) {
    display: flex;
    flex-wrap: wrap;
  }
`;

export const Input = styled.input`
  padding: 5px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.7rem;
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  @media (max-width: 480px) {
    width: 50%;
  }
`;
export const TotalContainer = styled.div``;

export const Total = styled.div`
  width: 90%;
  color: #c0392b;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  > p {
    margin: 0 auto;
  }
`;

export const ProgressContainer = styled.div`
  width: 100%;
  position: relative;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 3px;
  height: 20px;
`;

interface PercentType {
  $percentage: number;
}

export const ProgressBar = styled.div<PercentType>`
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background-color: crimson;
  transition: width 0.3s ease;
  > p {
    color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
`;
