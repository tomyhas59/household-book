import React from "react";
import CommonForm from "./CommonForm";

const Fixed = ({ categoryTitle, setFixed, monthData, year, month, user }) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      setTotalItem={setFixed}
      color="red"
      year={year}
      month={month}
      monthData={monthData}
      user={user}
    />
  );
};

export default Fixed;
