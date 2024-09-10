import React from "react";
import CommonForm from "./CommonForm";

const Income = ({ setIncome, dataBydate, year, month }) => {
  const title = "수입";

  return (
    <CommonForm
      title={title}
      setTotalItem={setIncome}
      color="blue"
      year={year}
      month={month}
      dataBydate={dataBydate}
    />
  );
};

export default Income;
