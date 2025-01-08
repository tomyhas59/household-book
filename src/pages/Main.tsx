import { useCallback, useEffect, useRef, useState } from "react";
import Details from "../components/Details";
import Income from "../components/Income";
import Saving from "../components/Saving";
import Fixed from "../components/Fixed";
import styled from "styled-components";
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
} from "../recoil/atoms";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/config";
import Spinner from "../components/Spinner";
import TransactionForm from "../components/TransactionForm";
import { TransactionType } from "../type";

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
  const [transactonForm, setTransactionForm] = useState<boolean>(false);
  const transactionFormRef = useRef<HTMLDivElement>(null);
  const transactionFormButtonRef = useRef<HTMLButtonElement>(null);
  const [draggedTransaction, setDraggedTransacton] =
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
        console.log(response.data);
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

  // 드래그 시작 시 호출
  const handleDragStart = (
    e: React.DragEvent,
    transaction: TransactionType
  ) => {
    if (transaction) {
      setDraggedTransacton(transaction);
    }
  };

  // 드래그한 아이템을 테이블로 드롭 시 호출
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
              ? {
                  ...transaction,
                  type,
                }
              : transaction
        );

        setMonthData((prev) => {
          return {
            ...prev,
            transactions: updatedTransactions,
          };
        });
        setDraggedTransacton(null); // 드래그 종료 후 초기화
      }
    } catch (err) {
      console.error();
    } finally {
      setLoading(false);
    }
  };

  // 드래그 오버 시 기본 동작 방지
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
    [setDetailsTotals]
  );

  const handleLogout = () => {
    localStorage.removeItem("jwt");

    navigator("/");
    console.log("로그아웃 완료");
  };

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
    <MainContainer>
      {loading && <Spinner />}

      <HeaderContainer>
        <DateSelector
          year={year}
          month={month}
          setYear={setYear}
          setMonth={setMonth}
        />
        <HeaderTitle>
          <Button onClick={getPrevMonth}>◀</Button>
          <span>{month}월 데이터</span>
          <Button onClick={getNextMonth}>▶</Button>
        </HeaderTitle>
        <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
      </HeaderContainer>
      <ContentContainer>
        <FlexContainer>
          <ColumnContainer style={{ backgroundColor: "#f0f0f0" }}>
            <Account
              income={income}
              saving={saving}
              fixed={fixed}
              monthData={monthData}
              year={year}
              month={month}
              user={user}
            />
          </ColumnContainer>
          <ColumnContainer>
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
          </ColumnContainer>
          <ColumnContainer>
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
          </ColumnContainer>
        </FlexContainer>
        <DetailsContainer>
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
        </DetailsContainer>
      </ContentContainer>
      <TransactionFormButton
        ref={transactionFormButtonRef}
        onClick={() => setTransactionForm((prev) => !prev)}
      >
        {transactonForm ? "취소" : "등록"}
      </TransactionFormButton>
      {transactonForm && (
        <TransactionForm
          ref={transactionFormRef}
          monthData={monthData}
          setMonthData={setMonthData}
          year={year}
          month={month}
          user={user}
        />
      )}
    </MainContainer>
  );
};

export default Main;

const MainContainer = styled.div``;

const HeaderContainer = styled.header`
  display: flex;
  width: 100%;
  height: 8vh;
  justify-content: start;
  align-items: center;
  background-color: #2c3e50;
  gap: 5px;
  position: relative;
  @media (max-width: 480px) {
    position: fixed;
    display: grid;
    grid-template-columns: 30% 50% 20%;
    align-items: center;
    z-index: 1000;
  }
`;
const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;

  @media (max-width: 480px) {
    font-size: 1rem;
    word-break: keep-all;
    font-size: 0.8rem;
    gap: 10px;
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  @media (max-width: 480px) {
    padding-top: 8vh; // HeaderContainer 높이만큼의 패딩 추가
    * {
      font-size: 12px;
    }
    display: block;
  }
  overflow: hidden;
`;

const FlexContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(33%, 1fr));
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 92vh;
`;

const DetailsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20%, 1fr));
  height: 92vh;
`;

export const LogoutButton = styled.button`
  text-decoration: none;
  color: #000;
  font-size: 16px;
  font-weight: bold;
  padding: 8px;
  border: 2px solid #fff;
  border-radius: 5px;
  transition: all 0.3s ease;
  border: 1px solid;
  cursor: pointer;
  &:hover {
    background-color: #e74c3c;
    color: #fff;
  }
  @media (max-width: 480px) {
    transform: scale(0.7);
  }
`;

const Button = styled.button`
  background-color: transparent;
  color: #fff;
  font-size: 2rem;
  border: none;
  cursor: pointer;
  position: relative;

  &:hover {
    color: #e74c3c;
    -webkit-text-stroke: 1px white;
  }
  @media (max-width: 480px) {
    transform: scale(0.7);
  }
`;

const TransactionFormButton = styled.button`
  position: fixed;
  right: 10%;
  bottom: 10%;
  padding: 12px 24px;
  background-color: #4b9fef;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.3s,
    transform 0.2s;

  &:hover {
    background-color: #4b9fef;
    transform: scale(1.05);
  }

  @media (max-width: 480px) {
    font-size: 14px;
    padding: 10px 20px;
  }
`;
