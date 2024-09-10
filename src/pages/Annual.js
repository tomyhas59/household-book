import localforage from "localforage";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProgressBar, ProgressContainer } from "../components/Details";
import { Link } from "react-router-dom";

const Annual = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [yearData, setYearData] = useState({});

  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const detailCategory = useMemo(
    () => ["식비", "생필품", "문화생활", "교통비", "의료 및 기타"],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await localforage.getItem(year);
        if (data) {
          setYearData(data);
        } else {
          setYearData({});
        }
      } catch (error) {
        console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
        setYearData({});
      }
    };

    fetchData();
  }, [year]);

  //1~12월 수입 총합
  const totalIncome = () =>
    months.reduce((total, month) => {
      if (yearData[month] && yearData[month]["수입"]) {
        return (
          total + yearData[month]["수입"].reduce((a, c) => a + c.amount, 0)
        );
      }
      return total;
    }, 0);
  //생활비 총 지출
  const totalDetails = (month) =>
    detailCategory.reduce((total, category) => {
      if (yearData[month] && yearData[month][category]) {
        return (
          total + yearData[month][category].reduce((a, c) => a + c.amount, 0)
        );
      }
      return total;
    }, 0);

  const calculate = (month) => {
    const income =
      yearData[month]?.["수입"]?.reduce((a, c) => a + c.amount, 0) || 0;
    const spending =
      yearData[month]?.["고정 지출"]?.reduce((a, c) => a + c.amount, 0) +
        totalDetails(month) || 0;
    const savings =
      yearData[month]?.["저축"]?.reduce((a, c) => a + c.amount, 0) || 0;

    const spendingRate = income ? (spending / income) * 100 : 0;
    const savingsRate = income ? (savings / income) * 100 : 0;

    return { income, spending, savings, spendingRate, savingsRate };
  };

  return (
    <Container>
      <HomeButton to="/">홈으로</HomeButton>
      <Header>연간 결산</Header>
      <Select value={year} onChange={(e) => setYear(e.target.value)}>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </Select>
      <AccountSection style={{ width: "200px" }}>
        <p>총 수입</p>
        <Amount>{totalIncome().toLocaleString()}원</Amount>
      </AccountSection>
      <MonthList>
        {months.map((month) => {
          const { income, spending, savings, spendingRate, savingsRate } =
            calculate(month);
          return (
            <MonthContainer key={month}>
              <MonthTitle>{month}월</MonthTitle>
              <Category>
                <AccountSection>
                  <p>수입</p>
                  <Amount>{income.toLocaleString()}</Amount>
                </AccountSection>
                <AccountSection>
                  <p>지출</p>
                  <Amount style={{ color: "crimson" }}>
                    {spending.toLocaleString()}
                  </Amount>
                </AccountSection>
                <ProgressContainer>
                  <ProgressBar $percentage={spendingRate}>
                    <p>{spendingRate.toFixed(0)}%</p>
                  </ProgressBar>
                </ProgressContainer>
                <AccountSection>
                  <p>저축</p>
                  <Amount>{savings.toLocaleString()}</Amount>
                </AccountSection>
                <ProgressContainer>
                  <ProgressBar
                    $percentage={savingsRate}
                    style={{ backgroundColor: " #3498db" }}
                  >
                    <p>{savingsRate.toFixed(0)}%</p>
                  </ProgressBar>
                </ProgressContainer>
              </Category>
            </MonthContainer>
          );
        })}
      </MonthList>
    </Container>
  );
};

export default Annual;

const Container = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
`;

const Header = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
`;

const Select = styled.select`
  appearance: none;
  border: 2px solid #ddd;
  background-color: #fff;
  font-size: 1.2rem;
  padding: 10px;
  margin-bottom: 20px;
  cursor: pointer;
  &:hover {
    border-color: #aaa;
  }
`;

const MonthList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 200px));
  gap: 10px;
`;

const MonthContainer = styled.div`
  padding: 15px;
  background-color: #fff;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const MonthTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
`;

const Category = styled.div`
  font-size: 1rem;
  margin-bottom: 8px;
`;

const Amount = styled.div`
  font-weight: bold;
  color: #1e90ff;
`;

const AccountSection = styled.div`
  display: flex;
  justify-content: space-between;
  background: white;
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  > p {
    margin: 2px;
  }
`;

const HomeButton = styled(Link)`
  text-decoration: none;
  font-size: 9px;
  background-color: lightcoral;
  border-radius: 5px;
  padding: 3px;
  color: #fff;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(2px);
    color: firebrick;
  }
`;
