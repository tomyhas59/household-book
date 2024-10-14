import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ProgressBar, ProgressContainer } from "./Details";
import axios from "axios";
import { MonthDataType, UserType } from "../type";

const AccountContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
`;

const AccountSection = styled.div`
  width: 100%;
  height: 13vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  margin-bottom: 5px;
  padding: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const AccountTitle = styled.p`
  margin: 2px;
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

const RemainingBudget = styled.div`
  font-size: 0.7rem;
  color: #e0e0e0;
  > :last-child {
    color: red;
    font-weight: bold;
    font-size: 0.9rem;
  }
`;

type PropsType = {
  income: number;
  saving: number;
  fixed: number;
  livingTotal: number;
  year: number;
  month: number;
  monthData: MonthDataType;
  user: UserType;
};

const Account: React.FC<PropsType> = ({
  income,
  saving,
  fixed,
  livingTotal,
  year,
  month,
  monthData,
  user,
}) => {
  const [budget, setBudget] = useState("");
  const [isBudget, setIsBudget] = useState(false);
  const [originalBudget, setOriginalBudget] = useState("");
  const budgetRef = useRef<HTMLInputElement>(null);
  const [savingPer, setSavingPer] = useState(0);
  const [spendingPer, setSpendingPer] = useState(0);

  const onChangeBudget = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(e.target.value);
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const requestData = {
      userId: user?.id,
      year: year,
      month: month,
      budget: budget ? Number(budget) : null,
    };

    if (Number(budget) > 0) {
      try {
        await axios.post("http://localhost:8090/api/saveNoteOrBudget", null, {
          params: requestData,
        });
        setIsBudget(false);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleCancel = () => {
    setBudget(originalBudget);
    setIsBudget(false);
  };

  useEffect(() => {
    setBudget(monthData?.budget?.toString() || "");
    setOriginalBudget(monthData?.budget?.toString() || "");
    setIsBudget(false);
  }, [year, month, monthData]);
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
    const newSavingPer = saving > 0 && income > 0 ? (saving / income) * 100 : 0;
    setSavingPer(newSavingPer);
  }, [income, saving]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (budgetRef.current && !budgetRef.current.contains(target)) {
        // 버튼이 없을 시 실행
        if (!target.closest("button")) {
          setIsBudget(false);
          setBudget(originalBudget);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [originalBudget]);

  return (
    <AccountContainer>
      <AccountSection>
        <AccountTitle>총 수입</AccountTitle>
        <Saving>{income.toLocaleString()}</Saving>
      </AccountSection>
      <AccountSection>
        <AccountTitle>총 고정 지출</AccountTitle>
        <Spending>{fixed.toLocaleString()}</Spending>
      </AccountSection>
      <AccountSection>
        <AccountTitle>생활비 합계</AccountTitle>
        <Spending>{livingTotal.toLocaleString()}</Spending>
      </AccountSection>
      <AccountSection>
        <AccountTitle>총 지출</AccountTitle>
        <ProgressContainer>
          <ProgressBar $percentage={spendingPer}>
            <p>{spendingPer.toFixed(0)}%</p>
          </ProgressBar>
        </ProgressContainer>
        <Spending>{(livingTotal + fixed).toLocaleString()}</Spending>
      </AccountSection>
      <AccountSection>
        <AccountTitle>총 저축</AccountTitle>
        <ProgressContainer>
          <ProgressBar
            $percentage={savingPer}
            style={{ backgroundColor: " #3498db" }}
          >
            <p>{savingPer.toFixed(0)}%</p>
          </ProgressBar>
        </ProgressContainer>
        <Saving>{saving.toLocaleString()}</Saving>
      </AccountSection>
      <AccountSection>
        <AccountTitle>남은 돈</AccountTitle>
        <Saving>
          {(income - fixed - livingTotal - saving).toLocaleString()}
        </Saving>
      </AccountSection>
      <AccountSection>
        <AccountTitle>소비 예산</AccountTitle>
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
        {budget && !isBudget ? (
          <RemainingBudget>
            <div>소비 예산 - 생활비</div>
            <div>
              남은 예산:
              {budget ? (Number(budget) - livingTotal).toLocaleString() : ""}
            </div>
          </RemainingBudget>
        ) : null}
      </AccountSection>
    </AccountContainer>
  );
};

export default Account;
