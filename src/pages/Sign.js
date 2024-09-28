import React, { useState } from "react";
import styled, { css } from "styled-components";

const Login = () => {
  const [active, setActive] = useState(false);

  const handleToggle = () => {
    setActive((prev) => !prev);
  };

  return (
    <Container>
      <SignUpContainer active={active}>
        <h1>회원가입</h1>
        <FormContainer>
          <Label>
            <LabelText>닉네임:</LabelText>
            <Input placeholder="Nickname" type="text" />
          </Label>
          <Label>
            <LabelText>이메일:</LabelText>
            <Input placeholder="Email" type="email" />
          </Label>
          <Label>
            <LabelText>비밀번호:</LabelText>
            <Input placeholder="Password" type="password" />
          </Label>
          <Label>
            <LabelText>비밀번호 확인:</LabelText>
            <Input placeholder="Password confirm" type="password" />
          </Label>
          <Button>가입하기</Button>
        </FormContainer>
      </SignUpContainer>
      <SignInContainer active={active}>
        <h1>로그인</h1>
        <FormContainer>
          <Label>
            <LabelText>이메일:</LabelText>
            <Input placeholder="Email" type="email" />
          </Label>
          <Label>
            <LabelText>비밀번호:</LabelText>
            <Input placeholder="Password" type="password" />
          </Label>
          <Button>로그인</Button>
        </FormContainer>
      </SignInContainer>
      <ToggleContainer active={active}>
        <Toggle active={active}>
          <ToggleLeft active={active}>
            <h2>이미 아이디가 있다면?</h2>
            <p>로그인 해주세요</p>
            <Button onClick={handleToggle}>로그인</Button>
          </ToggleLeft>
          <ToggleRight active={active}>
            <h2>아이디가 없으세요?</h2>
            <p>간단한 회원가입</p>
            <Button onClick={handleToggle}>회원가입</Button>
          </ToggleRight>
        </Toggle>
      </ToggleContainer>
    </Container>
  );
};

export default Login;

const Container = styled.div`
  margin: 100px auto;
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
  border: 1px solid silver;
`;

const absolutePosition = css`
  transition: all 0.6s ease-in-out;
  position: absolute;
  top: 20%;
  height: 100%;
  left: 0;
  width: 50%;
  text-align: center;
`;

const SignInContainer = styled.div`
  ${absolutePosition}
  ${(props) =>
    props.active
      ? css`
          transform: translateX(100%);
          opacity: 0;
        `
      : css`
          transform: translateX(0);
        `}
`;

const SignUpContainer = styled.div`
  ${absolutePosition}
  opacity: 0;
  ${(props) =>
    props.active &&
    css`
      transform: translateX(100%);
      opacity: 1;
      z-index: 2;
    `}
`;

const FormContainer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

const Label = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
`;

const LabelText = styled.span`
  width: 70px;
  font-weight: bold;
  color: #512da8;
  font-size: 14px;
`;

const Input = styled.input`
  margin-top: 5px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #512da8;
    box-shadow: 0 0 3px rgba(81, 45, 168, 0.5);
  }
`;

const Button = styled.button`
  background-color: black;
  border-radius: 5px;
  color: #fff;
  padding: 10px;
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, yellow, transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  &:hover::before {
    transform: translateX(100%);
  }
`;

const ToggleContainer = styled.div`
  position: absolute;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: all 0.6s ease-in-out;
  z-index: 1000;
  ${(props) =>
    props.active
      ? css`
          transform: translateX(-100%);
          border-radius: 0 150px 150px 0;
        `
      : css`
          border-radius: 150px 0 0 150px;
        `}
`;

const Toggle = styled.div`
  background-color: #512da8;
  height: 100%;
  background: linear-gradient(to right, #5c6bc0, #512da8);
  color: #fff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transition: all 0.6s ease-in-out;
  transform: ${(props) => (props.active ? "translateX(50%)" : "translateX(0)")};
`;

const ToggleCommonStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  gap: 20px;
  width: 50%;
  height: 100%;
  padding: 0 30px;
  text-align: center;
  top: 0;
  transition: all 0.6s ease-in-out;
`;

const ToggleRight = styled.div`
  ${ToggleCommonStyles}
  right: 0;
  transform: ${(props) =>
    props.active ? "translateX(100%)" : "translateX(0)"};
`;

const ToggleLeft = styled.div`
  ${ToggleCommonStyles}
  transform: ${(props) =>
    props.active ? "translateX(0)" : "translateX(-200%)"};
`;
