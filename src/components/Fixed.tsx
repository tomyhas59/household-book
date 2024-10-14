import CommonForm from "./CommonForm";
import { PropsType } from "./Details";

const Fixed: React.FC<Omit<PropsType, "onTotalChange" | "livingTotal">> = ({
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
    />
  );
};

export default Fixed;
