import React, { useCallback, useEffect, useRef, useState } from "react";
import localforage from "localforage";
import styled from "styled-components";

export const Container = styled.div`
  position: relative;
  font-family: Arial, sans-serif;
  border: 1px solid #e0e0e0;
  width: 100%;
  display: flex;
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

export const DeleteButton = styled.button`
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

export const Total = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: calc(100% - 20px);
  color: #c0392b;
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
  height: 20px;
  margin-bottom: 10px;
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
  dataBydate,
  year,
  month,
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
  const [editDate, setEditDate] = useState(0);
  const [date, setDate] = useState("");
  const dateRef = useRef(null);
  const listRef = useRef(null);

  const calculateTotal = useCallback(() => {
    if (transactions)
      return transactions.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      );
  }, [transactions]);

  const total = calculateTotal();

  useEffect(() => {
    if (dataBydate && dataBydate[categoryTitle]) {
      setTransactions(dataBydate[categoryTitle]);
    } else {
      setTransactions([]);
    }
  }, [dataBydate, categoryTitle]);

  useEffect(() => {
    const newPercentage = livingTotal > 0 ? (total / livingTotal) * 100 : 0;
    setPer(newPercentage);
    onTotalChange(total);
  }, [total, livingTotal, onTotalChange]);

  const addTransaction = async (e) => {
    e.preventDefault();

    if (!description || !amount) return;

    const newTransaction = {
      id: Date.now(),
      date,
      amount: parseFloat(amount),
      description,
    };
    //기존 데이터에 추가
    const yearData = (await localforage.getItem(year)) || {};
    const existingMonthData = yearData[month] || {};

    const updatedTransactions = {
      ...existingMonthData,
      [categoryTitle]: existingMonthData[categoryTitle]
        ? [...existingMonthData[categoryTitle], newTransaction]
        : [newTransaction],
    };

    yearData[month] = updatedTransactions;

    await localforage.setItem(year, yearData);

    setTransactions([...transactions, newTransaction]);
    setAmount("");
    setDate("");
    setDescription("");
    dateRef.current.focus();
  };

  const copyPreviousMonthData = async () => {
    let previousMonth = parseInt(month, 10) - 1;
    let previousYear = year;

    if (previousMonth < 1) {
      previousMonth = 12;
      previousYear = parseInt(year, 10) - 1;
    }

    const previousYearData = (await localforage.getItem(previousYear)) || {};
    const previousMonthData = previousYearData[previousMonth] || {};

    const currentYearData = (await localforage.getItem(year)) || {};
    const currentMonthData = currentYearData[month] || {};

    if (previousMonthData[categoryTitle]) {
      currentMonthData[categoryTitle] = previousMonthData[categoryTitle];

      currentYearData[month] = currentMonthData;

      await localforage.setItem(year, currentYearData);

      setTransactions(previousMonthData[categoryTitle]);
      alert("이전 달 데이터가 복사되었습니다.");
    } else {
      alert("이전 달에 복사할 데이터가 없습니다.");
    }
  };

  const deleteTransactionById = async (id) => {
    const yearData = (await localforage.getItem(year)) || {};
    const existingMonthData = yearData[month] || {};

    const updatedArray = existingMonthData[categoryTitle]?.filter(
      (transaction) => transaction.id !== id
    );

    existingMonthData[categoryTitle] = updatedArray;

    await localforage.setItem(year, yearData);

    setTransactions(updatedArray);
  };

  const deleteAllTransaction = async () => {
    if (window.confirm("전체 삭제하시겠습니까?")) {
      const yearData = (await localforage.getItem(year)) || {};
      const existingMonthData = yearData[month] || {};

      existingMonthData[categoryTitle] = [];

      await localforage.setItem(year, yearData);

      setTransactions([]);
    }
  };

  const handleModifyForm = async (id) => {
    const yearData = (await localforage.getItem(year)) || {};
    const existingMonthData = yearData[month] || {};

    const transaction = existingMonthData[categoryTitle].find(
      (transaction) => transaction.id === id
    );
    setEditFormById(id);
    if (transaction) {
      setEditDescription(transaction.description);
      setEditAmount(transaction.amount);
      setEditDate(transaction.date);
    }
  };

  const editTransaction = async (e, id) => {
    e.preventDefault();

    if (!editDescription || editAmount <= 0) return;

    const yearData = (await localforage.getItem(year)) || {};
    const existingMonthData = yearData[month] || {};
    if (!existingMonthData[categoryTitle]) {
      existingMonthData[categoryTitle] = [];
    }

    const updatedTransactions = existingMonthData[categoryTitle].map(
      (transaction) => {
        if (transaction.id === id) {
          return {
            ...transaction,
            date: editDate,
            description: editDescription,
            amount: parseFloat(editAmount),
          };
        }
        return transaction;
      }
    );

    existingMonthData[categoryTitle] = updatedTransactions;

    await localforage.setItem(year, yearData);
    setTransactions(updatedTransactions);
    setAmount("");
    setDate("");
    setDescription("");
    setEditFormById(null);
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

  return (
    <Container>
      <TitleContainer
        onMouseEnter={() => setHoveredTitle(true)}
        onMouseLeave={() => setHoveredTitle(false)}
      >
        <CopyButton onClick={copyPreviousMonthData}>📂</CopyButton>
        <Title>{categoryTitle}</Title>
        {hoveredTitle && (
          <DeleteButton onClick={deleteAllTransaction}>x</DeleteButton>
        )}
      </TitleContainer>
      <List ref={listRef}>
        {transactions.map((transaction) => (
          <React.Fragment key={transaction.id}>
            {editFormById === transaction.id ? (
              <Form
                key={transaction.id}
                onSubmit={(e) => editTransaction(e, transaction.id)}
              >
                <Input
                  type="number"
                  placeholder="날짜"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  min="1"
                  max="31"
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
                  min="0"
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
                  {transaction.date && `${transaction.date}일`}
                </ListItemText>
                <ListItemText>{transaction.description}</ListItemText>
                <ListItemText style={{ color: "red" }}>
                  {transaction.amount.toLocaleString()}
                </ListItemText>
                {hoveredItemId === transaction.id ? (
                  <Button onClick={() => deleteTransactionById(transaction.id)}>
                    x
                  </Button>
                ) : (
                  <TransparentButton></TransparentButton>
                )}
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
      <Form onSubmit={addTransaction}>
        <Input
          ref={dateRef}
          type="number"
          placeholder="날짜"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min="1"
          max="31"
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
      <Total>
        <ProgressContainer>
          <ProgressBar $percentage={per}>
            <p>{per.toFixed(0)}%</p>
          </ProgressBar>
        </ProgressContainer>
        <p>{total.toLocaleString()}</p>
      </Total>
    </Container>
  );
};

export default Details;
