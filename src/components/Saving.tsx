import CommonForm from "./CommonForm";
import { PropsType } from "./Details";

const Saving: React.FC<Omit<PropsType, "onTotalChange" | "livingTotal">> = ({
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
    />
  );
};

export default Saving;
