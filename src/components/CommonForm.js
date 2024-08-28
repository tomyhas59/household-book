import React, { useEffect, useRef, useState } from "react";
import localforage from "localforage";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #fafafa;
  height: ${(props) => (props.height ? props.height : "50vh")};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-top: 20px;
  color: #000;
  text-align: center;
  font-size: 1.6rem;
  font-weight: 700;
`;

const List = styled.div`
  overflow-y: auto;
  padding: 5px;
  max-height: 70%;
`;

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 5px;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
    border-radius: 8px;
  }
`;

const ListItemText = styled.div`
  color: #333;
`;

const Button = styled.button`
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px;
  width: 50%;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const Total = styled.h4`
  position: absolute;
  display: flex;
  align-items: center;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  > p {
    margin: 0;
    font-weight: 700;
  }
`;

const CommonForm = ({
  title,
  setTotalItem,
  color,
  dateKey,
  dataBydate,
  height,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const descriptionRef = useRef(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [editFormById, setEditFormById] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState(0);

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
    setDescription("");
    descriptionRef.current.focus();
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
    setEditFormById(null);
    descriptionRef.current.focus();
  };

  return (
    <Container height={height}>
      <Title>{title}</Title>
      <List>
        {transactions.map((transaction) => (
          <>
            {editFormById === transaction.id ? (
              <Form
                key={transaction.id}
                onSubmit={(e) => editTransaction(e, transaction.id)}
              >
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
                  <Button
                    style={{ border: "none", backgroundColor: "#fff" }}
                  ></Button>
                )}
              </ListItem>
            )}
          </>
        ))}
      </List>
      <Form onSubmit={addTransaction}>
        <Input
          ref={descriptionRef}
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
        <p style={{ color: color }}>
          합계: {calculateTotal().toLocaleString()}
        </p>
      </Total>
    </Container>
  );
};

export default CommonForm;
