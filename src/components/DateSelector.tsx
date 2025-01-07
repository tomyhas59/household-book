import styled from "styled-components";
import { Link } from "react-router-dom";
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
    <DateContainer>
      <AnnualButton to="/annual">연도별 보기</AnnualButton>
      <SelectContainer>
        <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </Select>
        <Select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
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
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  > p {
    color: #fff;
    font-weight: bold;
  }
  @media (max-width: 468px) {
    transform: scale(0.8);
    flex-direction: column;
  }
`;

const SelectContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const Select = styled.select`
  appearance: none;
  border: 2px solid #ecf0f1;
  background-color: #ffffff;
  font-size: 1rem;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #2c3e50;
  cursor: pointer;

  &:hover {
    border-color: #7f8fa6;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 8px;
  }
`;

const AnnualButton = styled(Link)`
  width: 100%;
  text-align: center;
  text-decoration: none;
  background-color: #e74c3c;
  border-radius: 8px;
  padding: 10px;
  color: #ffffff;
  display: inline-block;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c0392b;
  }
  @media (max-width: 480px) {
    width: 80px;
    font-size: 0.7rem;
  }
`;
