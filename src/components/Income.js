import React from "react";
import CommonForm from "./CommonForm";

const Income = ({ categoryTitle, setIncome, monthData, year, month, user }) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      setTotalItem={setIncome}
      color="blue"
      year={year}
      month={month}
      monthData={monthData}
      user={user}
    />
  );
};

export default Income;
