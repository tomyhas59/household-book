import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Details from "./components/Details";
import localforage from "localforage";
import Income from "./components/Income";
import Saving from "./components/Saving";
import Fixed from "./components/Fixed";
import styled from "styled-components";
import Account from "./components/Account";
import Result from "./components/Result";
import DateSelector from "./components/DateSelector";

const App = () => {
  const detailCategory = useMemo(
    () => ["식비", "생필품", "문화생활", "교통비", "의료 및 기타"],
    []
  );
  const [detailsTotals, setDetailsTotals] = useState(
    new Array(detailCategory.length).fill(0)
  );
  const [income, setIncome] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [saving, setSaving] = useState(0);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [note, setNote] = useState("");
  const [isNote, setIsNote] = useState(true);
  const [originalNote, setOriginalNote] = useState("");
  const noteRef = useRef(null);
  const [dateKey, setDateKey] = useState("");
  const [dataBydate, setDataByDate] = useState({});

  useEffect(() => {
    setDateKey(`${year}-${month}`);
  }, [year, month]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await localforage.getItem(dateKey);
      setDataByDate(data || {});
    };
    if (dateKey) {
      fetchData();
    }
  }, [dateKey]);

  const onChangeNote = (e) => {
    setNote(e.target.value);
  };

  const updateAllTotal = useCallback((index, total) => {
    setDetailsTotals((prevTotals) => {
      const newAllTotals = [...prevTotals];
      if (newAllTotals[index] !== total) {
        newAllTotals[index] = total;
        return newAllTotals;
      }
      return prevTotals;
    });
  }, []);

  const livingTotal = detailsTotals.reduce((acc, total) => acc + total, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (note === "") return;

    const updatedData = {
      ...dataBydate,
      ["note"]: note,
    };

    localforage.setItem(dateKey, updatedData);
    setIsNote(true);
  };

  const handleCancel = () => {
    setNote(originalNote);
    setIsNote(true);
  };

  useEffect(() => {
    localforage.getItem(dateKey).then((data) => {
      if (data) {
        console.log(data);
        setNote(data["note"]);
        setOriginalNote(data["note"]);
        setIsNote(true);
      }
    });
  }, [dateKey]);

  const handleModify = () => {
    setOriginalNote(note);
    setIsNote(false);
  };

  useEffect(() => {
    if (!isNote && noteRef.current) {
      noteRef.current.focus();
    }
  }, [isNote]);

  return (
    <AppContainer>
      <FlexContainer>
        <ColumnContainer style={{ backgroundColor: "#f0f0f0" }}>
          <DateSelector
            year={year}
            month={month}
            setYear={setYear}
            setMonth={setMonth}
          />
          <Account income={income} saving={saving} fixed={fixed} />
          <Result
            livingTotal={livingTotal}
            income={income}
            fixed={fixed}
            saving={saving}
            dateKey={dateKey}
            dataBydate={dataBydate}
          />
          <NoteContainer>
            <Label>노트</Label>
            {isNote ? (
              <NoteDisplay onClick={handleModify}>
                {note ? note : <div>클릭하여 등록</div>}
              </NoteDisplay>
            ) : (
              <Form onSubmit={handleSubmit}>
                <TextArea onChange={onChangeNote} value={note} ref={noteRef} />
                <ButtonContainer>
                  <Button type="submit">등록</Button>
                  <Button type="button" onClick={handleCancel}>
                    취소
                  </Button>
                </ButtonContainer>
              </Form>
            )}
          </NoteContainer>
        </ColumnContainer>
        <ColumnContainer>
          <Income
            setIncome={setIncome}
            dateKey={dateKey}
            dataBydate={dataBydate}
          />
          <Saving
            setSaving={setSaving}
            dateKey={dateKey}
            dataBydate={dataBydate}
          />
        </ColumnContainer>
        <ColumnContainer>
          <Fixed
            setFixed={setFixed}
            dateKey={dateKey}
            dataBydate={dataBydate}
          />
        </ColumnContainer>
      </FlexContainer>
      <DetailsContainer>
        {detailCategory.map((key, index) => (
          <Details
            key={index}
            title={key}
            detailCategory={key}
            onTotalChange={(total) => updateAllTotal(index, total)}
            livingTotal={livingTotal}
            dateKey={dateKey}
            dataBydate={dataBydate}
          />
        ))}
      </DetailsContainer>
    </AppContainer>
  );
};

export default App;

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  @media (max-width: 480px) {
    * {
      font-size: 12px;
    }
    display: block;
  }
  overflow: hidden;
`;

const FlexContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(33%, 1fr));
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DetailsContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const NoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 30vh;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
    border-radius: 8px;
  }
`;

const Label = styled.label`
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
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
  font-size: 1.1rem;
  color: #2c3e50;
  min-height: 200px;
  white-space: pre-wrap;

  > div {
    text-align: center;
    font-weight: bold;
  }
`;
