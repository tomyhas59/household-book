import React, { useEffect, useRef, useState } from "react";
import localforage from "localforage";

import {
  Input,
  Total,
  Container,
  Title,
  List,
  ListItem,
  ListItemText,
  Button,
  Form,
  TransparentButton,
} from "./Details";

const CommonForm = ({ title, setTotalItem, color, dateKey, dataBydate }) => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [editFormById, setEditFormById] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editDate, setEditDate] = useState(0);
  const [date, setDate] = useState("");
  const dateRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (dataBydate && dataBydate[title]) {
      setTransactions(dataBydate[title]);
    } else {
      setTransactions([]);
    }
  }, [dateKey, dataBydate, title]);

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
    const existingData = (await localforage.getItem(dateKey)) || {};

    const updatedTransactions = {
      ...existingData,
      [title]: existingData[title]
        ? [...existingData[title], newTransaction]
        : [newTransaction],
    };
    await localforage.setItem(dateKey, updatedTransactions);

    setTransactions([...transactions, newTransaction]);
    setAmount("");
    setDate("");
    setDescription("");
    dateRef.current.focus();
  };

  const deleteTransactionById = async (title, id) => {
    const existingData = (await localforage.getItem(dateKey)) || {};
    const updatedArray = existingData[title]?.filter(
      (transaction) => transaction.id !== id
    );
    existingData[title] = updatedArray;
    await localforage.setItem(dateKey, existingData);
    setTransactions(updatedArray);
  };

  const calculateTotal = () => {
    return transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
  };

  const handleModifyForm = async (id) => {
    const existingData = (await localforage.getItem(dateKey)) || {};
    const transaction = existingData[title].find(
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

    const existingData = (await localforage.getItem(dateKey)) || {};

    if (!existingData[title]) {
      existingData[title] = [];
    }

    const updatedTransactions = existingData[title].map((transaction) => {
      if (transaction.id === id) {
        return {
          ...transaction,
          description: editDescription,
          amount: parseFloat(editAmount),
        };
      }
      return transaction;
    });

    existingData[title] = updatedTransactions;

    await localforage.setItem(dateKey, existingData);
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
      <Title>{title}</Title>
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
                <ListItemText>{transaction.date}</ListItemText>
                <ListItemText>{transaction.description}</ListItemText>
                <ListItemText style={{ color: color }}>
                  {transaction.amount.toLocaleString()}
                </ListItemText>
                {hoveredItemId === transaction.id ? (
                  <Button
                    onClick={() => deleteTransactionById(title, transaction.id)}
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
