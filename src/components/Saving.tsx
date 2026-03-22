import CommonForm, { PropsType } from "./CommonForm";

const Saving: React.FC<PropsType> = ({
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
      color="#10b981"
      year={year}
      month={month}
      user={user}
      monthData={monthData}
      isBar={false}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      setTransactionForm={setTransactionForm}
    />
  );
};

export default Saving;
