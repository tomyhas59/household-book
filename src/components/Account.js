import localforage from "localforage";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ProgressBar, ProgressContainer } from "./Details";

const AccountContainer = styled.div`
  display: flex;
  width: 100%;
  height: 90vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
`;

const AccountSection = styled.div`
  width: 100%;
  height: 15vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  > p {
    margin: 2px;
  }
`;

const Saving = styled.div`
  color: #3498db;
  font-weight: bold;
`;

const Spending = styled.div`
  color: #c0392b;
  font-weight: bold;
`;

const BudgetDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2ecc71;
  margin-bottom: 5px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
    border-radius: 8px;
  }
`;

const BudgetForm = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;

  input {
    width: 100%;
    text-align: right;
    padding: 8px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 3px;
    background-color: #2ecc71;
    color: white;
    border: none;
    font-size: 10px;
    margin-left: 1px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    &:hover {
      background-color: #27ae60;
    }
  }
`;

const Account = ({
  income,
  saving,
  fixed,
  livingTotal,
  year,
  month,
  dataBydate,
}) => {
  const [budget, setBudget] = useState("");
  const [isBudget, setIsBudget] = useState(false);
  const [originalBudget, setOriginalBudget] = useState("");
  const budgetRef = useRef(null);
  const [savingPer, setSavingPer] = useState(0);
  const [spendingPer, setSpendingPer] = useState(0);

  const onChangeBudget = (e) => {
    setBudget(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericBudget = Number(budget);
    if (!isNaN(numericBudget) && numericBudget > 0) {
      const yearData = (await localforage.getItem(year)) || {};

      const updatedData = {
        ...dataBydate,
        budget: numericBudget,
      };

      yearData[month] = updatedData;

      localforage.setItem(year, yearData);
      setIsBudget(false);
    }
  };

  const handleCancel = () => {
    setBudget(originalBudget);
    setIsBudget(false);
  };

  useEffect(() => {
    localforage.getItem(year).then((yearData) => {
      if (yearData) {
        const existingMonthData = yearData[month] || {};

        setBudget(existingMonthData["budget"]);
        setOriginalBudget(existingMonthData["budget"]);
        setIsBudget(false);
      }
    });
  }, [year, month]);

  const handleModify = () => {
    setOriginalBudget(budget);
    setIsBudget(true);
  };

  useEffect(() => {
    if (!isBudget && budgetRef.current) {
      budgetRef.current.focus();
    }
  }, [isBudget]);

  useEffect(() => {
    const newSpendingPer = income ? ((livingTotal + fixed) / income) * 100 : 0;
    setSpendingPer(newSpendingPer);
  }, [fixed, income, livingTotal]);

  useEffect(() => {
    const newSavingPer = saving > 0 ? (saving / income) * 100 : 0;
    setSavingPer(newSavingPer);
  }, [income, saving]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (budgetRef.current && !budgetRef.current.contains(event.target)) {
        setIsBudget(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <AccountContainer>
      <AccountSection>
        <p>총 수입</p>
        <Saving>{income.toLocaleString()}</Saving>
      </AccountSection>

      <AccountSection>
        <p>총 고정 지출</p>
        <Spending>{fixed.toLocaleString()}</Spending>
      </AccountSection>
      <AccountSection>
        <p>생활비 합계</p>
        <Spending>{livingTotal.toLocaleString()}</Spending>
      </AccountSection>
      <AccountSection>
        <p>총 지출</p>
        <ProgressContainer>
          <ProgressBar $percentage={spendingPer}>
            <p>{spendingPer.toFixed(0)}%</p>
          </ProgressBar>
        </ProgressContainer>
        <Spending>{(livingTotal + fixed).toLocaleString()}</Spending>
      </AccountSection>
      <AccountSection>
        <p>총 저축</p>
        <ProgressContainer>
          <ProgressBar $percentage={savingPer}>
            <p>{savingPer.toFixed(0)}%</p>
          </ProgressBar>
        </ProgressContainer>
        <Saving>{saving.toLocaleString()}</Saving>
      </AccountSection>
      <AccountSection>
        <p>남은 돈</p>
        <Saving>
          {(income - fixed - livingTotal - saving).toLocaleString()}
        </Saving>
      </AccountSection>
      <AccountSection>
        <p>소비 예산</p>
        <Saving>
          {isBudget ? (
            <BudgetForm onSubmit={handleSubmit}>
              <input
                type="number"
                onChange={onChangeBudget}
                value={budget}
                ref={budgetRef}
              />
              <button type="submit">등록</button>
              <button type="button" onClick={handleCancel}>
                취소
              </button>
            </BudgetForm>
          ) : (
            <BudgetDisplay onClick={handleModify}>
              {budget ? Number(budget).toLocaleString() : "클릭하여 등록"}
            </BudgetDisplay>
          )}
        </Saving>
      </AccountSection>
    </AccountContainer>
  );
};

export default Account;
