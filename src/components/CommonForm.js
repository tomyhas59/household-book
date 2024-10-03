import React, { useEffect, useRef, useState } from "react";
import localforage from "localforage";

import {
  Input,
  Total,
  Container,
  TitleContainer,
  CopyButton,
  Title,
  AllDeleteButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Form,
  TransparentButton,
} from "./Details";

const CommonForm = ({
  categoryTitle,
  setTotalItem,
  color,
  monthData,
  year,
  month,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [hoveredTitle, setHoveredTitle] = useState(false);
  const [editFormById, setEditFormById] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editDate, setEditDate] = useState(0);
  const [date, setDate] = useState("");
  const dateRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (monthData && monthData[categoryTitle]) {
      setTransactions(monthData[categoryTitle]);
    } else {
      setTransactions([]);
    }
  }, [year, month, monthData, categoryTitle]);

  useEffect(() => {
    const total = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
    setTotalItem(total);
  }, [transactions, setTotalItem]);

  const addTransaction = async (e) => {
    e.preventDefault();

    if (!description || amount <= 0) return;

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

  const deleteTransactionById = async (categoryTitle, id) => {
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

  const calculateTotal = () => {
    return transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
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
    setDescription("");
    setDate("");
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
    <Container style={{ height: "50vh" }}>
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
        {transactions.map((transaction) => (
          <React.Fragment key={transaction.id}>
            {editFormById === transaction.id ? (
              <Form onSubmit={(e) => editTransaction(e, transaction.id)}>
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
                key={transaction.id}
                onMouseEnter={() => setHoveredItemId(transaction.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                onClick={() => handleModifyForm(transaction.id)}
              >
                <ListItemText>
                  {transaction.date && `${transaction.date}일`}
                </ListItemText>
                <ListItemText>{transaction.description}</ListItemText>
                <ListItemText style={{ color: color }}>
                  {transaction.amount.toLocaleString()}
                </ListItemText>
                {hoveredItemId === transaction.id ? (
                  <Button
                    onClick={() =>
                      deleteTransactionById(categoryTitle, transaction.id)
                    }
                  >
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
          min="0"
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button type="submit">+</Button>
      </Form>

      <Total>
        <p style={{ color: color }}>{calculateTotal().toLocaleString()}</p>
      </Total>
    </Container>
  );
};

export default CommonForm;
