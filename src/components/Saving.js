import React from "react";
import CommonForm from "./CommonForm";

const Saving = ({
  categoryTitle,
  setSaving,
  dataBydate,
  year,
  month,
  user,
}) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      setTotalItem={setSaving}
      color="blue"
      year={year}
      month={month}
      user={user}
      dataBydate={dataBydate}
    />
  );
};

export default Saving;
