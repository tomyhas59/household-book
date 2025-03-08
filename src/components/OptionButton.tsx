import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { changePasswordFormState, userState } from "../recoil/atoms";
import { useSetRecoilState } from "recoil";

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
  };

  return (
    <OptionButtonWrapper onClick={() => setPopUpOption((prev) => !prev)}>
      OPTION
      {popUpOption && (
        <PopUpOption ref={popUpOptionRef}>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          <ChangePasswordText onClick={handleOption}>
            비밀번호 변경
          </ChangePasswordText>
        </PopUpOption>
      )}
    </OptionButtonWrapper>
  );
};

export default OptionButton;

const OptionButtonWrapper = styled.div`
  position: relative;
  background-color: #e74c3c;
  color: #ffffff;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  &:hover {
    background-color: #c0392b;
  }
  cursor: pointer;
  @media (max-width: 768px) {
    word-break: keep-all;
    min-width: 40px;
    font-size: 0.6rem;
    padding: 5px;
  }
`;

const LogoutButton = styled.button`
  width: 50px;
  text-decoration: none;
  color: #000;
  font-size: 10px;
  font-weight: bold;
  padding: 4px;
  border: 2px solid #fff;
  border-radius: 5px;
  transition: all 0.3s ease;
  border: 1px solid;
  cursor: pointer;
  &:hover {
    background-color: #e74c3c;
    color: #fff;
  }
  @media (max-width: 768px) {
    font-size: 0.6rem;
    margin: 0;
    padding: 5px;
  }
`;

const PopUpOption = styled.div`
  background-color: #e74c3c;
  padding: 5px;
  position: absolute;
  top: 20px;
  left: 30px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  z-index: 9999;
`;

const ChangePasswordText = styled(LogoutButton)``;
