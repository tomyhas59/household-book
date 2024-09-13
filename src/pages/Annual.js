import localforage from "localforage";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProgressBar, ProgressContainer } from "../components/Details";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { monthState, yearState } from "../recoil/atoms";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const DETAIL_CATEGORIES = [
  "식비",
  "생필품",
  "문화생활",
  "교통비",
  "의료 및 기타",
];
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
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [yearData, setYearData] = useState({});
  const navigate = useNavigate();
  const setRecoilMonth = useSetRecoilState(monthState);
  const setRecoilYear = useSetRecoilState(yearState);

  const years = Array.from({ length: 10 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await localforage.getItem(year);
        setYearData(data || {});
      } catch (error) {
        console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
        setYearData({});
      }
    };

    fetchData();
  }, [year]);

  const calculateTotal = (month, category) =>
    yearData[month]?.[category]?.reduce((a, c) => a + c.amount, 0) || 0;

  const totalIncome = () =>
    months.reduce((total, month) => total + calculateTotal(month, "수입"), 0);

  const totalFixed = () =>
    months.reduce(
      (total, month) => total + calculateTotal(month, "고정 지출"),
      0
    );

  const totalSavings = () =>
    months.reduce((total, month) => total + calculateTotal(month, "저축"), 0);

  const totalCategory = (category) =>
    months.reduce((total, month) => total + calculateTotal(month, category), 0);

  const totalDetails = (month) =>
    DETAIL_CATEGORIES.reduce(
      (total, category) => total + calculateTotal(month, category),
      0
    );

  const goToMonthPage = (year, month) => {
    navigate("/");
    setRecoilYear(year);
    setRecoilMonth(month);
  };

  const pieData = useMemo(() => {
    const income = totalIncome();
    const fixed = totalFixed();
    const savings = totalSavings();
    const categoriesData = {
      food: totalCategory("식비"),
      necessity: totalCategory("생필품"),
      culture: totalCategory("문화생활"),
      transportation: totalCategory("교통비"),
      others: totalCategory("의료 및 기타"),
    };

    const remaining =
      income -
      (fixed +
        savings +
        Object.values(categoriesData).reduce((a, c) => a + c, 0));

    const calcPercentage = (value) =>
      income ? ((value / income) * 100).toFixed(2) : 0;

    return {
      labels: [
        `고정 지출 (${calcPercentage(fixed)}%)`,
        `저축 (${calcPercentage(savings)}%)`,
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
            fixed,
            savings,
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
  }, [yearData]);

  const options = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      datalabels: {
        display: true,
        color: "#fff",
        formatter: (value, context) => {
          const labels = context.chart.data.labels;
          const categoryName = labels[context.dataIndex];
          return `${categoryName}`;
        },
        backgroundColor: (context) => {
          return context.dataset.backgroundColor;
        },
        borderRadius: 4,
        font: {
          weight: "bold",
        },
        padding: 6,
      },
    },
  };
  return (
    <Container>
      <HeaderContainer>
        <LeftSection>
          <HomeButton to="/">뒤로</HomeButton>
          <Select value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </Select>
          <p>총 수입 : </p>
          <p>{totalIncome().toLocaleString()}원</p>
        </LeftSection>
        <Header>월별 데이터</Header>
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
                      {income.toLocaleString()}원
                    </Amount>
                  </AccountSection>
                  <AccountSection>
                    <p style={{ color: "crimson" }}>지출</p>
                    <Amount style={{ color: "crimson" }}>
                      {spending.toLocaleString()}원
                    </Amount>
                  </AccountSection>
                  <ProgressContainer>
                    <ProgressBar $percentage={spendingRate}>
                      <p>{spendingRate.toFixed(0)}%</p>
                    </ProgressBar>
                  </ProgressContainer>
                  <CategoryDetails>
                    {Object.entries(categories).map(([key, value]) => (
                      <Detail key={key}>
                        <p style={{ color: "gray" }}>{key}</p>
                        <p style={{ color: "gray" }}>
                          {value.toLocaleString()}원
                        </p>
                      </Detail>
                    ))}
                  </CategoryDetails>

                  <AccountSection>
                    <p style={{ color: "#3498db" }}>저축</p>
                    <Amount style={{ color: "#3498db" }}>
                      {savings.toLocaleString()}원
                    </Amount>
                  </AccountSection>
                  <ProgressContainer>
                    <ProgressBar
                      $percentage={savingsRate}
                      style={{ backgroundColor: "#3498db" }}
                    >
                      <p>{savingsRate.toFixed(0)}%</p>
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
  font-family: "Roboto", sans-serif;
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-areas:
    "a a"
    "b c";
`;

const HeaderContainer = styled.div`
  display: flex;
  height: 100px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #2c3e50;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  grid-area: a;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  > p {
    color: #fff;
    font-weight: bold;
  }
`;

const Header = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  flex-grow: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
`;

const HomeButton = styled(Link)`
  text-decoration: none;
  font-size: 1rem;
  background-color: #e74c3c;
  border-radius: 8px;
  padding: 10px 20px;
  color: #ffffff;
  display: inline-block;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c0392b;
  }
`;

const MonthListContainer = styled.div`
  grid-area: b;
  padding: 20px;
`;

const MonthList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const MonthContainer = styled.div`
  background-color: #ecf0f1;
  padding: 20px;
  border-radius: 12px;
  width: 250px;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    background-color: #d0d3d4;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-5px);
  }
`;

const MonthTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
  text-align: center;
`;

const Category = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AccountSection = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Amount = styled.p`
  font-weight: bold;
`;

const CategoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Detail = styled.p`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
`;

const PieChartContainer = styled.div`
  grid-area: c;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
