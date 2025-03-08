import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  changePasswordFormState,
  loadingState,
  userState,
} from "../recoil/atoms";
import { ChangeEvent, SyntheticEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../config/config";
import styled from "styled-components";

const ChangePasswordForm = () => {
  const user = useRecoilValue(userState);
  const [changePasswordData, setChangePasswordData] = useState({
    prevPassword: "",
    newPassword: "",
    passwordConfirm: "",
  });

  const setLoading = useSetRecoilState(loadingState);
  const setChangePasswordForm = useSetRecoilState(changePasswordFormState);

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
          const axiosError = err as AxiosError<any>;
          if (axiosError.response) {
            alert(axiosError.response.data.message); //에러 메시지 호출
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
      setLoading,
    ]
  );

  return (
    <ChangePasswordFormContainer onSubmit={changePasswordSubmit}>
      <XBox type="button" onClick={() => setChangePasswordForm(false)}>
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

export default ChangePasswordForm;

export const ChangePasswordFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  gap: 15px;
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 350px;
`;

export const XBox = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333;

  &:hover {
    color: #e74c3c;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
  }
`;

export const CheckMessage = styled.p`
  font-size: 14px;
  color: #e74c3c;
  height: 18px; /* 공간 확보 */
`;

export const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #2980b9;
  }
`;
