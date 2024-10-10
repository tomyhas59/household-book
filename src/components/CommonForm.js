import React, { useEffect, useRef, useState } from "react";

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
import axios from "axios";
import { BASE_URL } from "../config/config";

const CommonForm = ({
  categoryTitle,
  setTotalItem,
  color,
  monthData,
  year,
  user,
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
  const [editDate, setEditDate] = useState("");
  const [date, setDate] = useState("");
  const dateRef = useRef(null);
  const listRef = useRef(null);
  const [total, setTotal] = useState(null);

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

  useEffect(() => {
    const total = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
    setTotalItem(total);
    setTotal(total);
  }, [transactions, setTotalItem]);

  const addTransaction = async (e) => {
    e.preventDefault();

    if (!description || amount <= 0) return;

    const newTransaction = {
      date: date || 0,
      amount: parseFloat(amount),
      description,
      type: categoryTitle,
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/add`, newTransaction, {
        params: {
          monthId: monthData.id || null,
          userId: user.id,
          year: parseInt(year),
          month: parseInt(month),
        },
      });
      console.log("add res", response.data);
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
      setEditDate(prevTransaction.date === 0 ? "" : prevTransaction.date);
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
    <Container style={{ height: "50%" }}>
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
            {editFormById === transaction.id ? (
              <Form onSubmit={(e) => editTransaction(e, transaction.id)}>
                <Input
                  type="number"
                  placeholder="날짜"
                  value={editDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditDate(value > 31 ? value.slice(-1) : value);
                  }}
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
                  {transaction.date ? `${transaction.date}일` : ""}
                </ListItemText>
                <ListItemText>{transaction.description}</ListItemText>
                <ListItemText style={{ color: color }}>
                  {transaction.amount?.toLocaleString()}
                </ListItemText>
                {hoveredItemId === transaction.id ? (
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
            min="0"
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button type="submit">+</Button>
        </Form>
      </List>
      <Total>
        <p style={{ color: color }}>{total?.toLocaleString()}</p>
      </Total>
    </Container>
  );
};

export default CommonForm;
