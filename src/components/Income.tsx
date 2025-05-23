import CommonForm, { PropsType } from "./CommonForm";

const Income: React.FC<PropsType> = ({
  categoryTitle,
  setTotalItem,
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
      setTotalItem={setTotalItem}
      color="blue"
      year={year}
      month={month}
      monthData={monthData}
      user={user}
      isBar={false}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
    />
  );
};

export default Income;
