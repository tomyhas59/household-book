import React from "react";
import CommonForm, { PropsType } from "./CommonForm";

const Details: React.FC<PropsType> = ({
  categoryTitle,
  onTotalChange,
  monthData,
  year,
  month,
  user,
  onDrop,
  onDragOver,
  onDragStart,
}) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      onTotalChange={onTotalChange}
      monthData={monthData}
      year={year}
      month={month}
      user={user}
      color="#f59e0b"
      isBar={true}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
    />
  );
};

export default Details;
