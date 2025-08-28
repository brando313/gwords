import React, { useEffect, useState } from "react";

type Status = "unanswered" | "correct" | "incorrect" | "skipped";

function parseWords(txt: string): string[] {
  return txt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 100); // keep original casing
}

async function loadTxt(): Promise<string[]> {
  const res = await fetch("./gwords.txt", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load gwords.txt (${res.status})`);
  const txt = await res.text();
  const words = parseWords(txt);
  if (words.length === 0) throw new Error("gwords.txt has no words");
  return words;
}

export default function App() {
  const [words, setWords] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<Record<number, Status>>({});
  const [index, setIndex] = useState(0);

  useEffect(() => {
    loadTxt()
      .then((w) => setWords(w))
      .catch((e) => console.error(e));
  }, []);

  const updateStatus = (status: Status) => {
    setStatuses((prev) => ({ ...prev, [index]: status }));
    if (status === "correct") {
      goToNextUnfinished(index);
    }
  };

  const goToNextUnfinished = (start: number) => {
    for (let i = start + 1; i < words.length; i++) {
      if (statuses[i] !== "correct") {
        setIndex(i);
        return;
      }
    }
    for (let i = 0; i <= start; i++) {
      if (statuses[i] !== "correct") {
        setIndex(i);
        return;
      }
    }
  };

  const goPrev = () => setIndex((i) => (i > 0 ? i - 1 : words.length - 1));
  const goNext = () => goToNextUnfinished(index);

  if (words.length === 0) return <div>Loading words…</div>;

  return (
    <div className="app">
      <div className="header">
        <div className="header-title">George&apos;s Words</div>
        <div className="header-actions">
          <button onClick={() => setIndex(0)}>Summary</button>
          <button onClick={() => { setStatuses({}); setIndex(0); }}>Reset</button>
        </div>
      </div>

      <div className="word-info">
        Word {index + 1} of {words.length}
      </div>

      <div className="word-card">
        <span>{words[index]}</span>
      </div>

      <div className="controls">
        <button className="correct" onClick={() => updateStatus("correct")}>✓ Correct</button>
        <button className="incorrect" onClick={() => updateStatus("incorrect")}>✗ Incorrect</button>
        <button className="skip" onClick={() => updateStatus("skipped")}>Skip</button>
      </div>

      <div className="nav">
        <button onClick={goPrev}>← Prev</button>
        <button onClick={goNext}>Next →</button>
      </div>

      <div className="footer">
        Tip: Edit <b>public/gwords.txt</b> to update the word list.
      </div>
    </div>
  );
}
