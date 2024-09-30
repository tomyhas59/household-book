import React, { useState } from "react";
import styled, { css } from "styled-components";
import axios from "axios"; // axios를 이용하여 서버와 통신
import { useNavigate } from "react-router";
import { useRecoilState } from "recoil";
import { userState } from "../recoil/atoms";

const Login = () => {
  const [active, setActive] = useState(false);
  const [signupData, setSignupData] = useState({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [user, setUser] = useRecoilState(userState);
  const navigator = useNavigate();

  // 회원가입 데이터 변경 핸들러
  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  // 로그인 데이터 변경 핸들러
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // 회원가입 요청
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (signupData.password !== signupData.passwordConfirm) {
      alert("비밀번호가 다릅니다");
      return;
    }
    try {
      await axios.post("http://localhost:8090/signup", signupData, {
        withCredentials: true,
      });
      alert("회원가입이 완료되었습니다!");
      setSignupData({
        nickname: "",
        email: "",
        password: "",
        passwordConfirm: "",
      });
      setActive((prev) => !prev);
    } catch (error) {
      console.error("Signup Error", error);
      alert("Signup failed");
    }
  };

  // 로그인 요청
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8090/login",
        loginData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("----", response);
      const { token, nickname, email } = response.data;

      localStorage.setItem("jwt", token);

      setUser({ nickname, email });

      navigator("/main");
    } catch (error) {
      console.error("Login Error", error);
      alert("Login failed");
    }
  };

  const handleToggle = () => {
    setActive((prev) => !prev);
  };

  return (
    <Container>
      <SignUpContainer $active={active}>
        <h1>회원가입</h1>
        <FormContainer onSubmit={handleSignupSubmit}>
          <Label>
            <LabelText>닉네임:</LabelText>
            <Input
              name="nickname"
              value={signupData.nickname}
              onChange={handleSignupChange}
              placeholder="Nickname"
              type="text"
              required
            />
          </Label>
          <Label>
            <LabelText>이메일:</LabelText>
            <Input
              name="email"
              value={signupData.email}
              onChange={handleSignupChange}
              placeholder="Email"
              type="email"
              required
            />
          </Label>
          <Label>
            <LabelText>비밀번호:</LabelText>
            <Input
              name="password"
              value={signupData.password}
              onChange={handleSignupChange}
              placeholder="Password"
              type="password"
              required
            />
          </Label>
          <Label>
            <LabelText>비밀번호 확인:</LabelText>
            <Input
              name="passwordConfirm"
              value={signupData.passwordConfirm}
              onChange={handleSignupChange}
              placeholder="Password confirm"
              type="password"
              required
            />
          </Label>
          <Button type="submit">가입하기</Button>
        </FormContainer>
      </SignUpContainer>

      <SignInContainer $active={active}>
        <h1>로그인</h1>
        <FormContainer onSubmit={handleLoginSubmit}>
          <Label>
            <LabelText>이메일:</LabelText>
            <Input
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
              placeholder="Email"
              type="email"
              required
            />
          </Label>
          <Label>
            <LabelText>비밀번호:</LabelText>
            <Input
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              placeholder="Password"
              type="password"
              required
            />
          </Label>
          <Button type="submit">로그인</Button>
        </FormContainer>
      </SignInContainer>

      <ToggleContainer $active={active}>
        <Toggle $active={active}>
          <ToggleLeft $active={active}>
            <h2>이미 아이디가 있다면?</h2>
            <p>로그인 해주세요</p>
            <Button onClick={handleToggle}>로그인</Button>
          </ToggleLeft>
          <ToggleRight $active={active}>
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
    props.$active
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
    props.$active &&
    css`
      transform: translateX(100%);
      opacity: 1;
      z-index: 2;
    `}
`;

const FormContainer = styled.form`
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
    props.$active
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
  transform: ${(props) =>
    props.$active ? "translateX(50%)" : "translateX(0)"};
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
    props.$active ? "translateX(100%)" : "translateX(0)"};
`;

const ToggleLeft = styled.div`
  ${ToggleCommonStyles}
  transform: ${(props) =>
    props.$active ? "translateX(0)" : "translateX(-200%)"};
`;
