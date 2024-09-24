import React from "react";
import CommonForm from "./CommonForm";

const Income = ({ categoryTitle, setIncome, dataBydate, year, month }) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      setTotalItem={setIncome}
      color="blue"
      year={year}
      month={month}
      dataBydate={dataBydate}
    />
  );
};

export default Income;
