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
  setTransactionForm,
}) => {
  return (
    <CommonForm
      categoryTitle={categoryTitle}
      setTotalItem={setTotalItem}
      color="#ef4444"
      year={year}
      month={month}
      monthData={monthData}
      user={user}
      isBar={false}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      setTransactionForm={setTransactionForm}
    />
  );
};

export default Fixed;
