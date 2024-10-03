import React from "react";
import CommonForm from "./CommonForm";

const Fixed = ({ categoryTitle, setFixed, dataBydate, year, month, user }) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      setTotalItem={setFixed}
      color="red"
      year={year}
      month={month}
      dataBydate={dataBydate}
      user={user}
    />
  );
};

export default Fixed;
