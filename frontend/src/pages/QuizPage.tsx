import { useEffect, useMemo, useRef, useState } from "react";
import { generateQuiz, submitQuiz, GeneratedQuiz } from "@/api/endpoints";

export default function QuizPage() {
  const [data, setData] = useState<GeneratedQuiz | null>(null);
  const [deadlineMs, setDeadlineMs] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const timerRef = useRef<number | null>(null);

  // Load quiz
  useEffect(() => {
    (async () => {
      // Provide desired count from a user input if you have one; backend caps it.
      const res = await generateQuiz(/* optionalCount */);
      setData(res);

      const d = new Date(res.deadline_iso).getTime();
      setDeadlineMs(d);
      setRemaining(Math.max(0, Math.floor((d - Date.now()) / 1000)));
    })();
  }, []);

  // Tick countdown
  useEffect(() => {
    if (!deadlineMs) return;
    timerRef.current = window.setInterval(() => {
      const secs = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0 && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [deadlineMs]);

  const minutes = useMemo(() => Math.floor(remaining / 60), [remaining]);
  const seconds = useMemo(() => remaining % 60, [remaining]);
  const timeUp = remaining <= 0;

  const handleChange = (qid: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (!data) return;
    // If you have attempt_id from backend, include it:
    await submitQuiz({
      // attempt_id: data.attempt_id,
      answers,
    });
    // navigate to results page or show a success state
  };

  if (!data) return <div>Loading quiz…</div>;

  return (
    <div className="container mx-auto max-w-3xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Questions: {data.questions.length} (Max: {data.max_questions})
        </div>
        <div className={`text-lg font-semibold ${timeUp ? "text-red-500" : ""}`}>
          Time left: {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Render your questions. Example assumes each question has id, question, choices[] */}
      <div className="space-y-4">
        {data.questions.map((q: any, idx: number) => (
          <div key={q.id ?? idx} className="rounded-xl border p-4">
            <div className="font-medium mb-2">{idx + 1}. {q.question}</div>
            <div className="grid gap-2">
              {(q.choices ?? []).map((choice: string, i: number) => {
                const val = i; // or choice value
                const qid = String(q.id ?? idx);
                return (
                  <label key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`q-${qid}`}
                      value={val}
                      onChange={() => handleChange(qid, val)}
                      disabled={timeUp}
                    />
                    <span>{choice}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        className="px-4 py-2 rounded-lg border"
        onClick={handleSubmit}
        disabled={timeUp}
        title={timeUp ? "Time is up" : "Submit your answers"}
      >
        Submit
      </button>

      {timeUp && (
        <div className="text-red-500 text-sm">
          Time is up—submissions are disabled.
        </div>
      )}
    </div>
  );
}
