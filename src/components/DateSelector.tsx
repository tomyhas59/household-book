// DateSelector.tsx
import { Dispatch, SetStateAction } from "react";
import "../styles/DateSelector.css";

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
    <div className="date-selector">
      <select
        className="date-select"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </select>
      <select
        className="date-select"
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
      >
        {months.map((month) => (
          <option key={month} value={month}>
            {month}월
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateSelector;
