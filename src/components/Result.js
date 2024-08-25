import localforage from "localforage";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f0f0;
  padding: 10px;
  height: 50%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ResultSection = styled.div`
  width: 100%;
  background: white;
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;

  p:first-child {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 8px;
  }
`;
const Saving = styled.p`
  font-size: 1.2rem;
  color: #3498db;
  font-weight: bold;
`;

const Spending = styled.p`
  font-size: 1.2rem;
  color: #c0392b;
  font-weight: bold;
`;

const BudgetDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;

  button {
    margin-left: 10px;
    padding: 5px 10px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #2980b9;
    }
  }
`;

const BudgetForm = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;

  input {
    width: 100px;
    text-align: right;
    padding: 8px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 8px 12px;
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    &:hover {
      background-color: #27ae60;
    }
  }
`;

const Result = ({ livingTotal, fixed, income, saving }) => {
  const [budget, setBudget] = useState("");
  const [isBudget, setIsBudget] = useState(false);
  const budgetRef = useRef(null);

  const onChangeBudget = (e) => {
    setBudget(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericBudget = Number(budget);
    if (!isNaN(numericBudget) && numericBudget > 0) {
      localforage.setItem("소비 예산", numericBudget);
      setIsBudget(true);
    }
  };

  useEffect(() => {
    localforage.getItem("소비 예산").then((savedBudget) => {
      if (savedBudget) {
        setBudget(savedBudget);
        setIsBudget(true);
      }
    });
  }, []);

  const handleModify = () => {
    setIsBudget(false);
  };

  useEffect(() => {
    if (!isBudget && budgetRef.current) {
      budgetRef.current.focus();
    }
  }, [isBudget]);

  return (
    <ResultContainer>
      <ResultSection>
        <p>이달의 소비 예산</p>
        <Saving>
          {isBudget ? (
            <BudgetDisplay>
              {Number(budget).toLocaleString()}
              <button onClick={handleModify}>수정</button>
            </BudgetDisplay>
          ) : (
            <BudgetForm onSubmit={handleSubmit}>
              <input
                type="number"
                onChange={onChangeBudget}
                value={budget}
                ref={budgetRef}
              />
              <button type="submit">등록</button>
            </BudgetForm>
          )}
        </Saving>
      </ResultSection>
      <ResultSection>
        <p>이달의 생활비 합계</p>
        <Spending>{livingTotal.toLocaleString()}</Spending>
      </ResultSection>
      <ResultSection>
        <p>남은 돈</p>
        <Saving>
          {(income - fixed - livingTotal - saving).toLocaleString()}
        </Saving>
      </ResultSection>
    </ResultContainer>
  );
};

export default Result;
