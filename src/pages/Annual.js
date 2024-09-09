import localforage from "localforage";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Annual = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [yearData, setYearData] = useState({});

  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

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

  const totalIncome = months.reduce((total, month) => {
    if (yearData[month] && yearData[month]["수입"]) {
      return total + yearData[month]["수입"].reduce((a, c) => a + c.amount, 0);
    }
    return total;
  }, 0);

  return (
    <Container>
      <Header>연간 결산 페이지</Header>
      <Select value={year} onChange={(e) => setYear(e.target.value)}>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </Select>
      <MonthList>
        {months.map((month) => (
          <MonthContainer key={month}>
            <MonthTitle>{month}월</MonthTitle>
            {["수입", "고정 지출", "저축"].map((category) => (
              <Category>
                <span>{category}:</span>
                <Amount style={{ color: category === "고정 지출" && "red" }}>
                  {yearData[month] && yearData[month][category]
                    ? yearData[month][category]
                        .reduce((a, c) => a + c.amount, 0)
                        .toLocaleString()
                    : "0"}
                  원
                </Amount>
              </Category>
            ))}
          </MonthContainer>
        ))}
        <div>총 수입:{totalIncome.toLocaleString()}</div>
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
  grid-template-columns: repeat(auto-fit, minmax(100px, 250px));
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
  font-size: 1.2rem;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
`;

const Amount = styled.span`
  font-weight: bold;
  color: #1e90ff;
`;
