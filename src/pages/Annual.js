import React, { useState } from "react";
import styled from "styled-components";

const Annual = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);

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
