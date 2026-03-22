import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { MonthDataType, TransactionType, UserType } from "../type";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { categoryState, livingTotalState, loadingState } from "../recoil/atoms";
import "../styles/CommonForm.css";

export type PropsType = {
  categoryTitle: string;
  setTotalItem?: React.Dispatch<React.SetStateAction<number>>;
  onTotalChange?: (total: number) => void;
  monthData: MonthDataType;
  year: number;
  month: number;
  user: UserType;
  color?: string;
  onDrop: (e: React.DragEvent, type: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, transaction: TransactionType) => void;
  setTransactionForm: React.Dispatch<React.SetStateAction<boolean>>;
};

const CommonForm: React.FC<PropsType & { isBar: Boolean }> = ({
  categoryTitle,
  setTotalItem,
  color,
  monthData,
  year,
  user,
  month,
  onTotalChange,
  isBar,
  onDrop,
  onDragOver,
  onDragStart,
  setTransactionForm,
}) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);
  const [hoveredTitle, setHoveredTitle] = useState(false);
  const [editFormById, setEditFormById] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editDate, setEditDate] = useState<number | "">("");

  const listRef = useRef<HTMLDivElement | null>(null);
  const listItemRef = useRef<HTMLFormElement | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [per, setPer] = useState(0);
  const livingTotal = useRecoilValue(livingTotalState);
  const setLoading = useSetRecoilState(loadingState);
  const setCategory = useSetRecoilState(categoryState);
  useEffect(() => {
    if (monthData && Array.isArray(monthData.transactions)) {
      const categoryData = monthData.transactions
        .filter((item) => item?.type === categoryTitle)
        .sort((a, b) => a!.date - b!.date);
      setTransactions(categoryData);
    } else {
      setTransactions([]);
    }
  }, [monthData, categoryTitle]);

  useEffect(() => {
    const total = transactions
      .filter((transaction) => transaction?.amount !== null)
      .reduce((acc, transaction) => acc + transaction?.amount!, 0);

    const newPercentage = livingTotal > 0 ? (total / livingTotal) * 100 : 0;
    setPer(newPercentage);
    if (setTotalItem) {
      setTotalItem(total);
    }
    if (onTotalChange) {
      onTotalChange(total);
    }

    setTotal(total);
  }, [transactions, setTotalItem, onTotalChange, livingTotal]);

  const copyPreviousMonthData = async () => {
    let previousMonth = month - 1;
    let previousYear = year;

    if (previousMonth < 1) {
      previousMonth = 12;
      previousYear = year - 1;
    }
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/api/getTransactions`, {
        params: {
          month: previousMonth,
          year: previousYear,
          userId: user?.id,
          type: categoryTitle,
        },
      });

      const previousTransactions = response.data;

      if (previousTransactions.length > 0) {
        if (monthData?.id) {
          await axios.delete(`${BASE_URL}/api/deleteAll`, {
            params: {
              userId: user?.id,
              monthId: monthData.id,
              type: categoryTitle,
            },
          });
        }
        const promises = previousTransactions.map(
          async (transaction: TransactionType) => {
            const newTransaction = {
              date: transaction?.date || 0,
              amount: transaction?.amount,
              description: transaction?.description,
              type: categoryTitle,
            };

            const response = await axios.post(
              `${BASE_URL}/api/add`,
              newTransaction,
              {
                params: {
                  monthId: monthData?.id || null,
                  userId: user?.id,
                  year: year,
                  month: month,
                },
              },
            );
            return response.data;
          },
        );

        const newTransactions = await Promise.all(promises);

        const sortedTransactions = newTransactions.sort(
          (a: { date: number }, b: { date: number }) => a.date - b.date,
        );
        setTransactions(sortedTransactions);
      } else {
        alert("이전 달에 복사할 데이터가 없습니다.");
      }
    } catch (err) {
      console.error("데이터 복사 중 오류 발생", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    setLoading(true);

    try {
      await axios.delete(`${BASE_URL}/api/delete`, {
        params: {
          userId: user?.id,
          transactionId: id,
          monthId: monthData?.id,
        },
      });

      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction?.id !== id),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllTransaction = async () => {
    setLoading(true);
    try {
      if (window.confirm("전체 삭제하시겠습니까?")) {
        const response = await axios.delete(`${BASE_URL}/api/deleteAll`, {
          params: {
            userId: user?.id,
            monthId: monthData?.id,
            type: categoryTitle,
          },
        });
        console.log(response.data);
        setTransactions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModifyForm = async (id: number) => {
    const prevTransaction = transactions.find(
      (transaction) => transaction?.id === id,
    );
    setEditFormById(id);
    if (prevTransaction) {
      setEditDescription(prevTransaction.description);
      setEditAmount(prevTransaction.amount);
      setEditDate(prevTransaction.date === 0 ? "" : prevTransaction.date);
    }
  };

  const editTransaction = async (e: SyntheticEvent, id: number) => {
    e.preventDefault();
    if (!editDescription || !editAmount) return;
    setLoading(true);

    const updateTransaction = {
      date: editDate || 0,
      amount: editAmount,
      description: editDescription,
      type: categoryTitle,
    };

    try {
      const response = await axios.put(
        `${BASE_URL}/api/update`,
        updateTransaction,
        {
          params: {
            userId: user?.id,
            transactionId: id,
            monthId: monthData?.id,
          },
        },
      );

      const updatedTransactions = transactions.map((transaction) => {
        if (transaction?.id === id) {
          return {
            ...transaction,
            ...response.data,
          };
        }
        return transaction;
      });

      setTransactions(updatedTransactions);
      setEditFormById(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        listItemRef.current &&
        !listItemRef.current.contains(e.target as Node)
      ) {
        setEditFormById(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [transactions]);

  const handleTransaction = () => {
    setTransactionForm(true);
    setCategory(categoryTitle);
  };
  return (
    <div className="common-form">
      <div
        className="common-form__header"
        onMouseEnter={() => setHoveredTitle(true)}
        onMouseLeave={() => setHoveredTitle(false)}
      >
        <button
          className="copy-btn"
          onClick={copyPreviousMonthData}
          title="이전 달 복사"
        >
          <i className="fas fa-copy"></i>
        </button>
        <h3 className="common-form__title">{categoryTitle}</h3>
        {hoveredTitle && (
          <button
            className="delete-all-btn"
            onClick={deleteAllTransaction}
            title="전체 삭제"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        )}
      </div>

      <div
        className="common-form__list"
        ref={listRef}
        onDrop={(e) => onDrop(e, categoryTitle)}
        onDragOver={onDragOver}
      >
        {transactions.map((transaction) => (
          <React.Fragment key={transaction?.id}>
            {editFormById === transaction?.id ? (
              <form
                className="transaction-edit-form"
                onSubmit={(e) => editTransaction(e, transaction.id)}
                ref={listItemRef}
              >
                <input
                  className="edit-input edit-input--date"
                  type="number"
                  placeholder="날짜"
                  value={editDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditDate(
                      Number(value) > 31 ? Number(value) % 10 : Number(value),
                    );
                  }}
                  min="1"
                  max="31"
                />
                <input
                  className="edit-input edit-input--desc"
                  type="text"
                  placeholder="상세"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <input
                  className="edit-input edit-input--amount"
                  type="number"
                  placeholder="비용"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                />
                <button type="submit" className="edit-btn edit-btn--save">
                  <i className="fas fa-check"></i>
                </button>
                <button
                  type="button"
                  className="edit-btn edit-btn--cancel"
                  onClick={() => setEditFormById(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </form>
            ) : (
              <div
                className="transaction-item"
                onMouseEnter={() => setHoveredItemId(transaction!.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                draggable
                onDragStart={(e) => onDragStart(e, transaction)}
                onClick={() => handleModifyForm(transaction!.id)}
              >
                <span className="transaction-item__date">
                  {transaction?.date ? `${transaction?.date}일` : ""}
                </span>
                <span className="transaction-item__desc">
                  {transaction?.description}
                </span>
                <span
                  className="transaction-item__amount"
                  style={{ color: color }}
                >
                  {transaction?.amount?.toLocaleString()}
                </span>
                {hoveredItemId === transaction?.id ? (
                  <button
                    className="delete-item-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTransaction(transaction.id);
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                ) : (
                  <span className="transaction-item__spacer"></span>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
        <button onClick={handleTransaction}>{categoryTitle} +</button>
      </div>

      <div className="common-form__footer">
        {isBar && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(per, 100)}%` }}
              >
                <span>{per.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
        <div className="common-form__total" style={{ color: color }}>
          {total?.toLocaleString()}원
        </div>
      </div>
    </div>
  );
};

export default CommonForm;
