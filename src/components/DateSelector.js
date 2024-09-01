import React from "react";
import styled from "styled-components";

const DateSelector = ({ year, month, setYear, setMonth }) => {
  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <DateContainer>
      <SelectContainer>
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
              {month.toString().padStart(2, "0")}월입니다
            </option>
          ))}
        </Select>
      </SelectContainer>
    </DateContainer>
  );
};

export default DateSelector;

const DateContainer = styled.div`
  width: 100%;
  height: 10vh;
  background-image: linear-gradient(to right, #ffcccc, #cce6ff);
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
`;

const SelectContainer = styled.div`
  display: flex;
`;
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
  transition: transform 0.6s;
  &:hover {
    transform: scale(1.3);
  }
`;
