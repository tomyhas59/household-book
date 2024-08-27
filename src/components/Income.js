import React, { useEffect, useRef, useState } from "react";
import localforage from "localforage";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  display: flex;
  height: 50%;
  flex-direction: column;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-top: 15px;
  color: #000;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
`;

const List = styled.div`
  overflow-y: auto;
  padding: 10px;
  max-height: 220px;
`;

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  border-bottom: 1px solid #ddd;
  margin: 5px 0;
  padding: 5px;
  background-color: #fff;
  border-radius: 4px;
`;

const ListItemText = styled.div`
  margin: 0;
  color: #333;
  font-size: 0.9rem;
  margin-right: 5px;
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
  font-size: 1rem;
  font-weight: 600;

  > p {
    margin: 0;
    color: #3498db;
  }
`;

const Income = ({ setIncome }) => {
  const title = "수입";
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const descriptionRef = useRef(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  useEffect(() => {
    localforage.getItem(title).then((savedTransactions) => {
      if (savedTransactions) {
        setTransactions(savedTransactions);
      }
    });
  }, [title]);

  useEffect(() => {
    localforage.setItem(title, transactions);
  }, [transactions, title]);

  useEffect(() => {
    const total = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
    setIncome(total);
  }, [transactions, setIncome]);

  const addTransaction = (e) => {
    e.preventDefault();

    if (!description || !amount) return;

    const newTransaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      description,
    };

    setTransactions([...transactions, newTransaction]);
    setAmount("");
    setDescription("");
    descriptionRef.current.focus();
  };

  const deleteTransaction = (id) => {
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.id !== id
    );
    setTransactions(updatedTransactions);
  };

  const calculateTotal = () => {
    return transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
  };

  const total = calculateTotal();

  return (
    <Container>
      <Title>{title}</Title>
      <List>
        {transactions.map((transaction) => (
          <ListItem
            key={transaction.id}
            onMouseEnter={() => setHoveredItemId(transaction.id)}
            onMouseLeave={() => setHoveredItemId(null)}
          >
            <ListItemText>{transaction.description}</ListItemText>
            <ListItemText style={{ color: "blue" }}>
              {transaction.amount.toLocaleString()}
            </ListItemText>
            {hoveredItemId === transaction.id && (
              <Button
                onClick={() => deleteTransaction(transaction.id)}
                style={{ position: "absolute", right: 0 }}
              >
                x
              </Button>
            )}
          </ListItem>
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
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button type="submit">+</Button>
      </Form>

      <Total>
        <p>합계: {total.toLocaleString()}</p>
      </Total>
    </Container>
  );
};

export default Income;
