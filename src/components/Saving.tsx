import CommonForm, { PropsType } from "./CommonForm";

const Saving: React.FC<PropsType> = ({
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
      user={user}
      monthData={monthData}
      height="50%"
      isBar={false}
    />
  );
};

export default Saving;
