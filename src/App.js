import React, { useEffect, useMemo, useState } from "react";
import Details from "./components/Details";
import localforage from "localforage";
import Income from "./components/Income";
import Saving from "./components/Saving";
import Fixed from "./components/Fixed";
import styled from "styled-components";
import Account from "./components/Account";
import Result from "./components/Result";
import DateSelector from "./components/DateSelector";

const App = () => {
  const detailKeys = useMemo(
    () => ["식비", "생필품", "문화생활", "교통비", "의료 및 기타"],
    []
  );
  const [detailsTotals, setDetailsTotals] = useState(
    new Array(detailKeys.length).fill(0)
  );
  const [income, setIncome] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [saving, setSaving] = useState(0);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const loadData = async () => {
      const totals = await Promise.all(
        detailKeys.map(async (item) => {
          const obj = await localforage.getItem(item);
          if (obj) {
            return obj.reduce((acc, item) => acc + item.amount, 0);
          }
          return 0;
        })
      );
      setDetailsTotals(totals);
    };

    loadData();
  }, [detailKeys]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const obj = await localforage.getItem("수입");
        const total = obj ? obj.reduce((acc, item) => acc + item.amount, 0) : 0;
        setIncome(total);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    loadData();
  }, [income]);

  const updateAllTotal = (index, total) => {
    const newAllTotals = [...detailsTotals];
    newAllTotals[index] = total;
    setDetailsTotals(newAllTotals);
  };

  const livingTotal = detailsTotals.reduce((acc, total) => acc + total, 0);

  return (
    <AppContainer>
      <FlexContainer>
        <ColumnContainer style={{ backgroundColor: "#f0f0f0" }}>
          <DateSelector
            selectedYear={year}
            selectedMonth={month}
            onYearChange={setYear}
            onMonthChange={setMonth}
          />
          <Account income={income} saving={saving} fixed={fixed} />
          <Result
            livingTotal={livingTotal}
            income={income}
            fixed={fixed}
            saving={saving}
          />
        </ColumnContainer>
        <ColumnContainer>
          <Income setIncome={setIncome} />
          <Saving setSaving={setSaving} />
        </ColumnContainer>
        <Fixed setFixed={setFixed} />
      </FlexContainer>
      <DetailsContainer>
        {detailKeys.map((key, index) => (
          <Details
            key={index}
            title={key}
            localforageKey={key}
            onTotalChange={(total) => updateAllTotal(index, total)}
            livingTotal={livingTotal}
          />
        ))}
      </DetailsContainer>
    </AppContainer>
  );
};

export default App;

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  @media (max-width: 480px) {
    * {
      font-size: 12px;
    }
    display: block;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 100vh;
`;
const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DetailsContainer = styled.div`
  display: flex;
  height: 100vh;
`;
