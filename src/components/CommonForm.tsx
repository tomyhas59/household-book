import React, { SyntheticEvent, useEffect, useRef, useState } from "react";

import axios from "axios";
import { BASE_URL } from "../config/config";
import { MonthDataType, TransactionType, UserType } from "../type";
import styled from "styled-components";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { livingTotalState, loadingState } from "../recoil/atoms";

export type PropsType = {
  categoryTitle: string;
  setTotalItem?: React.Dispatch<React.SetStateAction<number>>;
  onTotalChange?: (total: number) => void;
  monthData: MonthDataType;
  year: number;
  month: number;
  user: UserType;
  color?: string;
  onDrop: (e: React.DragEvent, type: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, transaction: TransactionType) => void;
};

const CommonForm: React.FC<PropsType & { isBar: Boolean }> = ({
  categoryTitle,
  setTotalItem,
  color,
  monthData,
  year,
  user,
  month,

  onTotalChange,
  isBar,
  onDrop,
  onDragOver,
  onDragStart,
}) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);
  const [hoveredTitle, setHoveredTitle] = useState(false);
  const [editFormById, setEditFormById] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editDate, setEditDate] = useState<number | "">("");

  const listRef = useRef<HTMLDivElement | null>(null);
  const listItemRef = useRef<HTMLFormElement | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [per, setPer] = useState(0);
  const livingTotal = useRecoilValue(livingTotalState);
  const setLoading = useSetRecoilState(loadingState);

  useEffect(() => {
    if (monthData && Array.isArray(monthData.transactions)) {
      const categoryData = monthData.transactions
        .filter((item) => item?.type === categoryTitle)
        .sort((a, b) => a!.date - b!.date);
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

  const copyPreviousMonthData = async () => {
    let previousMonth = month - 1;
    let previousYear = year;

    if (previousMonth < 1) {
      previousMonth = 12;
      previousYear = year - 1;
    }
    setLoading(true);

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
            return response.data;
          }
        );

        // 모든 요청이 완료될 때까지 기다리기
        const newTransactions = await Promise.all(promises);

        const sortedTransactions = newTransactions.sort(
          (a: { date: number }, b: { date: number }) => a.date - b.date
        );
        setTransactions(sortedTransactions);
      } else {
        alert("이전 달에 복사할 데이터가 없습니다.");
      }
    } catch (err) {
      console.error("데이터 복사 중 오류 발생", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    setLoading(true);

    try {
      await axios.delete(`${BASE_URL}/api/delete`, {
        params: {
          userId: user?.id,
          transactionId: id,
          monthId: monthData?.id,
        },
      });

      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction?.id !== id)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllTransaction = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    setLoading(true);

    const updateTransaction = {
      date: editDate || 0,
      amount: editAmount,
      description: editDescription,
      type: categoryTitle,
    };

    try {
      const response = await axios.put(
        `${BASE_URL}/api/update`,
        updateTransaction,
        {
          params: {
            userId: user?.id,
            transactionId: id,
            monthId: monthData?.id,
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
      setEditFormById(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    <CommonFormContainer>
      <TitleWrapper
        onMouseEnter={() => setHoveredTitle(true)}
        onMouseLeave={() => setHoveredTitle(false)}
      >
        <CopyButton onClick={copyPreviousMonthData}>📂</CopyButton>
        <Title>{categoryTitle}</Title>
        {hoveredTitle && (
          <AllDeleteButton onClick={deleteAllTransaction}>x</AllDeleteButton>
        )}
      </TitleWrapper>
      <TransactonList
        ref={listRef}
        style={{ maxHeight: "70%" }}
        onDrop={(e) => onDrop(e, categoryTitle)}
        onDragOver={onDragOver}
      >
        {transactions.map((transaction, index) => (
          <React.Fragment key={index}>
            {editFormById === transaction?.id ? (
              <EditForm
                key={transaction.id}
                onSubmit={(e: React.SyntheticEvent<Element, Event>) =>
                  editTransaction(e, transaction.id)
                }
                ref={listItemRef}
              >
                <EditInput
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
                <EditInput
                  type="text"
                  placeholder="상세"
                  value={editDescription}
                  onChange={(e: {
                    target: { value: React.SetStateAction<string> };
                  }) => setEditDescription(e.target.value)}
                />
                <EditInput
                  type="number"
                  placeholder="비용"
                  value={editAmount}
                  onChange={(e: { target: { value: any } }) =>
                    setEditAmount(Number(e.target.value))
                  }
                />
                <EditButton type="submit">+</EditButton>
                <CancelButton
                  type="button"
                  onClick={() => setEditFormById(null)}
                >
                  x
                </CancelButton>
              </EditForm>
            ) : (
              <ListItem
                key={transaction?.id}
                onMouseEnter={() => {
                  if (transaction) {
                    setHoveredItemId(transaction.id);
                  }
                }}
                onMouseLeave={() => setHoveredItemId(null)}
                draggable
                onDragStart={(e) => onDragStart(e, transaction)}
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
                  <DeleteTransactionButton
                    onClick={() => deleteTransaction(transaction.id)}
                  >
                    x
                  </DeleteTransactionButton>
                ) : (
                  <TransparentButton></TransparentButton>
                )}
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </TransactonList>
      <TotalContainer>
        <Total color={color!}>
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
    </CommonFormContainer>
  );
};

export default CommonForm;

export const CommonFormContainer = styled.div`
  position: relative;
  border: 1px solid #e0e0e0;
  width: 100%;
  height: 360px;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  background-color: #f9f9f9;
  border-radius: 8px;
  @media (max-width: 768px) {
    height: 280px;
  }
`;

export const TitleWrapper = styled.h2`
  text-align: center;
  font-size: 1.4rem;
  padding-top: 10px;
  position: relative;
  @media (max-width: 768px) {
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
  transition: transform 0.5s;
  &:hover {
    transform: scale(1.2);
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
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const AllDeleteButton = styled.button`
  background-color: #d80f0f;
  border-radius: 10px;
  padding: 0 8px;
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  color: #ffffff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease-in-out;

  &:hover {
    color: #000000;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const TransactonList = styled.div`
  overflow-y: auto;
  min-height: 200px;
  flex: 1;

  &::-webkit-scrollbar {
    width: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(28, 85, 241, 0.3); /* 스크롤바 색상 */
    border-radius: 10px; /* 둥글게 */
  }

  &::-webkit-scrollbar-track {
    background-color: transparent; /* 스크롤바 트랙 투명하게 */
  }
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
  cursor: grab;
  &:hover {
    background-color: #f0f0f0;
    border-radius: 8px;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-wrap: wrap;
  }
`;

export const EditForm = styled.form`
  display: flex;
  align-items: center;
  position: relative;
  > input:first-child {
    width: 50%;
  }
  @media (max-width: 768px) {
    display: flex;
    flex-wrap: wrap;
  }
`;

export const EditInput = styled.input`
  padding: 5px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  @media (max-width: 768px) {
    width: 50%;
  }
`;

export const ListItemText = styled.div`
  color: #333;

  word-break: keep-all;
  @media (max-width: 768px) {
    width: auto;
  }
`;

export const EditButton = styled.button`
  width: 50px;
  padding: 5px;
  cursor: pointer;
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

export const DeleteTransactionButton = styled.button`
  width: 20px;
  padding: 5px;
  cursor: pointer;
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
  width: 50px;
  padding: 5px;
  cursor: pointer;
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

export const TotalContainer = styled.div``;

export const Total = styled.div<{ color: string }>`
  width: 90%;
  color: ${(props) => props.color};
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  > p {
    margin: 0 auto;
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
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
