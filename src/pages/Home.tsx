import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f8ff;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 20px;
`;

const StyledLink = styled(Link)`
  font-size: 1.5rem;
  color: white;
  background-color: #3498db;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

const Home = () => {
  return (
    <Container>
      <Title>가계부</Title>
      <StyledLink to="/sign">로그인하기</StyledLink>
    </Container>
  );
};

export default Home;
