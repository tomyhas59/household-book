import React from "react";
import styled from "styled-components";

const DateSelector = ({ year, month, setYear, setMonth }) => {
  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <DateContainer>
      <Select value={year} onChange={(e) => setYear(e.target.value)}>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </Select>
      <Select value={month} onChange={(e) => setMonth(e.target.value)}>
        {months.map((month) => (
          <option key={month} value={month}>
            {month.toString().padStart(2, "0")}월
          </option>
        ))}
      </Select>
    </DateContainer>
  );
};

export default DateSelector;

const DateContainer = styled.div`
  display: flex;
  width: 100%;
  height: 10vh;
  background-image: linear-gradient(to right, #ffcccc, #cce6ff);
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
`;

const Select = styled.select`
  display: block;
  appearance: none; //화살표 제거
  background-color: inherit;
  font-size: 2rem;
  font-weight: bold;
  border: none;
  color: black;
  padding: 5px;
  cursor: pointer;
  margin: 0 auto;
`;
