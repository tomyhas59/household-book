import axios from "axios";
import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { MonthDataType, UserType } from "../type";
import { BASE_URL } from "../config/config";
import { useSetRecoilState } from "recoil";
import { loadingState } from "../recoil/atoms";

type PropsType = {
  year: number;
  month: number;
  monthData: MonthDataType;
  user: UserType;
};

const Note: React.FC<PropsType> = ({ year, month, monthData, user }) => {
  const [isNote, setIsNote] = useState(false);
  const [note, setNote] = useState("");
  const [originalNote, setOriginalNote] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const setLoading = useSetRecoilState(loadingState);

  const onChangeNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    if (note === "") return;

    const requestData = {
      userId: user?.id,
      year: year,
      month: month,
      note: note ? note : null,
    };
    try {
      await axios.post(`${BASE_URL}/api/saveNoteOrBudget`, null, {
        params: requestData,
      });
      setIsNote(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNote(originalNote);
    setIsNote(false);
  };

  useEffect(() => {
    setNote(monthData?.note || "");
    setOriginalNote(monthData?.note || "");
    setIsNote(false);
  }, [monthData]);

  const handleModify = () => {
    setOriginalNote(note);
    setIsNote(true);
  };

  useEffect(() => {
    if (isNote && noteRef.current) {
      noteRef.current.focus();
    }
  }, [isNote]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (noteRef.current && !noteRef.current.contains(target)) {
        // 버튼이 없을 시 실행
        if (!target.closest("button")) {
          setIsNote(false);
          setNote(originalNote);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [originalNote]);

  return (
    <NoteContainer>
      {isNote ? (
        <Form onSubmit={handleSubmit}>
          <TextArea onChange={onChangeNote} value={note} ref={noteRef} />
          <ButtonContainer>
            <Button type="submit">등록</Button>
            <Button type="button" onClick={handleCancel}>
              취소
            </Button>
          </ButtonContainer>
        </Form>
      ) : (
        <NoteDisplay onClick={handleModify}>
          {note ? (
            note
          ) : (
            <div>
              메모 <br />
              클릭하여 등록
            </div>
          )}
        </NoteDisplay>
      )}
    </NoteContainer>
  );
};

export default Note;

const NoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
  width: 100%;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const TextArea = styled.textarea`
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  height: 200px;
  resize: none;
  outline: none;

  &:focus {
    border-color: #007bff;
  }

  @media (max-width: 768px) {
    padding: 10px;
    font-size: 0.9rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 8px;
    justify-content: space-between;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
  }

  &:nth-child(2) {
    background-color: #ccc;
    &:hover {
      background-color: #aaa;
    }
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const NoteDisplay = styled.div`
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
  height: 250px;
  overflow: auto;
  cursor: pointer;
  color: #555;
  white-space: pre-wrap;

  &:hover {
    background-color: #f0f0f0;
  }
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  div {
    font-size: 1rem;
    color: #888;
  }

  @media (max-width: 768px) {
    padding: 10px;
    div {
      font-size: 0.8rem;
    }
  }
`;
