import React from "react";
import CommonForm from "./CommonForm";

const Saving = ({ categoryTitle, setSaving, dataBydate, year, month }) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      setTotalItem={setSaving}
      color="blue"
      year={year}
      month={month}
      dataBydate={dataBydate}
    />
  );
};

export default Saving;
