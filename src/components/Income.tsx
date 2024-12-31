import CommonForm, { PropsType } from "./CommonForm";

const Income: React.FC<PropsType> = ({
  categoryTitle,
  setTotalItem,
  monthData,
  year,
  month,
  user,
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
      height="50%"
      isBar={false}
    />
  );
};

export default Income;