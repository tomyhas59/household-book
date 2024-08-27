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
          <NoteContainer>
            <Label>노트</Label>
            <Form onSubmit={""}>
              <TextArea />
              <Button type="submit">등록</Button>
            </Form>
          </NoteContainer>
        </ColumnContainer>
        <ColumnContainer>
          <Income setIncome={setIncome} />
          <Saving setSaving={setSaving} />
        </ColumnContainer>
        <ColumnContainer>
          <Fixed setFixed={setFixed} />
        </ColumnContainer>
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(33%, 1fr));
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

const NoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
`;

const Label = styled.label`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    outline: none;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;
