import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProgressBar, ProgressContainer } from "../components/CommonForm";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
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
import { DETAIL_CATEGORIES, LogoutButton } from "./Main";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { MonthDataType } from "../type";
import Spinner from "../components/Spinner";

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
  const [year, setYear] = useState(new Date().getFullYear());
  const [yearData, setYearData] = useState<MonthDataType[]>([]);
  const navigate = useNavigate();
  const setRecoilMonth = useSetRecoilState(monthState);
  const setRecoilYear = useSetRecoilState(yearState);
  const [user, setUser] = useRecoilState(userState);
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

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setUser(null);
    console.log("로그아웃 완료");
  };

  const pieData = useMemo(() => {
    const pieTotalIncome = totalIncome();
    const pieTotallFixed = totalFixed();
    const pieTotalSavings = totalSavings();
    const categoriesData = {
      food: totalCategory("식비"),
      necessity: totalCategory("생필품"),
      culture: totalCategory("문화생활"),
      transportation: totalCategory("교통비"),
      others: totalCategory("의료 및 기타"),
    };

    const remaining =
      pieTotalIncome -
      (pieTotalSavings +
        Object.values(categoriesData).reduce((a, c) => a + c, 0) +
        pieTotallFixed);

    const calcPercentage = (value: number) =>
      pieTotalIncome ? ((value / pieTotalIncome) * 100).toFixed(2) : 0;

    return {
      labels: [
        `고정 지출 (${calcPercentage(pieTotallFixed)}%)`,
        `저축 (${calcPercentage(pieTotalSavings)}%)`,
        `식비 (${calcPercentage(categoriesData.food)}%)`,
        `생필품 (${calcPercentage(categoriesData.necessity)}%)`,
        `문화생활 (${calcPercentage(categoriesData.culture)}%)`,
        `교통비 (${calcPercentage(categoriesData.transportation)}%)`,
        `의료 및 기타 (${calcPercentage(categoriesData.others)}%)`,
        `남은 금액 (${calcPercentage(remaining)}%)`,
      ],
      datasets: [
        {
          data: [
            pieTotallFixed,
            pieTotalSavings,
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
  }, [totalCategory, totalFixed, totalIncome, totalSavings]);

  const options: ChartOptions<"pie"> = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
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
            <p>총 수입 : </p>
            <p>{totalIncome().toLocaleString()}원</p>
          </HeaderLeftSection>
          <HeaderTitle>{user.nickname}의 연도별 데이터</HeaderTitle>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </HeaderContainer>
        <MonthListContainer>
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
        </PieChartContainer>
      </Container>
    );
};

export default Annual;

const Container = styled.div`
  background-color: #f5f7fa;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 65% 35%;
  grid-template-areas:
    "a a"
    "b c";

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  height: 8vh;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  position: relative;
  grid-area: a;
  @media (max-width: 768px) {
    position: fixed;
    z-index: 1000;
  }
`;

const HeaderLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  > p {
    color: #fff;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    transform: scale(0.7);
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  flex-grow: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  @media (max-width: 768px) {
    position: static;
    transform: none;
    font-size: 1rem;
    word-break: keep-all;
  }
`;

const Select = styled.select`
  appearance: none;
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

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 8px;
  }
`;

const HomeButton = styled(Link)`
  text-decoration: none;
  font-size: 1rem;
  background-color: #e74c3c;
  border-radius: 8px;
  padding: 10px;
  color: #ffffff;
  display: inline-block;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c0392b;
  }
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const MonthListContainer = styled.div`
  grid-area: b;
  padding: 10px;
  @media (max-width: 768px) {
    padding: 10px;
    padding-top: 8vh; // HeaderContainer 높이만큼의 패딩 추가
  }
`;

const MonthList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  @media (max-width: 768px) {
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

  @media (max-width: 768px) {
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

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Category = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const AccountSection = styled.div`
  display: flex;
  justify-content: space-between;

  @media (max-width: 768px) {
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
  grid-area: c;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  @media (max-width: 768px) {
    padding: 15px;
  }
`;
