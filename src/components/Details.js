import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { BASE_URL } from "../config/config";

export const Container = styled.div`
  position: relative;
  font-family: Arial, sans-serif;
  border: 1px solid #e0e0e0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  background-color: #f9f9f9;
`;

export const TitleContainer = styled.h2`
  margin-top: 5px;
  text-align: center;
  font-size: 1.4rem;
  padding: 10px 15px;
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
  flex-grow: 1;
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
  max-height: 83%;
  flex: 1;
  @media (max-width: 480px) {
    max-height: 80%;
  }
`;

export const ListItem = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.5fr auto;
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
  @media (max-width: 480px) {
    width: 50%;
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

export const ProgressBar = styled.div`
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

const Details = ({
  categoryTitle,
  onTotalChange,
  livingTotal,
  monthData,
  year,
  month,
  user,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [per, setPer] = useState(0);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [hoveredTitle, setHoveredTitle] = useState(false);
  const [editFormById, setEditFormById] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editDate, setEditDate] = useState("");
  const [date, setDate] = useState("");
  const dateRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (monthData && Array.isArray(monthData.transactions)) {
      const categoryData = monthData.transactions.filter(
        (item) => item.type === categoryTitle
      );
      setTransactions(categoryData);
    } else {
      setTransactions([]);
    }
  }, [monthData, categoryTitle]);

  const total = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );

  useEffect(() => {
    const newPercentage = livingTotal > 0 ? (total / livingTotal) * 100 : 0;
    setPer(newPercentage);
    onTotalChange(total);
  }, [total, livingTotal, onTotalChange]);

  const addTransaction = async (e) => {
    e.preventDefault();

    if (!description || !amount) return;

    const newTransaction = {
      date: date || 0,
      amount: parseFloat(amount),
      description,
      type: categoryTitle,
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/add`, newTransaction, {
        params: {
          userId: user.id,
          monthId: monthData.id || null,
          year: parseInt(year),
          month: parseInt(month),
        },
      });
      console.log("add res", response);
      setTransactions([...transactions, response.data]);
      setAmount("");
      setDate("");
      setDescription("");
      dateRef.current.focus();
    } catch (err) {
      console.error("transaction add error", err);
    }
  };

  const copyPreviousMonthData = async () => {
    let previousMonth = parseInt(month, 10) - 1;
    let previousYear = year;

    if (previousMonth < 1) {
      previousMonth = 12;
      previousYear = parseInt(year, 10) - 1;
    }

    try {
      // 이전 달 데이터 가져오기
      const response = await axios.get(`${BASE_URL}/api/getTransactions`, {
        params: {
          month: previousMonth,
          year: previousYear,
          userId: user.id,
          type: categoryTitle,
        },
      });

      const previousTransactions = response.data;

      if (previousTransactions.length > 0) {
        // 이번 달 데이터 삭제
        await axios.delete(`${BASE_URL}/api/deleteAll`, {
          params: {
            userId: user.id,
            monthId: monthData.id,
            type: categoryTitle,
          },
        });

        // 이전 달 데이터 추가하기
        const promises = previousTransactions.map(async (transaction) => {
          const newTransaction = {
            date: transaction.date || 0,
            amount: parseFloat(transaction.amount),
            description: transaction.description,
            type: categoryTitle,
          };

          await axios.post(`${BASE_URL}/api/add`, newTransaction, {
            params: {
              monthId: monthData.id || null,
              userId: user.id,
              year: parseInt(year),
              month: parseInt(month),
            },
          });
        });

        // 모든 요청이 완료될 때까지 기다리기
        await Promise.all(promises);

        setTransactions(previousTransactions);
        alert("이전 달 데이터가 복사되었습니다.");
      } else {
        alert("이전 달에 복사할 데이터가 없습니다.");
      }
    } catch (err) {
      console.error("데이터 복사 중 오류 발생", err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/delete`, {
        params: {
          userId: user.id,
          transactionId: id,
        },
      });

      console.log(response.data);

      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction.id !== id)
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
            userId: user.id,
            monthId: monthData.id,
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

  const handleModifyForm = async (id) => {
    const prevTransaction = transactions.find(
      (transaction) => transaction.id === id
    );
    setEditFormById(id);
    if (prevTransaction) {
      setEditDescription(prevTransaction.description);
      setEditAmount(prevTransaction.amount);
      setEditDate(prevTransaction.date);
    }
  };

  const editTransaction = async (e, id) => {
    e.preventDefault();

    if (!editDescription || !editAmount) return;

    const updateTransaction = {
      date: editDate || 0,
      amount: parseFloat(editAmount),
      description: editDescription,
    };

    try {
      const response = await axios.put(
        `${BASE_URL}/api/update`,
        updateTransaction,
        {
          params: {
            userId: user.id,
            transactionId: id,
          },
        }
      );

      const updatedTransactions = transactions.map((transaction) => {
        if (transaction.id === id) {
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
    const handleClickOutside = (event) => {
      if (listRef.current && !listRef.current.contains(event.target)) {
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
    <Container>
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
      <List ref={listRef}>
        {transactions.map((transaction, index) => (
          <React.Fragment key={index}>
            {editFormById === transaction.id ? (
              <Form
                key={transaction.id}
                onSubmit={(e) => editTransaction(e, transaction.id)}
              >
                <Input
                  type="number"
                  placeholder="날짜"
                  value={editDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditDate(value > 31 ? value.slice(-1) : value);
                  }}
                />
                <Input
                  type="text"
                  placeholder="상세"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="비용"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
                <Button type="submit">+</Button>
                <CancelButton
                  type="button"
                  onClick={() => setEditFormById(null)}
                >
                  x
                </CancelButton>
              </Form>
            ) : (
              <ListItem
                key={transaction.id}
                onMouseEnter={() => setHoveredItemId(transaction.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                onClick={() => handleModifyForm(transaction.id)}
              >
                <ListItemText>
                  {transaction.date ? `${transaction.date}일` : ""}
                </ListItemText>
                <ListItemText>{transaction.description}</ListItemText>
                <ListItemText style={{ color: "red" }}>
                  {transaction.amount.toLocaleString()}
                  {hoveredItemId === transaction.id ? (
                    <Button onClick={() => deleteTransaction(transaction.id)}>
                      x
                    </Button>
                  ) : (
                    <TransparentButton></TransparentButton>
                  )}
                </ListItemText>
              </ListItem>
            )}
          </React.Fragment>
        ))}
        <Form onSubmit={addTransaction}>
          <Input
            ref={dateRef}
            type="number"
            placeholder="날짜"
            value={date}
            onChange={(e) => {
              const value = e.target.value;
              setDate(value > 31 ? value.slice(-1) : value);
            }}
          />
          <Input
            type="text"
            placeholder="상세"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            type="number"
            placeholder="비용"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button type="submit">+</Button>
        </Form>
      </List>

      <TotalContainer>
        <Total>
          <ProgressContainer>
            <ProgressBar $percentage={per}>
              <p>{per.toFixed(0)}%</p>
            </ProgressBar>
          </ProgressContainer>
          <p>{total.toLocaleString()}</p>
        </Total>
      </TotalContainer>
    </Container>
  );
};

export default Details;
