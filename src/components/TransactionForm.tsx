import axios from "axios";
import React, {
  forwardRef,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { BASE_URL } from "../config/config";
import { MonthDataType, UserType } from "../type";
import { DETAIL_CATEGORIES } from "../pages/Main";
import { useRecoilState, useSetRecoilState } from "recoil";
import { categoryState, loadingState } from "../recoil/atoms";
import "../styles/TransactionForm.css";

export type PropsType = {
  setMonthData: React.Dispatch<React.SetStateAction<MonthDataType>>;
  monthData: MonthDataType;
  year: number;
  month: number;
  user: UserType;
  setTransactionForm: React.Dispatch<React.SetStateAction<boolean>>;
};

const TransactionForm = forwardRef<HTMLDivElement, PropsType>(
  (
    {
      setMonthData,
      monthData,
      user,
      year,
      month,
      setTransactionForm,
    }: PropsType,
    ref,
  ) => {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState<number | "">("");
    const [categoryTitle, setCategoryTitle] = useRecoilState(categoryState);
    const dateRef = useRef<HTMLInputElement | null>(null);
    const setLoading = useSetRecoilState(loadingState);

    const addTransaction = async (e: SyntheticEvent) => {
      e.preventDefault();
      if (!description || Number(amount) <= 0) return;
      setLoading(true);
      const newTransaction = {
        date: date || 0,
        amount: parseFloat(amount),
        description,
        type: categoryTitle,
      };

      try {
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

        setAmount("");
        setDate("");
        setDescription("");

        setMonthData((prev) => {
          if (prev?.transactions) {
            return {
              ...prev,
              transactions: [...prev.transactions, response.data],
            };
          }
          return prev;
        });
        if (dateRef.current) dateRef.current.focus();
      } catch (err) {
        console.error("transaction add error", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (dateRef.current) dateRef.current.focus();
    }, [dateRef]);

    const allCategories = [
      ...DETAIL_CATEGORIES,
      "수입",
      "고정 지출",
      "저축",
    ].sort((a, b) => a.localeCompare(b));

    const handleClose = () => {
      setTransactionForm(false);
    };
    return (
      <div className="transaction-form-container">
        <div className="transaction-form-card" ref={ref}>
          <div className="transaction-form-header">
            <i className="fas fa-plus-circle"></i>
            <h3>새 거래 추가</h3>
            <button onClick={handleClose}>닫기</button>
          </div>

          <form className="transaction-form" onSubmit={addTransaction}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-calendar-day"></i>
                  날짜
                </label>
                <input
                  ref={dateRef}
                  className="form-input"
                  type="number"
                  placeholder="1-31"
                  value={date}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDate(
                      Number(value) > 31 ? Number(value) % 10 : Number(value),
                    );
                  }}
                  min="1"
                  max="31"
                />
              </div>

              <div className="form-group form-group--wide">
                <label className="form-label">
                  <i className="fas fa-file-alt"></i>
                  상세
                </label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="거래 내용을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-won-sign"></i>
                  금액
                </label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="금액"
                  value={amount}
                  min="0"
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-tags"></i>
                카테고리
              </label>
              <div className="category-grid">
                {allCategories.map((category) => (
                  <label key={category} className="category-option">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={categoryTitle === category}
                      onChange={() => setCategoryTitle(category)}
                    />
                    <span className="category-label">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-button">
              <i className="fas fa-check"></i>
              <span>추가하기</span>
            </button>
          </form>
        </div>
      </div>
    );
  },
);

export default TransactionForm;
