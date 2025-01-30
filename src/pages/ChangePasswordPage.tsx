import styled from "styled-components";
import { ChangeEvent, SyntheticEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { loadingState, userState } from "../recoil/atoms";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../config/config";

const ChangePasswordPage = () => {
  const user = useRecoilValue(userState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [changePasswordData, setChangePasswordData] = useState({
    prevPassword: "",
    newPassword: "",
    passwordConfirm: "",
  });

  const [passwordError, setPasswordError] = useState(false);
  const navigator = useNavigate();

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChangePasswordData({
      ...changePasswordData,
      [e.target.name]: e.target.value,
    });
  };

  const changePasswordSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      if (
        changePasswordData.newPassword !== changePasswordData.passwordConfirm
      ) {
        setPasswordError(true);
        return;
      }
      setLoading(true);
      const data = {
        email: user?.email,
        prevPassword: changePasswordData.prevPassword,
        newPassword: changePasswordData.newPassword,
      };

      try {
        const response = await axios.post(
          `${BASE_URL}/api/changePassword`,
          data
        );

        alert(response.data); //성공 메시지 호출
        navigator("/main");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;
          if (axiosError.response) {
            alert(axiosError.response.data); //에러 메시지 호출
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [
      changePasswordData.newPassword,
      changePasswordData.passwordConfirm,
      changePasswordData.prevPassword,
      navigator,
      user?.email,
    ]
  );

  return (
    <ChangePasswordFormContainer onSubmit={changePasswordSubmit}>
      <XBox type="button" onClick={() => navigator("/main")}>
        x
      </XBox>
      <FormGroup>
        <Label>현재 비밀번호</Label>
        <Input
          name="prevPassword"
          type="password"
          value={changePasswordData.prevPassword}
          onChange={handleOnChange}
          placeholder="현재 비밀번호"
        />
      </FormGroup>
      <FormGroup>
        <Label>비밀번호</Label>
        <Input
          name="newPassword"
          type="password"
          value={changePasswordData.newPassword}
          onChange={handleOnChange}
          placeholder="비밀번호"
        />
      </FormGroup>
      <FormGroup>
        <Label>비밀번호 확인</Label>
        <Input
          name="passwordConfirm"
          type="password"
          value={changePasswordData.passwordConfirm}
          onChange={handleOnChange}
          placeholder="비밀번호 확인"
        />
      </FormGroup>
      <CheckMessage>
        {passwordError ? "비밀번호가 일치하지 않습니다" : ""}
      </CheckMessage>
      <Button type="submit">등록</Button>
    </ChangePasswordFormContainer>
  );
};

export default ChangePasswordPage;

const ChangePasswordFormContainer = styled.form`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 9999999999;
  background-color: #2c3e50;
  border-radius: 8px;
  padding: 20px;
  color: #fff;
`;

const XBox = styled.button`
  position: absolute;
  top: 5px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 18px;
  color: #fff;
  cursor: pointer;
  &:hover {
    color: #bab5b5;
  }
`;
const FormGroup = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
`;

const Button = styled.button`
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;

  &:hover {
    background-color: #bab5b5;
    transform: translateY(-2px);
  }
`;

const CheckMessage = styled.div`
  color: red;
  width: 100%;
  height: 20px;
  text-align: center;
  font-size: 14px;
`;
