import React from "react";
import CommonForm from "./CommonForm";

const Fixed = ({ categoryTitle, setFixed, dataBydate, year, month }) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      setTotalItem={setFixed}
      color="red"
      year={year}
      month={month}
      dataBydate={dataBydate}
    />
  );
};

export default Fixed;
