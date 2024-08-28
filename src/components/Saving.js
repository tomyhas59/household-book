import React from "react";
import CommonForm from "./CommonForm";

const Saving = ({ setSaving, dateKey, dataBydate }) => {
  const title = "저축";

  return (
    <CommonForm
      title={title}
      setTotalItem={setSaving}
      color="blue"
      dateKey={dateKey}
      dataBydate={dataBydate}
    />
  );
};

export default Saving;
