import React from "react";
import styled, { keyframes } from "styled-components";

const jump = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px); 
  }
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  z-index: 99999;
  display: flex;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Dot = styled.div`
  width: 15px;
  height: 15px;
  margin: 0 5px;
  border-radius: 50%;
  background-color: #3498db;
  animation: ${jump} 0.6s infinite alternate;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

const Spinner: React.FC = () => {
  return (
    <SpinnerWrapper>
      <Dot />
      <Dot />
      <Dot />
    </SpinnerWrapper>
  );
};

export default Spinner;
