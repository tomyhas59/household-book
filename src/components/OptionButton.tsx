// OptionButton.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { changePasswordFormState, userState } from "../recoil/atoms";
import { useSetRecoilState } from "recoil";
import "../styles/OptionButton.css";

const OptionButton = () => {
  const navigator = useNavigate();
  const setUser = useSetRecoilState(userState);
  const [popUpOption, setPopUpOption] = useState<boolean>(false);
  const popUpOptionRef = useRef<HTMLDivElement>(null);

  const setChangePasswordForm = useSetRecoilState(changePasswordFormState);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setUser(null);
    navigator("/");
    console.log("로그아웃 완료");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popUpOptionRef.current &&
        !popUpOptionRef.current.contains(e.target as Node)
      ) {
        setPopUpOption(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOption = () => {
    setChangePasswordForm(true);
    setPopUpOption(false);
  };

  return (
    <div className="option-wrapper">
      <button
        className="option-btn"
        onClick={() => setPopUpOption((prev) => !prev)}
      >
        <i className="fas fa-cog"></i>
        <span>옵션</span>
      </button>
      {popUpOption && (
        <div className="option-menu" ref={popUpOptionRef}>
          <button className="option-menu-item" onClick={handleOption}>
            <i className="fas fa-key"></i>
            비밀번호 변경
          </button>
          <button
            className="option-menu-item option-menu-item--logout"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};

export default OptionButton;
