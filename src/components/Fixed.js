import React from "react";
import CommonForm from "./CommonForm";

const Fixed = ({ setFixed, dateKey, dataBydate }) => {
  const title = "고정 지출";

  return (
    <CommonForm
      title={title}
      setTotalItem={setFixed}
      color="red"
      dateKey={dateKey}
      dataBydate={dataBydate}
    />
  );
};

export default Fixed;
