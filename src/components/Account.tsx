import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { MonthDataType, UserType } from "../type";
import { BASE_URL } from "../config/config";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { livingTotalState, loadingState } from "../recoil/atoms";
import "../styles/Account.css";

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

  const totalSpending = livingTotal + fixed;
  const remaining = income - totalSpending - saving;
  const remainingBudget = budget ? Number(budget) - livingTotal : 0;

  return (
    <div className="account-summary">
      <h2 className="account-summary__title">
        <i className="fas fa-chart-line"></i>
        재정 요약
      </h2>

      <div className="summary-grid">
        {/* 수입 */}
        <div className="summary-item summary-item--income">
          <div className="summary-item__icon">
            <i className="fas fa-arrow-down"></i>
          </div>
          <div className="summary-item__content">
            <span className="summary-item__label">총 수입</span>
            <span className="summary-item__value">
              {income.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 고정 지출 */}
        <div className="summary-item summary-item--fixed">
          <div className="summary-item__icon">
            <i className="fas fa-receipt"></i>
          </div>
          <div className="summary-item__content">
            <span className="summary-item__label">고정 지출</span>
            <span className="summary-item__value">
              {fixed.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 생활비 */}
        <div className="summary-item summary-item--living">
          <div className="summary-item__icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="summary-item__content">
            <span className="summary-item__label">생활비</span>
            <span className="summary-item__value">
              {livingTotal.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 총 지출 (진행률 포함) */}
        <div className="summary-item summary-item--spending">
          <div className="summary-item__icon">
            <i className="fas fa-arrow-up"></i>
          </div>
          <div className="summary-item__content">
            <span className="summary-item__label">총 지출</span>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill progress-fill--expense"
                  style={{ width: `${Math.min(spendingPer, 100)}%` }}
                >
                  <span>{spendingPer.toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <span className="summary-item__value">
              {totalSpending.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 저축 (진행률 포함) */}
        <div className="summary-item summary-item--saving">
          <div className="summary-item__icon">
            <i className="fas fa-piggy-bank"></i>
          </div>
          <div className="summary-item__content">
            <span className="summary-item__label">총 저축</span>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill progress-fill--saving"
                  style={{ width: `${Math.min(savingPer, 100)}%` }}
                >
                  <span>{savingPer.toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <span className="summary-item__value">
              {saving.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 남은 돈 */}
        <div
          className={`summary-item summary-item--remaining ${remaining < 0 ? "summary-item--negative" : ""}`}
        >
          <div className="summary-item__icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="summary-item__content">
            <span className="summary-item__label">남은 금액</span>
            <span className="summary-item__value">
              {remaining.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 소비 예산 */}
        <div className="summary-item summary-item--budget">
          <div className="summary-item__icon">
            <i className="fas fa-bullseye"></i>
          </div>
          <div className="summary-item__content">
            <span className="summary-item__label">소비 예산</span>
            {isBudget ? (
              <form className="budget-form" onSubmit={handleSubmit}>
                <input
                  className="budget-input"
                  type="number"
                  onChange={onChangeBudget}
                  value={budget}
                  ref={budgetRef}
                  min={0}
                  step={1000}
                  placeholder="예산 입력"
                />
                <div className="budget-buttons">
                  <button
                    type="submit"
                    className="budget-btn budget-btn--submit"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                  <button
                    type="button"
                    className="budget-btn budget-btn--cancel"
                    onClick={handleCancel}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </form>
            ) : (
              <div className="budget-display" onClick={handleModify}>
                {budget && Number(budget) > 0
                  ? `${Number(budget).toLocaleString()}원`
                  : "예산 설정하기"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 남은 예산 표시 */}
      {budget && !isBudget && Number(budget) > 0 && (
        <div
          className={`budget-remaining ${remainingBudget < 0 ? "budget-remaining--over" : ""}`}
        >
          <div className="budget-remaining__content">
            <span className="budget-remaining__label">
              <i className="fas fa-calculator"></i>
              소비 예산 - 생활비
            </span>
            <span className="budget-remaining__value">
              남은 예산: {remainingBudget.toLocaleString()}원
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
