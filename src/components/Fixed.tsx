import CommonForm, { PropsType } from "./CommonForm";

const Fixed: React.FC<PropsType> = ({
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
      color="red"
      year={year}
      month={month}
      monthData={monthData}
      user={user}
      height="50%"
      isBar={false}
    />
  );
};

export default Fixed;
