import styled from "styled-components";
import { Dispatch, SetStateAction } from "react";

type PropsType = {
  year: number;
  month: number;
  setYear: Dispatch<SetStateAction<number>>;
  setMonth: Dispatch<SetStateAction<number>>;
};

const DateSelector: React.FC<PropsType> = ({
  year,
  month,
  setYear,
  setMonth,
}) => {
  const years = Array.from({ length: 10 }, (_, i) => (2024 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <SelectContainer>
      <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </Select>
      <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
        {months.map((month) => (
          <option key={month} value={month}>
            {month}월
          </option>
        ))}
      </Select>
    </SelectContainer>
  );
};

export default DateSelector;

const SelectContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const Select = styled.select`
  appearance: none;
  border: 2px solid #ecf0f1;
  background-color: #ffffff;
  padding: 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #2c3e50;
  cursor: pointer;
  text-align: center;
  &:hover {
    border-color: #7f8fa6;
  }
  @media (max-width: 768px) {
    width: 100%;
    padding: 10px;
  }
`;
