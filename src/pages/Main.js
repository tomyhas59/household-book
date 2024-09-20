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
  dataByDateState,
  livingTotalState,
} from "../recoil/atoms";

const Main = () => {
  const setDetailsTotals = useSetRecoilState(detailsTotalsState);
  const [income, setIncome] = useRecoilState(incomeState);
  const [fixed, setFixed] = useRecoilState(fixedState);
  const [saving, setSaving] = useRecoilState(savingState);
  const [year, setYear] = useRecoilState(yearState);
  const [month, setMonth] = useRecoilState(monthState);
  const [dataBydate, setDataByDate] = useRecoilState(dataByDateState);

  const detailCategory = useMemo(
    () => ["식비", "생필품", "문화생활", "교통비", "의료 및 기타"],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const yearData = await localforage.getItem(year);

        if (!yearData) {
          setDataByDate({});
          return;
        }
        const existingMonthData = yearData[month] || {};
        setDataByDate(existingMonthData);
      } catch (error) {
        console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
        setDataByDate({});
      }
    };
    if (year && month) {
      fetchData();
    }
  }, [year, month, setDataByDate]);

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

  return (
    <MainContainer>
      <HeaderContainer>
        <DateSelector
          year={year}
          month={month}
          setYear={setYear}
          setMonth={setMonth}
        />
        <HeaderTitle>월별 데이터</HeaderTitle>
      </HeaderContainer>
      <ContentContainer>
        <FlexContainer>
          <ColumnContainer style={{ backgroundColor: "#f0f0f0" }}>
            <Account
              income={income}
              saving={saving}
              fixed={fixed}
              livingTotal={livingTotal}
              dataBydate={dataBydate}
              year={year}
              month={month}
            />
          </ColumnContainer>
          <ColumnContainer>
            <Income
              setIncome={setIncome}
              dataBydate={dataBydate}
              livingTotal={livingTotal}
              income={income}
              year={year}
              month={month}
            />
            <Saving
              setSaving={setSaving}
              dataBydate={dataBydate}
              income={income}
              saving={saving}
              year={year}
              month={month}
            />
          </ColumnContainer>
          <ColumnContainer>
            <Fixed
              setFixed={setFixed}
              dataBydate={dataBydate}
              income={income}
              fixed={fixed}
              year={year}
              month={month}
            />
            <Note dataBydate={dataBydate} year={year} month={month} />
          </ColumnContainer>
        </FlexContainer>
        <DetailsContainer>
          {detailCategory.map((key, index) => (
            <Details
              key={index}
              title={key}
              detailCategory={key}
              onTotalChange={(total) => updateAllTotal(index, total)}
              livingTotal={livingTotal}
              dataBydate={dataBydate}
              year={year}
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
  height: 8vh;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;

  @media (max-width: 768px) {
    height: auto;
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
