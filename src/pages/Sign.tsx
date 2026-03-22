import { SyntheticEvent, useState } from "react";
import axios, { AxiosError } from "axios";
import { ErrorResponse, useNavigate } from "react-router";
import { useRecoilState, useSetRecoilState } from "recoil";
import { loadingState, userState } from "../recoil/atoms";
import { BASE_URL } from "../config/config";
import Spinner from "../components/Spinner";
import "../styles/Sign.css";

const Sign = () => {
  const [isSignUp, setIsSignUp] = useState(false);
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

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

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
      setIsSignUp(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<any>;
        if (err.response) {
          alert(err.response.data.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/login`, loginData, {
        withCredentials: true,
      });
      setUser(response.data);
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

  return (
    <div className="sign-page">
      {loading && <Spinner />}

      <div className="sign-container">
        {/* 배경 장식 */}
        <div className="sign-decoration">
          <div className="deco-circle deco-circle-1"></div>
          <div className="deco-circle deco-circle-2"></div>
          <div className="deco-circle deco-circle-3"></div>
        </div>

        {/* 카드 */}
        <div className="sign-card">
          {/* 헤더 */}
          <div className="sign-header">
            <div className="sign-logo">
              <i className="fas fa-wallet"></i>
            </div>
            <h1 className="sign-title">가계부</h1>
            <p className="sign-subtitle">똑똑한 재정 관리</p>
          </div>

          {/* 탭 */}
          <div className="sign-tabs">
            <button
              className={`sign-tab ${!isSignUp ? "sign-tab--active" : ""}`}
              onClick={() => setIsSignUp(false)}
            >
              <i className="fas fa-sign-in-alt"></i>
              로그인
            </button>
            <button
              className={`sign-tab ${isSignUp ? "sign-tab--active" : ""}`}
              onClick={() => setIsSignUp(true)}
            >
              <i className="fas fa-user-plus"></i>
              회원가입
            </button>
          </div>

          {/* 폼 영역 */}
          <div className="sign-forms">
            {/* 로그인 폼 */}
            {!isSignUp && (
              <form className="sign-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-envelope"></i>
                    이메일
                  </label>
                  <input
                    className="form-input"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="your@email.com"
                    type="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-lock"></i>
                    비밀번호
                  </label>
                  <input
                    className="form-input"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  <span>로그인</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </form>
            )}

            {/* 회원가입 폼 */}
            {isSignUp && (
              <form className="sign-form" onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-user"></i>
                    닉네임
                  </label>
                  <input
                    className="form-input"
                    name="nickname"
                    value={signupData.nickname}
                    onChange={handleSignupChange}
                    placeholder="홍길동"
                    type="text"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-envelope"></i>
                    이메일
                  </label>
                  <input
                    className="form-input"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder="your@email.com"
                    type="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-lock"></i>
                    비밀번호
                  </label>
                  <input
                    className="form-input"
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-check-circle"></i>
                    비밀번호 확인
                  </label>
                  <input
                    className="form-input"
                    name="passwordConfirm"
                    value={signupData.passwordConfirm}
                    onChange={handleSignupChange}
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  <span>가입하기</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sign;
