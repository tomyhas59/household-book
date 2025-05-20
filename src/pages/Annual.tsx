import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProgressBar, ProgressContainer } from "../components/CommonForm";
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
import {
  Button,
  Container,
  DETAIL_CATEGORIES,
  HeaderContainer,
  HeaderLeftSection,
  HeaderTitle,
  OptionSelectorWrapper,
  PageToggleLink,
} from "./Main";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { MonthDataType } from "../type";
import Spinner from "../components/Spinner";
import OptionButton from "../components/OptionButton";
import ChangePasswordForm from "../components/ChangePasswordForm";

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
    [yearData]
  );

  const totalCategory = useCallback(
    (category: string) =>
      months.reduce(
        (total, month) => total + calculateTotal(month, category),
        0
      ),
    [calculateTotal, months]
  );

  const totalDetails = (month: number) =>
    DETAIL_CATEGORIES.reduce(
      (total, category) => total + calculateTotal(month, category),
      0
    );

  const goToMonthPage = (year: number, month: number) => {
    navigate("/main");
    setRecoilYear(year);
    setRecoilMonth(month);
  };

  //총 데이터 계산
  const totalIncomeValue = useMemo(
    () =>
      months.reduce((total, month) => total + calculateTotal(month, "수입"), 0),
    [calculateTotal, months]
  );

  const totalFixedValue = useMemo(
    () =>
      months.reduce(
        (total, month) => total + calculateTotal(month, "고정 지출"),
        0
      ),
    [calculateTotal, months]
  );

  const totalSavingsValue = useMemo(
    () =>
      months.reduce((total, month) => total + calculateTotal(month, "저축"), 0),
    [calculateTotal, months]
  );

  const categoriesData = useMemo(
    () => ({
      food: totalCategory("식비"),
      necessity: totalCategory("생필품"),
      culture: totalCategory("문화생활"),
      transportation: totalCategory("교통비"),
      others: totalCategory("의료 및 기타"),
    }),
    [totalCategory]
  );

  const totalCategoryCost = Object.values(categoriesData).reduce(
    (sum, categoryCost) => sum + categoryCost,
    0
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
          `${label} ${value.toLocaleString()}원 (${calcPercentage(value)}%)`
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
  } else
    return (
      <Container>
        {loading && <Spinner />}
        {changePasswordForm && <ChangePasswordForm />}
        <HeaderContainer>
          <HeaderLeftSection>
            <PageToggleLink to="/main">월별로 보기</PageToggleLink>
            <OptionSelectorWrapper>
              <Select
                value={year}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setYear(Number(e.target.value))
                }
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </Select>
              <OptionButton />
            </OptionSelectorWrapper>
          </HeaderLeftSection>
          <HeaderTitle>
            <Button onClick={getPrevYear}>◀</Button>
            <span>{year}년 데이터</span>
            <Button onClick={getNextYear}>▶</Button>
          </HeaderTitle>
        </HeaderContainer>
        <MonthListContainer>
          <TotalIncome>
            총 수입 : {totalIncomeValue.toLocaleString()}원
          </TotalIncome>
          <MonthList>
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
                <MonthContainer
                  key={month}
                  onClick={() => goToMonthPage(year, month)}
                >
                  <MonthTitle>{month}월</MonthTitle>
                  <Category>
                    <AccountSection>
                      <p style={{ color: "#3498db" }}>수입</p>
                      <Amount style={{ color: "#3498db" }}>
                        {income?.toLocaleString()}원
                      </Amount>
                    </AccountSection>
                    <AccountSection>
                      <p style={{ color: "crimson" }}>지출</p>
                      <Amount style={{ color: "crimson" }}>
                        {spending?.toLocaleString()}원
                      </Amount>
                    </AccountSection>
                    <ProgressContainer>
                      <ProgressBar $percentage={spendingRate}>
                        <p>{spendingRate?.toFixed(0)}%</p>
                      </ProgressBar>
                    </ProgressContainer>
                    <CategoryDetails>
                      {Object.entries(categories).map(([key, value]) => (
                        <Detail key={key}>
                          <p>{key}</p>
                          <p>{value?.toLocaleString()}원 </p>
                        </Detail>
                      ))}
                    </CategoryDetails>

                    <AccountSection>
                      <p style={{ color: "#3498db" }}>저축</p>
                      <Amount style={{ color: "#3498db" }}>
                        {savings?.toLocaleString()}원
                      </Amount>
                    </AccountSection>
                    <ProgressContainer>
                      <ProgressBar
                        $percentage={savingsRate}
                        style={{ backgroundColor: "#3498db" }}
                      >
                        <p>{savingsRate?.toFixed(0)}%</p>
                      </ProgressBar>
                    </ProgressContainer>
                  </Category>
                </MonthContainer>
              );
            })}
          </MonthList>
        </MonthListContainer>
        <PieChartContainer>
          <h2>연간 수입, 지출, 저축 비교</h2>
          <Pie data={pieData} options={options} />
          <div>총 지출: {totalSpending.toLocaleString()}원</div>
        </PieChartContainer>
      </Container>
    );
};

export default Annual;

export const Select = styled.select`
  appearance: none;
  border: 2px solid #ecf0f1;
  background-color: #ffffff;
  padding: 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #2c3e50;
  cursor: pointer;
  text-align: center;
  &:hover {
    border-color: #7f8fa6;
  }
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export const MonthListContainer = styled.div`
  margin-top: 20px;
`;

export const TotalIncome = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #27ae60;
  text-align: center;

  padding: 8px 12px;
  background-color: #eafaf1;
  border-radius: 8px;

  @media (max-width: 768px) {
    font-size: 1.125rem;
    padding: 6px 10px;
  }
`;

export const MonthList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MonthContainer = styled.div`
  background: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }
`;

export const MonthTitle = styled.h3`
  text-align: center;
  margin-bottom: 10px;
  font-size: 18px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const Category = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const AccountSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const Amount = styled.span`
  font-weight: bold;
`;

export const CategoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Detail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const PieChartContainer = styled.div`
  text-align: center;
  width: 500px;
  margin: 30px auto;
  h2 {
    margin-bottom: 10px;
  }

  @media (max-width: 768px) {
    width: 100%;
    h2 {
      font-size: 16px;
    }
  }
`;
