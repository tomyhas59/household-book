import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ProgressBar, ProgressContainer } from "./CommonForm";
import axios from "axios";
import { MonthDataType, UserType } from "../type";
import { BASE_URL } from "../config/config";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { livingTotalState, loadingState } from "../recoil/atoms";

type PropsType = {
  income: number;
  saving: number;
  fixed: number;
  year: number;
  month: number;
  monthData: MonthDataType;
  user: UserType;
};

const Account: React.FC<PropsType> = ({
  income,
  saving,
  fixed,
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
  const livingTotal = useRecoilValue(livingTotalState);
  const setLoading = useSetRecoilState(loadingState);

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
    setLoading(true);

    if (Number(budget) >= 0) {
      try {
        await axios.post(`${BASE_URL}/api/saveNoteOrBudget`, null, {
          params: requestData,
        });
        setIsBudget(false);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
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
              {budget && Number(budget) > 0
                ? Number(budget).toLocaleString()
                : "클릭하여 등록"}
            </BudgetDisplay>
          )}
        </Saving>
        {budget && !isBudget && Number(budget) > 0 ? (
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

const AccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  max-width: 800px;
  border-radius: 8px;
`;

const AccountSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 8px;
  }
`;

const AccountTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Saving = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #3498db;
`;

const Spending = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #e74c3c;
`;

const BudgetForm = styled.form`
  display: flex;
  gap: 4px;
  justify-content: space-between;
  align-items: center;

  input[type="number"] {
    padding: 8px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 120px;
  }

  button {
    padding: 8px 16px;
    font-size: 1rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #2980b9;
    }
    @media (max-width: 768px) {
      padding: 4px 8px;
      font-size: 0.9rem;
    }
  }

  button[type="button"] {
    background-color: #e74c3c;

    &:hover {
      background-color: #c0392b;
    }
  }
`;

const BudgetDisplay = styled.div`
  font-size: 1.1rem;
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
`;

const RemainingBudget = styled.div`
  margin-top: 12px;
  font-size: 1rem;
  color: #2c3e50;

  div {
    margin-bottom: 8px;
  }
`;
