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
      setDraggedTransaction(transaction);
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
        setDraggedTransaction(null); // 드래그 종료 후 초기화
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
    <Container>
      {loading && <Spinner />}
      {changePasswordForm && <ChangePasswordForm />}
      <HeaderContainer>
        <HeaderLeftSection>
          <PageToggleLink to="/annual">연도별 보기</PageToggleLink>
          <OptionSelectorWrapper>
            <DateSelector
              year={year}
              month={month}
              setYear={setYear}
              setMonth={setMonth}
            />
            <OptionButton />
          </OptionSelectorWrapper>
        </HeaderLeftSection>

        <HeaderTitle>
          <Button onClick={getPrevMonth}>◀</Button>
          <span>{month}월 데이터</span>
          <Button onClick={getNextMonth}>▶</Button>
        </HeaderTitle>
      </HeaderContainer>
      <ContentContainer>
        <FlexContainer>
          <ColumnContainer>
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
        {transactionForm ? "취소" : "등록"}
      </TransactionFormButton>
      {transactionForm && (
        <TransactionForm
          ref={transactionFormRef}
          monthData={monthData}
          setMonthData={setMonthData}
          year={year}
          month={month}
          user={user}
        />
      )}
    </Container>
  );
};

export default Main;

export const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

export const HeaderLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

export const OptionSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  @media (max-width: 768px) {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 5px;
  }
`;

export const PageToggleLink = styled(Link)`
  text-align: center;
  text-decoration: none;
  background-color: #e74c3c;
  border-radius: 8px;
  padding: 10px;
  color: #ffffff;
  display: inline-block;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c0392b;
  }
  @media (max-width: 768px) {
    width: 100%;
    padding: 8px;
  }
`;

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

export const Button = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    color: #3498db;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap; /* 모바일에서 자동 줄 바꿈 */

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  gap: 5px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const DetailsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 20px;
  }
`;
