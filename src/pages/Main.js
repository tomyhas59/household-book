import React, { useCallback, useEffect, useMemo, useState } from "react";
import Details from "../components/Details";
import localforage from "localforage";
import Income from "../components/Income";
import Saving from "../components/Saving";
import Fixed from "../components/Fixed";
import styled from "styled-components";
import Account from "../components/Account";
import DateSelector from "../components/DateSelector";
import Note from "../components/Note";

const Main = () => {
  const detailCategory = useMemo(
    () => ["식비", "생필품", "문화생활", "교통비", "의료 및 기타"],
    []
  );
  const [detailsTotals, setDetailsTotals] = useState(
    new Array(detailCategory.length).fill(0)
  );

  const [income, setIncome] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [saving, setSaving] = useState(0);

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [dataBydate, setDataByDate] = useState({});

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
  }, [year, month]);

  const updateAllTotal = useCallback((index, total) => {
    setDetailsTotals((prevTotals) => {
      const newAllTotals = [...prevTotals];
      if (newAllTotals[index] !== total) {
        newAllTotals[index] = total;
        return newAllTotals;
      }
      return prevTotals;
    });
  }, []);

  const livingTotal = detailsTotals.reduce((acc, total) => acc + total, 0);

  return (
    <MainContainer>
      <FlexContainer>
        <ColumnContainer style={{ backgroundColor: "#f0f0f0" }}>
          <DateSelector
            year={year}
            month={month}
            setYear={setYear}
            setMonth={setMonth}
          />
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
    </MainContainer>
  );
};

export default Main;

const MainContainer = styled.div`
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
  height: 100vh;
`;

const DetailsContainer = styled.div`
  display: flex;
  height: 100vh;
`;
