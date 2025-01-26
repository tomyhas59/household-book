import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { userState } from "../recoil/atoms";
import { useSetRecoilState } from "recoil";

const OptionButton = () => {
  const navigator = useNavigate();
  const setUser = useSetRecoilState(userState);

  const [popUpOption, setpopUpOption] = useState<boolean>(false);
  const popUpOptionRef = useRef<HTMLDivElement>(null);
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
        setpopUpOption(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <OptionButtonWrapper>
      <OptionOpenButton onClick={() => setpopUpOption((prev) => !prev)}>
        OPTION
      </OptionOpenButton>
      {popUpOption && (
        <PopUpOption ref={popUpOptionRef}>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
          <ChangePasswordText>비밀번호 변경</ChangePasswordText>
        </PopUpOption>
      )}
    </OptionButtonWrapper>
  );
};

export default OptionButton;

const OptionButtonWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  @media (max-width: 480px) {
    word-break: keep-all;
    gap: 0;
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
  @media (max-width: 480px) {
    font-size: 0.6rem;
    margin: 0;
    padding: 5px;
  }
`;

const OptionOpenButton = styled.div`
  text-align: center;
  font-size: 10px;
  text-decoration: none;
  background-color: #e74c3c;
  border-radius: 8px;
  padding: 4px;
  color: #ffffff;
  transition: all 0.3s ease;
  cursor: pointer;
  &:hover {
    background-color: #c0392b;
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
  @media (max-width: 480px) {
    left: 100px;
  }
`;

const ChangePasswordText = styled(LogoutButton)``;
