import React, { useState } from "react";
import Details from "./Details";

const Spending = () => {
  const detailKeys = ["식비", "생필품", "문화생활", "교통비", "기타 등등"];

  const [allTotal, setAllTotal] = useState(
    new Array(detailKeys.length).fill(0)
  );

  const updateAllTotal = (index, total) => {
    const newAllTotal = [...allTotal];
    newAllTotal[index] = total;
    setAllTotal(newAllTotal);
  };

  const grandTotal = allTotal.reduce((acc, total) => acc + total, 0);

  const formattedTatal = grandTotal.toLocaleString();

  return (
    <div>
      <div>이달의 수입</div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {detailKeys.map((key, index) => (
          <Details
            key={index}
            title={key}
            localforageKey={key}
            onTotalChange={(total) => updateAllTotal(index, total)}
            grandTotal={grandTotal}
          />
        ))}
        <div>이달의 소비:{formattedTatal}</div>
      </div>
    </div>
  );
};
export default Spending;
