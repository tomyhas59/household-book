import CommonForm, { PropsType } from "./CommonForm";

const Fixed: React.FC<PropsType> = ({
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
      color="red"
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

export default Fixed;
