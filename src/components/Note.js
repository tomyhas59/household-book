import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Note = ({ year, month, monthData, user }) => {
  const [isNote, setIsNote] = useState(false);
  const [note, setNote] = useState("");
  const [originalNote, setOriginalNote] = useState("");
  const noteRef = useRef(null);

  const onChangeNote = (e) => {
    setNote(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (note === "") return;

    const requestData = {
      userId: parseInt(user.id),
      year: parseInt(year),
      month: parseInt(month),
      note: note ? note : null,
    };
    try {
      await axios.post("http://localhost:8090/api/saveNoteOrBudget", null, {
        params: requestData,
      });
      setIsNote(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    setNote(originalNote);
    setIsNote(false);
  };

  useEffect(() => {
    setNote(monthData.note);
    setOriginalNote(monthData.note);
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
    const handleClickOutside = (e) => {
      if (noteRef.current && !noteRef.current.contains(e.target)) {
        //버튼이 없을 시 실행
        if (!e.target.closest("button")) {
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
  width: 100%;
  height: 50%;
  padding: 10px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 40vh;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 10px;
  resize: vertical;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Button = styled.button`
  padding: 5px;
  background-color: #2ecc71;
  color: white;
  border: none;
  font-size: 12px;
  margin-left: 1px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #27ae60;
  }
`;

const NoteDisplay = styled.div`
  font-size: 10px;
  height: 50vh;
  color: #2c3e50;
  white-space: pre-wrap;
  > div {
    font-size: 1.5rem;
    text-align: center;
    font-weight: bold;
    color: #999;
    opacity: 0.7;
  }
`;
