import React from "react";
import styled from "styled-components";
import sky from "../img/sky.png";
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
      <SelectWrapper>
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
      </SelectWrapper>
      <SelectWrapper>
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
      </SelectWrapper>
    </DateContainer>
  );
};

export default DateSelector;

const DateContainer = styled.div`
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${sky});
  background-repeat: no-repeat;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
`;

const SelectWrapper = styled.div`
  position: relative;
  margin-right: 10px;
`;

const Select = styled.select`
  appearance: none; //화살표 제거
  background-color: inherit;
  font-size: 2rem;
  border: none;
  color: black;
  padding: 5px;
  cursor: pointer;
`;
