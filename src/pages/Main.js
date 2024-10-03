import React, { useCallback, useEffect, useMemo } from "react";
import Details from "../components/Details";
import localforage from "localforage";
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
  livingTotalState,
  userState,
} from "../recoil/atoms";
import { Navigate } from "react-router-dom";
import axios from "axios";

const Main = () => {
  const setDetailsTotals = useSetRecoilState(detailsTotalsState);
  const [income, setIncome] = useRecoilState(incomeState);
  const [fixed, setFixed] = useRecoilState(fixedState);
  const [saving, setSaving] = useRecoilState(savingState);
  const [year, setYear] = useRecoilState(yearState);
  const [month, setMonth] = useRecoilState(monthState);
  const [monthData, setMonthData] = useRecoilState(monthDataState);
  const [user, setUser] = useRecoilState(userState);

  const detailCategory = useMemo(
    () => ["식비", "생필품", "문화생활", "교통비", "의료 및 기타"],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8090/api/getMonth", {
          params: {
            userId: user.id,
            year: year,
            month: month,
          },
        });

        if (!response) {
          setMonthData({});
          return;
        }
        const existingMonthData = response.data || {};
        setMonthData(existingMonthData);
      } catch (error) {
        console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
        setMonthData({});
      }
    };
    if (year && month) {
      fetchData();
    }
  }, [user, year, month, setMonthData]);

  const updateAllTotal = useCallback(
    (index, total) => {
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

  const livingTotal = useRecoilValue(livingTotalState);

  const handleLogout = () => {
    localStorage.removeItem("jwt");

    setUser(null);
    console.log("로그아웃 완료");
  };

  if (!user) {
    return <Navigate to="/" replace />;
  } else
    return (
      <MainContainer>
        <HeaderContainer>
          <DateSelector
            year={year}
            month={month}
            setYear={setYear}
            setMonth={setMonth}
          />
          <HeaderTitle>{user.nickname}의 월별 데이터</HeaderTitle>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </HeaderContainer>
        <ContentContainer>
          <FlexContainer>
            <ColumnContainer style={{ backgroundColor: "#f0f0f0" }}>
              <Account
                income={income}
                saving={saving}
                fixed={fixed}
                livingTotal={livingTotal}
                monthData={monthData}
                year={year}
                month={month}
                user={user}
              />
            </ColumnContainer>
            <ColumnContainer>
              <Income
                categoryTitle="수입"
                setIncome={setIncome}
                monthData={monthData}
                livingTotal={livingTotal}
                income={income}
                user={user}
                year={year}
                month={month}
              />
              <Saving
                categoryTitle="저축"
                setSaving={setSaving}
                monthData={monthData}
                income={income}
                saving={saving}
                user={user}
                year={year}
                month={month}
              />
            </ColumnContainer>
            <ColumnContainer>
              <Fixed
                categoryTitle="고정 지출"
                setFixed={setFixed}
                monthData={monthData}
                income={income}
                fixed={fixed}
                user={user}
                year={year}
                month={month}
              />
              <Note
                monthData={monthData}
                year={year}
                month={month}
                user={user}
              />
            </ColumnContainer>
          </FlexContainer>
          <DetailsContainer>
            {detailCategory.map((key, index) => (
              <Details
                key={index}
                categoryTitle={key}
                onTotalChange={(total) => updateAllTotal(index, total)}
                livingTotal={livingTotal}
                monthData={monthData}
                year={year}
                user={user}
                month={month}
              />
            ))}
          </DetailsContainer>
        </ContentContainer>
      </MainContainer>
    );
};

export default Main;

const MainContainer = styled.div``;

const HeaderContainer = styled.header`
  display: flex;
  width: 100%;
  height: 8vh;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  @media (max-width: 768px) {
    position: fixed;
    z-index: 1000;
  }
`;
const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  flex-grow: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  @media (max-width: 768px) {
    position: static;
    transform: none;
    font-size: 1.5rem;
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
  display: flex;
  height: 92vh;
`;

export const LogoutButton = styled.button`
  text-decoration: none;
  color: #000;
  font-size: 16px;
  font-weight: bold;
  padding: 10px 20px;
  border: 2px solid #fff;
  border-radius: 5px;
  transition: all 0.3s ease;
  cursor: pointer;
  &:hover {
    background-color: #512da8;
    color: #fff;
  }
`;
