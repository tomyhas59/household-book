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
import { DETAIL_CATEGORIES } from "./Main";
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
  const navigator = useNavigate();

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
        //해당 월 찾기
        const monthData = yearData.filter((data) => data?.month === month);
        if (monthData.length > 0) {
          const transactions = monthData[0]?.transactions;

          if (transactions && Array.isArray(transactions)) {
            const total = transactions
              .filter((transaction) => transaction?.type === category)
              .reduce((a, c) => a + (c?.amount || 0), 0);
            return total;
          }
        }
      }
      return 0;
    },
    [yearData]
  );

  const totalIncome = useCallback(
    () =>
      months.reduce((total, month) => total + calculateTotal(month, "수입"), 0),
    [calculateTotal, months]
  );

  const totalFixed = useCallback(
    () =>
      months.reduce(
        (total, month) => total + calculateTotal(month, "고정 지출"),
        0
      ),
    [calculateTotal, months]
  );

  const totalSavings = useCallback(
    () =>
      months.reduce((total, month) => total + calculateTotal(month, "저축"), 0),
    [calculateTotal, months]
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
  const totalIncomeValue = totalIncome();
  const totalFixedValue = totalFixed();
  const totalSavingsValue = totalSavings();
  const categoriesData = {
    food: totalCategory("식비"),
    necessity: totalCategory("생필품"),
    culture: totalCategory("문화생활"),
    transportation: totalCategory("교통비"),
    others: totalCategory("의료 및 기타"),
  };
  const totalCategoryCost = Object.values(categoriesData).reduce(
    (sum, categoryCost) => sum + categoryCost,
    0
  );
  const totalSpending = totalCategoryCost + totalFixedValue;

  const remaining = totalIncomeValue - (totalSavingsValue + totalSpending);

  const pieData = useMemo(() => {
    const calcPercentage = (value: number) =>
      totalIncomeValue ? ((value / totalIncomeValue) * 100).toFixed(2) : 0;

    return {
      labels: [
        `고정 지출 ${totalFixedValue.toLocaleString()}원 (${calcPercentage(totalFixedValue)}%)`,
        `저축 ${totalSavingsValue.toLocaleString()}원(${calcPercentage(totalSavingsValue)}%)`,
        `식비 ${categoriesData.food.toLocaleString()}원(${calcPercentage(categoriesData.food)}%)`,
        `생필품 ${categoriesData.necessity.toLocaleString()}원(${calcPercentage(categoriesData.necessity)}%)`,
        `문화생활 ${categoriesData.culture.toLocaleString()}원(${calcPercentage(categoriesData.culture)}%)`,
        `교통비 ${categoriesData.transportation.toLocaleString()}원(${calcPercentage(categoriesData.transportation)}%)`,
        `의료 및 기타 ${categoriesData.others.toLocaleString()}원(${calcPercentage(categoriesData.others)}%)`,
        `남은 금액 ${remaining.toLocaleString()}원(${calcPercentage(remaining)}%)`,
      ],
      datasets: [
        {
          data: [
            totalFixedValue,
            totalSavingsValue,
            categoriesData.food,
            categoriesData.necessity,
            categoriesData.culture,
            categoriesData.transportation,
            categoriesData.others,
            remaining > 0 ? remaining : 0,
          ],
          backgroundColor: [
            COLORS.fixed,
            COLORS.savings,
            COLORS.food,
            COLORS.necessity,
            COLORS.culture,
            COLORS.transportation,
            COLORS.others,
            COLORS.remaining,
          ],
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
            <HomeButton onClick={() => navigator("/main")}>
              월별로 보기
            </HomeButton>
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
          </HeaderLeftSection>
          <HeaderTitle>
            <Button onClick={getPrevYear}>◀</Button>
            <span>{year}년 데이터</span>
            <Button onClick={getNextYear}>▶</Button>
          </HeaderTitle>
        </HeaderContainer>
        <MonthListContainer>
          <TotalIncome>
            총 수입 : {totalIncome().toLocaleString()}원
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

export const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

export const HeaderLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 600px) {
    flex-direction: column;
    width: 100%;
  }
`;

export const HomeButton = styled.button`
  background-color: #3498db;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #2980b9;
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

export const Select = styled.select`
  padding: 8px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #ddd;
  cursor: pointer;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

export const Button = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #333;

  &:hover {
    color: #3498db;
  }

  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;

  @media (max-width: 600px) {
    font-size: 18px;
  }
`;

export const MonthListContainer = styled.div`
  margin-top: 20px;
`;

export const TotalIncome = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2ecc71;
  text-align: center;

  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

export const MonthList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;

  @media (max-width: 600px) {
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

  @media (max-width: 600px) {
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

  @media (max-width: 600px) {
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

  @media (max-width: 600px) {
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

  @media (max-width: 600px) {
    width: 100%;
    h2 {
      font-size: 16px;
    }
  }
`;
