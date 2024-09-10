import React from "react";
import CommonForm from "./CommonForm";

const Saving = ({ setSaving, dataBydate, year, month }) => {
  const title = "저축";

  return (
    <CommonForm
      title={title}
      setTotalItem={setSaving}
      color="blue"
      year={year}
      month={month}
      dataBydate={dataBydate}
    />
  );
};

export default Saving;
