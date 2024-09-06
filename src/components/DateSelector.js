import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const DateSelector = ({ year, month, setYear, setMonth }) => {
  const years = Array.from({ length: 10 }, (_, i) => (2024 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <DateContainer>
      <AnnualButton to="/annual">연간 결산</AnnualButton>
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
              {month}월
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
  position: relative;
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
  &:hover {
    color: silver;
  }
`;

const AnnualButton = styled(Link)`
  position: absolute;
  top: 0;
  left: 0;
  text-decoration: none;
  font-size: 12px;
  background-color: lightcoral;
  border-radius: 5px;
  padding: 5px;
  color: #fff;
  transition: transform 0.2s;
  font-weight: bold;
  &:hover {
    transform: translateY(2px);
    color: firebrick;
  }
`;
