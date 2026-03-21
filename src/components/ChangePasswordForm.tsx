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
import "../styles/ChangePasswordForm.css";

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
      setLoading(true);

      const isEmptyFieldExist = Object.values(changePasswordData).some(
        (data) => !data,
      );
      if (isEmptyFieldExist) {
        alert("빈 칸을 확인하세요");
        setLoading(false);
        return;
      }
      if (
        changePasswordData.newPassword !== changePasswordData.passwordConfirm
      ) {
        setPasswordError(true);
        setLoading(false);
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
          data,
        );

        alert(response.data);
        setChangePasswordForm(false);
        navigator("/main");
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<any>;
          if (axiosError.response) {
            alert(axiosError.response.data.message);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [
      changePasswordData,
      navigator,
      user?.email,
      setLoading,
      setChangePasswordForm,
    ],
  );

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <div className="password-modal__header">
          <h3>
            <i className="fas fa-key"></i>
            비밀번호 변경
          </h3>
          <button
            className="password-modal__close"
            onClick={() => setChangePasswordForm(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form className="password-form" onSubmit={changePasswordSubmit}>
          <div className="password-field">
            <label className="password-label">
              <i className="fas fa-lock"></i>
              현재 비밀번호
            </label>
            <input
              className="password-input"
              name="prevPassword"
              type="password"
              value={changePasswordData.prevPassword}
              onChange={handleOnChange}
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>

          <div className="password-field">
            <label className="password-label">
              <i className="fas fa-key"></i>새 비밀번호
            </label>
            <input
              className="password-input"
              name="newPassword"
              type="password"
              value={changePasswordData.newPassword}
              onChange={handleOnChange}
              placeholder="새 비밀번호를 입력하세요"
            />
          </div>

          <div className="password-field">
            <label className="password-label">
              <i className="fas fa-check-circle"></i>새 비밀번호 확인
            </label>
            <input
              className="password-input"
              name="passwordConfirm"
              type="password"
              value={changePasswordData.passwordConfirm}
              onChange={handleOnChange}
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>

          {passwordError && (
            <div className="password-error">
              <i className="fas fa-exclamation-circle"></i>
              비밀번호가 일치하지 않습니다
            </div>
          )}

          <button type="submit" className="password-submit">
            <i className="fas fa-check"></i>
            비밀번호 변경
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
