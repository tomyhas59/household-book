import React, { useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { userState } from "../recoil/atoms";
import axios from "axios";
import { BASE_URL } from "../config/config";
import OptionButton from "./OptionButton";
import "../styles/Header.css";

interface HeaderProps {
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
}

const Header = ({ leftContent, centerContent }: HeaderProps) => {
  const setUser = useSetRecoilState(userState);
  const user = useRecoilValue(userState);

  // 세션 복구 로직 (로그인 유지)
  useEffect(() => {
    const restoreSession = async () => {
      if (user) return; // 이미 유저 정보가 있다면 스킵
      try {
        const response = await axios.get(`${BASE_URL}/api/me`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        console.log("로그인 정보 없음");
        setUser(null);
      }
    };
    restoreSession();
  }, [setUser, user]);

  return (
    <header className="common-header">
      <div className="header__left">
        {leftContent}
        <div className="header-info">
          <div className="header-user">{user?.nickname}님</div>
          <OptionButton />
        </div>
      </div>
      <div className="header__center">{centerContent}</div>
    </header>
  );
};

export default Header;
