import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProgressBar, ProgressContainer } from "../components/CommonForm";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  monthState,
  userState,
  yearState,
  loadingState,
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
        maxHeight: 200,
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

        <HeaderContainer>
          <HeaderLeftSection>
            <HomeButton to="/main">월별로 보기</HomeButton>
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

const Container = styled.div`
  background-color: #f5f7fa;
  display: grid;
  grid-template-columns: 65% 35%;
  grid-template-areas:
    "a a"
    "b c";
  @media (max-width: 480px) {
    display: flex;
    flex-direction: column;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  height: 8vh;
  gap: 5px;
  justify-content: start;
  align-items: center;
  background-color: #2c3e50;
  position: relative;
  grid-area: a;
  padding: 5px;
  @media (max-width: 480px) {
    flex-direction: column;
    justify-content: center;
    z-index: 1000;
    gap: 0;
  }
`;

const TotalIncome = styled.div`
  font-weight: bold;
  font-size: 1rem;
  margin: 5px;
  transition: all 0.3s ease;
  color: #2c3e50;
`;
const HeaderLeftSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    margin: 0 30px;
  }
  @media (max-width: 480px) {
    font-size: 0.6rem;
    word-break: keep-all;
  }
`;

const Button = styled.button`
  background-color: transparent;
  color: #fff;
  font-size: 2rem;
  border: none;
  margin: 10px;
  cursor: pointer;
  position: relative;

  &:hover {
    color: #e74c3c;
    -webkit-text-stroke: 1px white; /* 글자에 흰색 테두리 */
  }
  @media (max-width: 480px) {
    font-size: 0.6rem;
    margin: 0;
    padding: 5px;
  }
`;

const Select = styled.select`
  appearance: none; //select 화살표 none
  border: 2px solid #ecf0f1;
  background-color: #ffffff;
  font-size: 1rem;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #2c3e50;
  cursor: pointer;

  &:hover {
    border-color: #7f8fa6;
  }

  @media (max-width: 480px) {
    font-size: 0.6rem;
    padding: 5px;
  }
`;

const HomeButton = styled(Link)`
  text-decoration: none;
  font-size: 1rem;
  min-width: 110px;
  text-align: center;
  background-color: #e74c3c;
  border-radius: 8px;
  padding: 10px;
  color: #ffffff;
  display: inline-block;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c0392b;
  }
  @media (max-width: 480px) {
    min-width: 80px;
    font-size: 0.6rem;
    padding: 5px;
  }
`;

const MonthListContainer = styled.div`
  grid-area: b;
  padding: 10px;
`;

const MonthList = styled.div`
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const MonthContainer = styled.div`
  background-color: #ecf0f1;
  padding: 10px;
  border-radius: 12px;
  width: 200px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    background-color: #d0d3d4;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-5px);
  }

  @media (max-width: 480px) {
    width: 160px;
    * {
      font-size: 0.7rem;
    }
  }
`;

const MonthTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Category = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const AccountSection = styled.div`
  display: flex;
  justify-content: space-between;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Amount = styled.p`
  font-weight: bold;
`;

const CategoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Detail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  > p {
    color: gray;
  }
`;

const PieChartContainer = styled.div`
  background-color: #f8f8f8;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  }

  div {
    text-align: center;
    color: #555;
    font-weight: bold;
  }
  @media (max-width: 480px) {
    padding: 15px;
  }
`;
