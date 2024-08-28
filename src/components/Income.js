import React from "react";
import CommonForm from "./CommonForm";

const Income = ({ setIncome, dateKey, dataBydate }) => {
  const title = "수입";

  return (
    <CommonForm
      title={title}
      setTotalItem={setIncome}
      color="blue"
      dateKey={dateKey}
      dataBydate={dataBydate}
    />
  );
};

export default Income;
