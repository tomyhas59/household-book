import { SyntheticEvent, useState } from "react";
import styled, { css } from "styled-components";
import axios, { AxiosError } from "axios";
import { ErrorResponse, useNavigate } from "react-router";
import { useRecoilState, useSetRecoilState } from "recoil";
import { loadingState, userState } from "../recoil/atoms";
import { BASE_URL } from "../config/config";
import { UserType } from "../type";
import Spinner from "../components/Spinner";

const Login = () => {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useRecoilState(loadingState);
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
  const setUser = useSetRecoilState(userState);
  const navigator = useNavigate();

  // 회원가입 데이터 변경 핸들러
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  // 로그인 데이터 변경 핸들러
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // 회원가입 요청
  const handleSignupSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    if (signupData.password !== signupData.passwordConfirm) {
      alert("비밀번호가 다릅니다");
      setLoading(false);
      return;
    }
    try {
      await axios.post(`${BASE_URL}/api/signup`, signupData, {
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
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<any>;
        console.log(err);
        if (err.response) {
          alert(err.response.data.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // 로그인 요청
  const handleLoginSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/login`, loginData, {
        withCredentials: true,
      });
      const { token, nickname, email, id } = response.data;

      localStorage.setItem("jwt", token);

      setUser({ nickname, email, id } as UserType);

      navigator("/main");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<ErrorResponse>;
        if (err.response) {
          alert(err.response.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setActive((prev) => !prev);
  };

  return (
    <Container>
      {loading && <Spinner />}
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
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
  position: absolute;
  overflow: hidden;
  width: 800px;
  height: 500px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid silver;
  @media (max-width: 768px) {
    width: 368px;
    height: 400px;
  }
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

interface ActiveType {
  $active: boolean;
}

const SignInContainer = styled.div<ActiveType>`
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

const SignUpContainer = styled.div<ActiveType>`
  ${absolutePosition}
  top:10%;
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
  @media (max-width: 768px) {
    transform: scale(0.7);
  }
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

const ToggleContainer = styled.div<ActiveType>`
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
  h2 {
    word-break: keep-all;
  }
`;

const Toggle = styled.div<ActiveType>`
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

const ToggleRight = styled.div<ActiveType>`
  ${ToggleCommonStyles}
  right: 0;
  transform: ${(props) =>
    props.$active ? "translateX(100%)" : "translateX(0)"};
`;

const ToggleLeft = styled.div<ActiveType>`
  ${ToggleCommonStyles}
  transform: ${(props) =>
    props.$active ? "translateX(0)" : "translateX(-200%)"};
`;
