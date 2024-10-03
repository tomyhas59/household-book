import React from "react";
import CommonForm from "./CommonForm";

const Income = ({
  categoryTitle,
  setIncome,
  dataBydate,
  year,
  month,
  user,
}) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      setTotalItem={setIncome}
      color="blue"
      year={year}
      month={month}
      dataBydate={dataBydate}
      user={user}
    />
  );
};

export default Income;
