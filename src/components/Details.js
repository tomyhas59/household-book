import React, { useCallback, useEffect, useRef, useState } from "react";
import localforage from "localforage";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  font-family: Arial, sans-serif;
  border: 1px solid #e0e0e0;
  width: 20%;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
`;

const Title = styled.h2`
  margin-top: 5px;
  color: #2c3e50;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const List = styled.div`
  overflow-y: auto;
  max-height: 70%;
`;

const ListItem = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 5px;
  background-color: #f1f1f1;
  border-radius: 6px;
  @media (max-width: 480px) {
    display: flex;
    flex-direction: column;
  }
`;

const ListItemText = styled.p`
  color: #333;
  font-size: 0.9rem;
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
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  padding: 10px;
  width: 50%;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const Total = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: calc(100% - 20px);
  color: #c0392b;
  font-size: 1.3rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  > p {
    margin: 0 auto;
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  position: relative;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  height: 20px;
  margin-bottom: 10px;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.percentage}%;
  background-color: #3498db;
  transition: width 0.3s ease;
  > p {
    color: #fff;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const Details = ({ title, localforageKey, onTotalChange, livingTotal }) => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const descriptionRef = useRef(null);
  const [per, setPer] = useState(0);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const calculateTotal = useCallback(() => {
    return transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
  }, [transactions]);

  const total = calculateTotal();

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
    const newPercentage = livingTotal > 0 ? (total / livingTotal) * 100 : 0;
    setPer(newPercentage);
    onTotalChange(total);
  }, [total, livingTotal]);

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
            <ListItemText style={{ color: "red" }}>
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
        <ProgressContainer>
          <ProgressBar percentage={per}>
            <p>{per.toFixed(0)}%</p>
          </ProgressBar>
        </ProgressContainer>
        <p>{total.toLocaleString()}</p>
      </Total>
    </Container>
  );
};

export default Details;
