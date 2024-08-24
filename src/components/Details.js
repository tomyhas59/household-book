import React, { useEffect, useRef, useState } from "react";
import localforage from "localforage";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  font-family: Arial, sans-serif;
  border: 1px solid;
  border-radius: 8px;
  width: 300px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 10px;
`;

const Title = styled.h2`
  margin-top: 15px;
  color: red;
  text-align: center;
`;

const List = styled.div`
  overflow-y: auto;
  padding: 10px;
`;

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  border-bottom: 1px solid #ddd;
  margin: 0 5px;
`;

const ListItemText = styled.p`
  margin: 0;
  text-align: left;
`;

const Button = styled.button`
  width: 30px;
  height: 30px;
  background-color: #28a745;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #218838;
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 130px 130px auto;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Total = styled.h4`
  position: absolute;
  display: grid;
  grid-template-columns: 130px 130px;
  align-items: center;
  bottom: 10px;
  color: #333;

  > p:nth-child(1) {
    color: red;
    text-align: center;
  }
`;

const Details = ({ title, localforageKey, onTotalChange, grandTotal }) => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const descriptionRef = useRef(null);

  useEffect(() => {
    localforage.getItem(localforageKey).then((savedTransactions) => {
      if (savedTransactions) {
        setTransactions(savedTransactions);
      }
    });
  }, [localforageKey]);

  useEffect(() => {
    localforage.setItem(localforageKey, transactions);
  }, [transactions, localforageKey]);

  useEffect(() => {
    onTotalChange(calculateTotal());
  }, [transactions, onTotalChange]);

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

  const per = grandTotal > 0 ? (total / grandTotal) * 100 : 0;

  return (
    <Container>
      <Title>{title}</Title>
      <List>
        {transactions.map((transaction) => (
          <ListItem key={transaction.id}>
            <ListItemText>{transaction.description}</ListItemText>
            <ListItemText>{transaction.amount.toLocaleString()}원</ListItemText>
            <Button onClick={() => deleteTransaction(transaction.id)}>x</Button>
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
        <p>{per.toFixed(0)}%</p>
        <p>합계: {total.toLocaleString()}원</p>
      </Total>
    </Container>
  );
};

export default Details;
