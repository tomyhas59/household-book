import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  monthState,
  userState,
  yearState,
  loadingState,
  changePasswordFormState,
} from "../recoil/atoms";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { DETAIL_CATEGORIES } from "./Main";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { MonthDataType } from "../type";
import Spinner from "../components/Spinner";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { Link } from "react-router-dom";
import "../styles/Annual.css";
import Header from "../components/Header";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = {
  fixed: "#FF6384",
  savings: "#36A2EB",
  food: "#FFCE56",
  necessity: "#4BC0C0",
  culture: "#9966FF",
  transportation: "#FF9F40",
  others: "#B2FF66",
  remaining: "#E7E9ED",
};

const Annual = () => {
  const [year, setYear] = useRecoilState(yearState);
  const [yearData, setYearData] = useState<MonthDataType[]>([]);
  const navigate = useNavigate();
  const setRecoilMonth = useSetRecoilState(monthState);
  const setRecoilYear = useSetRecoilState(yearState);
  const user = useRecoilValue(userState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const changePasswordForm = useRecoilValue(changePasswordFormState);

  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await axios.get(`${BASE_URL}/api/getYear`, {
          params: {
            userId: user?.id,
            year: year,
          },
        });
        setYearData(response.data || []);
      } catch (error) {
        console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
        setYearData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLoading, user, year]);

  const calculateTotal = useCallback(
    (month: number, category: string) => {
      if (yearData.length > 0) {
        const monthData = yearData.find((data) => data?.month === month);
        if (monthData?.transactions) {
          return monthData.transactions
            .filter((transaction) => transaction?.type === category)
            .reduce((sum, transaction) => sum + (transaction?.amount || 0), 0);
        }
      }
      return 0;
    },
    [yearData],
  );

  const totalCategory = useCallback(
    (category: string) =>
      months.reduce(
        (total, month) => total + calculateTotal(month, category),
        0,
      ),
    [calculateTotal, months],
  );

  const totalDetails = (month: number) =>
    DETAIL_CATEGORIES.reduce(
      (total, category) => total + calculateTotal(month, category),
      0,
    );

  const goToMonthPage = (year: number, month: number) => {
    navigate("/main");
    setRecoilYear(year);
    setRecoilMonth(month);
  };

  const totalIncomeValue = useMemo(
    () =>
      months.reduce((total, month) => total + calculateTotal(month, "수입"), 0),
    [calculateTotal, months],
  );

  const totalFixedValue = useMemo(
    () =>
      months.reduce(
        (total, month) => total + calculateTotal(month, "고정 지출"),
        0,
      ),
    [calculateTotal, months],
  );

  const totalSavingsValue = useMemo(
    () =>
      months.reduce((total, month) => total + calculateTotal(month, "저축"), 0),
    [calculateTotal, months],
  );

  const categoriesData = useMemo(
    () => ({
      food: totalCategory("식비"),
      necessity: totalCategory("생필품"),
      culture: totalCategory("문화생활"),
      transportation: totalCategory("교통비"),
      others: totalCategory("의료 및 기타"),
    }),
    [totalCategory],
  );

  const totalCategoryCost = Object.values(categoriesData).reduce(
    (sum, categoryCost) => sum + categoryCost,
    0,
  );
  const totalSpending = totalCategoryCost + totalFixedValue;

  const remaining = totalIncomeValue - (totalSavingsValue + totalSpending);

  const pieData = useMemo(() => {
    const calcPercentage = (value: number) =>
      totalIncomeValue ? ((value / totalIncomeValue) * 100).toFixed(2) : 0;

    const items = [
      { label: "고정 지출", value: totalFixedValue, color: COLORS.fixed },
      { label: "저축", value: totalSavingsValue, color: COLORS.savings },
      { label: "식비", value: categoriesData.food, color: COLORS.food },
      {
        label: "생필품",
        value: categoriesData.necessity,
        color: COLORS.necessity,
      },
      {
        label: "문화생활",
        value: categoriesData.culture,
        color: COLORS.culture,
      },
      {
        label: "교통비",
        value: categoriesData.transportation,
        color: COLORS.transportation,
      },
      {
        label: "의료 및 기타",
        value: categoriesData.others,
        color: COLORS.others,
      },
      {
        label: "남은 금액",
        value: remaining > 0 ? remaining : 0,
        color: COLORS.remaining,
      },
    ];

    return {
      labels: items.map(
        ({ label, value }) =>
          `${label} ${value.toLocaleString()}원 (${calcPercentage(value)}%)`,
      ),
      datasets: [
        {
          data: items.map(({ value }) => value),
          backgroundColor: items.map(({ color }) => color),
        },
      ],
    };
  }, [
    categoriesData.culture,
    categoriesData.food,
    categoriesData.necessity,
    categoriesData.others,
    categoriesData.transportation,
    remaining,
    totalIncomeValue,
    totalSavingsValue,
    totalFixedValue,
  ]);

  const options: ChartOptions<"pie"> = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const getNextYear = () => {
    if (year) {
      setYear(year + 1);
    }
  };

  const getPrevYear = () => {
    if (year) {
      if (year - 1 < 2024) return alert("2024년부터 가능");
      setYear(year - 1);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="annual-page">
      {loading && <Spinner />}
      {changePasswordForm && <ChangePasswordForm />}

      <Header
        leftContent={
          <>
            <Link to="/main" className="view-toggle">
              <i className="fas fa-calendar-day"></i>
              <span>월별로 보기</span>
            </Link>
            <select
              className="year-selector"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
          </>
        }
        centerContent={
          <>
            <button className="nav-btn" onClick={getPrevYear}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <h1 className="current-year">{year}년</h1>
            <button className="nav-btn" onClick={getNextYear}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </>
        }
      />

      <main className="annual-content">
        <section className="total-income-section">
          <div className="total-income-card">
            <i className="fas fa-coins"></i>
            <div className="total-income-info">
              <span className="total-income-label">연간 총 수입</span>
              <span className="total-income-value">
                {totalIncomeValue.toLocaleString()}원
              </span>
            </div>
          </div>
        </section>

        <section className="months-grid">
          {months.map((month) => {
            const income = calculateTotal(month, "수입");
            const spending =
              calculateTotal(month, "고정 지출") + totalDetails(month);
            const savings = calculateTotal(month, "저축");

            const categories = {
              "고정 지출": calculateTotal(month, "고정 지출"),
              식비: calculateTotal(month, "식비"),
              생필품: calculateTotal(month, "생필품"),
              문화생활: calculateTotal(month, "문화생활"),
              교통비: calculateTotal(month, "교통비"),
              "의료 및 기타": calculateTotal(month, "의료 및 기타"),
            };

            const spendingRate = income ? (spending / income) * 100 : 0;
            const savingsRate = income ? (savings / income) * 100 : 0;

            return (
              <div
                key={month}
                className="month-card"
                onClick={() => goToMonthPage(year, month)}
              >
                <div className="month-card__header">
                  <h3 className="month-title">{month}월</h3>
                  <i className="fas fa-chevron-right"></i>
                </div>

                <div className="month-card__body">
                  <div className="summary-row">
                    <span className="summary-label income">수입</span>
                    <span className="summary-value income">
                      {income.toLocaleString()}원
                    </span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label expense">지출</span>
                    <span className="summary-value expense">
                      {spending.toLocaleString()}원
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill expense"
                      style={{ width: `${Math.min(spendingRate, 100)}%` }}
                    >
                      <span>{spendingRate.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="category-details">
                    {Object.entries(categories).map(([key, value]) => (
                      <div key={key} className="category-item">
                        <span className="category-name">{key}</span>
                        <span className="category-value">
                          {value.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-row">
                    <span className="summary-label saving">저축</span>
                    <span className="summary-value saving">
                      {savings.toLocaleString()}원
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className="progress-fill saving"
                      style={{ width: `${Math.min(savingsRate, 100)}%` }}
                    >
                      <span>{savingsRate.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="chart-section">
          <div className="chart-card">
            <h2 className="chart-title">
              <i className="fas fa-chart-pie"></i>
              연간 수입, 지출, 저축 비교
            </h2>
            <div className="chart-wrapper">
              <Pie data={pieData} options={options} />
            </div>
            <div className="total-spending">
              총 지출: {totalSpending.toLocaleString()}원
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Annual;
