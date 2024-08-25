import React from "react";
import styled from "styled-components";

const AccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f0f0;
  padding: 5px;
  border-radius: 10px;
  height: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const AccountSection = styled.div`
  width: 100%;
  background: white;
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;

  p:first-child {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 8px;
  }
`;

const Saving = styled.p`
  font-size: 1.2rem;
  color: #3498db;
  font-weight: bold;
`;

const Spending = styled.p`
  font-size: 1.2rem;
  color: #c0392b;
  font-weight: bold;
`;

const Account = ({ income, saving, fixed }) => {
  return (
    <AccountContainer>
      <AccountSection>
        <p>이달의 수입</p>
        <Saving>{income.toLocaleString()}</Saving>
      </AccountSection>
      <AccountSection>
        <p>이달의 저축</p>
        <Saving>{saving.toLocaleString()}</Saving>
      </AccountSection>
      <AccountSection>
        <p>이달의 고정 지출</p>
        <Spending>{fixed.toLocaleString()}</Spending>
      </AccountSection>
    </AccountContainer>
  );
};

export default Account;
