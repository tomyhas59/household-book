import React, { useEffect, useMemo, useState } from "react";
import Details from "./Details";
import localforage from "localforage";

const Spending = () => {
  const detailKeys = useMemo(
    () => ["식비", "생필품", "문화생활", "교통비", "의료비 및 기타 등등"],
    []
  );
  const [allTotals, setAllTotals] = useState(
    new Array(detailKeys.length).fill(0)
  );

  useEffect(() => {
    const loadTotals = async () => {
      const totals = await Promise.all(
        detailKeys.map(async (item) => {
          const obj = await localforage.getItem(item);
          if (obj) {
            return obj.reduce((acc, item) => acc + item.amount, 0);
          }
          return 0;
        })
      );
      setAllTotals(totals);
    };

    loadTotals();
  }, [detailKeys]);

  const updateAllTotal = (index, total) => {
    const newAllTotals = [...allTotals];
    newAllTotals[index] = total;
    setAllTotals(newAllTotals);
  };

  const grandTotal = allTotals.reduce((acc, total) => acc + total, 0);

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
