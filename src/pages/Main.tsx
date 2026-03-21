import { useCallback, useEffect, useRef, useState } from "react";
import Details from "../components/Details";
import Income from "../components/Income";
import Saving from "../components/Saving";
import Fixed from "../components/Fixed";
import Account from "../components/Account";
import DateSelector from "../components/DateSelector";
import Note from "../components/Note";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  detailsTotalsState,
  incomeState,
  fixedState,
  savingState,
  yearState,
  monthState,
  monthDataState,
  userState,
  loadingState,
  changePasswordFormState,
} from "../recoil/atoms";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/config";
import Spinner from "../components/Spinner";
import TransactionForm from "../components/TransactionForm";
import { TransactionType } from "../type";
import OptionButton from "../components/OptionButton";
import ChangePasswordForm from "../components/ChangePasswordForm";
import "../styles/Main.css";

export const DETAIL_CATEGORIES = [
  "식비",
  "생필품",
  "문화생활",
  "교통비",
  "의료 및 기타",
];

const Main = () => {
  const setDetailsTotals = useSetRecoilState(detailsTotalsState);
  const [income, setIncome] = useRecoilState(incomeState);
  const [fixed, setFixed] = useRecoilState(fixedState);
  const [saving, setSaving] = useRecoilState(savingState);
  const [year, setYear] = useRecoilState(yearState);
  const [month, setMonth] = useRecoilState(monthState);
  const [monthData, setMonthData] = useRecoilState(monthDataState);
  const user = useRecoilValue(userState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [transactionForm, setTransactionForm] = useState<boolean>(false);
  const transactionFormRef = useRef<HTMLDivElement>(null);
  const transactionFormButtonRef = useRef<HTMLButtonElement>(null);

  const changePasswordForm = useRecoilValue(changePasswordFormState);

  const [draggedTransaction, setDraggedTransaction] =
    useState<TransactionType | null>(null);

  const navigator = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/getMonth`, {
          params: {
            userId: user?.id,
            year: year,
            month: month,
          },
        });
        const existingMonthData = response.data || {};
        setMonthData(existingMonthData);
      } catch (error) {
        console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
        setMonthData({});
      } finally {
        setLoading(false);
      }
    };
    if (year && month) {
      fetchData();
    }
  }, [user, year, month, setMonthData, setLoading]);

  const handleDragStart = (
    e: React.DragEvent,
    transaction: TransactionType,
  ) => {
    if (transaction) {
      setDraggedTransaction(transaction);
    }
  };

  const handleDrop = async (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (draggedTransaction) {
        const updateTransaction = {
          ...draggedTransaction,
          type: type,
        };

        await axios.put(`${BASE_URL}/api/update`, updateTransaction, {
          params: {
            userId: user?.id,
            transactionId: draggedTransaction.id,
            monthId: monthData?.id,
          },
        });

        const updatedTransactions = monthData?.transactions?.map(
          (transaction) =>
            transaction?.id === draggedTransaction.id
              ? { ...transaction, type }
              : transaction,
        );

        setMonthData((prev) => {
          return {
            ...prev,
            transactions: updatedTransactions,
          };
        });
        setDraggedTransaction(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const updateAllTotal = useCallback(
    (index: number, total: number) => {
      setDetailsTotals((prevTotals) => {
        const newAllTotals = [...prevTotals];
        if (newAllTotals[index] !== total) {
          newAllTotals[index] = total;
          return newAllTotals;
        }
        return prevTotals;
      });
    },
    [setDetailsTotals],
  );

  useEffect(() => {
    if (user?.id === null) navigator("/");
  });

  const getNextMonth = () => {
    if (month && year) {
      let nextMonth = month + 1;
      let nextYear = year;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear = year + 1;
      }
      setYear(nextYear);
      setMonth(nextMonth);
    }
  };

  const getPrevMonth = () => {
    if (month && year) {
      let previousMonth = month - 1;
      let previousYear = year;

      if (previousMonth < 1) {
        previousMonth = 12;
        previousYear = year - 1;
      }

      if (previousYear < 2024) return alert("2024년부터 가능");
      setYear(previousYear);
      setMonth(previousMonth);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        transactionFormButtonRef.current &&
        transactionFormButtonRef.current.contains(e.target as Node)
      ) {
        return;
      }

      if (
        transactionFormRef.current &&
        !transactionFormRef.current.contains(e.target as Node)
      ) {
        setTransactionForm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="main-page">
      {loading && <Spinner />}
      {changePasswordForm && <ChangePasswordForm />}

      <header className="main-header">
        <div className="main-header__left">
          <Link to="/annual" className="view-toggle">
            <i className="fas fa-calendar-alt"></i>
            <span>연도별 보기</span>
          </Link>
          <div className="header-controls">
            <DateSelector
              year={year}
              month={month}
              setYear={setYear}
              setMonth={setMonth}
            />
            <OptionButton />
          </div>
        </div>

        <div className="main-header__center">
          <button className="nav-btn" onClick={getPrevMonth}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h1 className="current-month">
            {year}년 {month}월
          </h1>
          <button className="nav-btn" onClick={getNextMonth}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="content-grid">
          <section className="summary-section">
            <Account
              income={income}
              saving={saving}
              fixed={fixed}
              monthData={monthData}
              year={year}
              month={month}
              user={user}
            />
          </section>

          <section className="income-section">
            <Income
              categoryTitle="수입"
              setTotalItem={setIncome}
              monthData={monthData}
              user={user}
              year={year}
              month={month}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
            />
            <Saving
              categoryTitle="저축"
              setTotalItem={setSaving}
              monthData={monthData}
              user={user}
              year={year}
              month={month}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
            />
          </section>

          <section className="expense-section">
            <Fixed
              categoryTitle="고정 지출"
              setTotalItem={setFixed}
              monthData={monthData}
              user={user}
              year={year}
              month={month}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
            />
            <Note monthData={monthData} year={year} month={month} user={user} />
          </section>
        </div>

        <section className="details-section">
          <div className="details-grid">
            {DETAIL_CATEGORIES.map((key, index) => (
              <Details
                key={index}
                categoryTitle={key}
                onTotalChange={(total: number) => updateAllTotal(index, total)}
                monthData={monthData}
                year={year}
                user={user}
                month={month}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </section>
      </main>

      <button
        ref={transactionFormButtonRef}
        className={`fab ${transactionForm ? "fab--active" : ""}`}
        onClick={() => setTransactionForm((prev) => !prev)}
      >
        {transactionForm ? (
          <>
            <i className="fas fa-times"></i>
            <span>취소</span>
          </>
        ) : (
          <>
            <i className="fas fa-plus"></i>
            <span>등록</span>
          </>
        )}
      </button>

      {transactionForm && (
        <div className="transaction-form-overlay">
          <TransactionForm
            ref={transactionFormRef}
            monthData={monthData}
            setMonthData={setMonthData}
            year={year}
            month={month}
            user={user}
          />
        </div>
      )}
    </div>
  );
};

export default Main;
