import React from "react";
import styled from "styled-components";

const DateSelector = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}) => {
  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <DateContainer>
      <Select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </Select>

      <Select
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
      >
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
  background-image: linear-gradient(to right, #ffcccc, #cce6ff);
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
`;

const Select = styled.select`
  appearance: none; //화살표 제거
  background-color: inherit;
  font-size: 2rem;
  font-weight: bold;
  border: none;
  color: black;
  padding: 5px;
  cursor: pointer;
`;
