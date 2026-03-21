import axios from "axios";
import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { MonthDataType, UserType } from "../type";
import { BASE_URL } from "../config/config";
import { useSetRecoilState } from "recoil";
import { loadingState } from "../recoil/atoms";
import "../styles/Note.css";

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
    <div className="note-container">
      <div className="note-header">
        <i className="fas fa-sticky-note"></i>
        <h3>메모</h3>
      </div>

      {isNote ? (
        <form className="note-form" onSubmit={handleSubmit}>
          <textarea
            className="note-textarea"
            onChange={onChangeNote}
            value={note}
            ref={noteRef}
            placeholder="메모를 입력하세요..."
          />
          <div className="note-buttons">
            <button type="submit" className="note-btn note-btn--save">
              <i className="fas fa-check"></i>
              등록
            </button>
            <button
              type="button"
              className="note-btn note-btn--cancel"
              onClick={handleCancel}
            >
              <i className="fas fa-times"></i>
              취소
            </button>
          </div>
        </form>
      ) : (
        <div className="note-display" onClick={handleModify}>
          {note ? (
            <div className="note-content">{note}</div>
          ) : (
            <div className="note-empty">
              <i className="fas fa-pen"></i>
              <span>클릭하여 메모 작성</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Note;
