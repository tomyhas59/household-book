import React from "react";
import styled, { keyframes } from "styled-components";

const wave = keyframes`
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
`;

const Wave = styled.div`
  width: 10px;
  height: 30px;
  margin: 0 3px;
  background: #3498db;
  border-radius: 5px;
  animation: ${wave} 0.6s ease-in-out infinite;

  &:nth-child(1) {
    animation-delay: 0s;
  }
  &:nth-child(2) {
    animation-delay: 0.1s;
  }
  &:nth-child(3) {
    animation-delay: 0.2s;
  }
  &:nth-child(4) {
    animation-delay: 0.3s;
  }
  &:nth-child(5) {
    animation-delay: 0.4s;
  }
`;

const WaveSpinner: React.FC = () => {
  return (
    <SpinnerContainer>
      <Wave />
      <Wave />
      <Wave />
      <Wave />
      <Wave />
    </SpinnerContainer>
  );
};

export default WaveSpinner;
