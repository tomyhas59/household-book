import localforage from "localforage";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Annual = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [yearData, setYearData] = useState({});

  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);

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

  return (
    <div>
      <div>연간 결산 페이지</div>
      <Select value={year} onChange={(e) => setYear(e.target.value)}>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </Select>

      {Object.keys(yearData).map((month) => (
        <div key={month}>
          <h2>{month}월</h2>
          <p>
            수입:
            {yearData[month]["수입"].reduce((a, c) => a + c.amount, 0)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Annual;

const Select = styled.select`
  appearance: none;
  border: none;
  background-color: inherit;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  padding: 10px;
  cursor: pointer;
  position: relative;
  &:hover {
    color: silver;
  }
`;
