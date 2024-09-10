import React from "react";
import CommonForm from "./CommonForm";

const Fixed = ({ setFixed, dataBydate, year, month }) => {
  const title = "고정 지출";

  return (
    <CommonForm
      title={title}
      setTotalItem={setFixed}
      color="red"
      year={year}
      month={month}
      dataBydate={dataBydate}
    />
  );
};

export default Fixed;
