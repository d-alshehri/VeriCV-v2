import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { aiGenerateFromFileSmart, aiGenerateFromCVId } from "@/api/endpoints";
import { Upload } from "lucide-react";
import { useLocation } from "react-router-dom";

type QuizState = "idle" | "loading" | "ready" | "error";

export default function QuizPage() {
  const location = useLocation() as any;
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [status, setStatus] = useState<QuizState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [cvId] = useState<string | null>(
    String(location?.state?.cvId ?? localStorage.getItem("last_cv_id") ?? "") || null
  );

  function extractQuestions(raw: any): any[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.questions)) return raw.questions;
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.questions)) return parsed.questions;
    } catch {}
    return [];
  }

  // Auto-generate if cvId exists
  useEffect(() => {
    if (!cvId) return;
    (async () => {
      setStatus("loading");
      setError(null);
      setQuestions([]);
      try {
        const data = await aiGenerateFromCVId(cvId);
        const qs = extractQuestions(data);
        if (!qs.length) {
          setError("No questions were generated yet. Please try again.");
          setStatus("error");
          return;
        }
        setQuestions(qs);
        setStatus("ready");
      } catch (e: any) {
        setError(e?.response?.data?.error || e?.message || "Failed to generate questions.");
        setStatus("error");
      }
    })();
  }, [cvId]);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please choose a PDF file.");
      setPdfFile(null);
      return;
    }
    setError(null);
    setPdfFile(f);
  };

  const generateFromFile = async () => {
    if (!pdfFile) {
      setError("Please choose a PDF to generate questions from.");
      return;
    }
    setStatus("loading");
    setError(null);
    setQuestions([]);
    try {
      const data = await aiGenerateFromFileSmart(pdfFile);
      const qs = extractQuestions(data);
      if (!qs.length) {
        setError("No questions were generated. Check your server logs.");
        setStatus("error");
        return;
      }
      setQuestions(qs);
      setStatus("ready");
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to generate questions."
      );
      setStatus("error");
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Quiz from your CV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Only show file picker if user didn't just upload (no cvId) */}
          {status !== "ready" && !cvId && (
            <>
              <div>
                <label className="block text-sm mb-2">Upload a PDF CV</label>
                <div className="flex items-center gap-3">
                  <input type="file" accept="application/pdf,.pdf" onChange={handlePick} />
                  {pdfFile && (
                    <span className="text-sm">
                      Selected: <strong>{pdfFile.name}</strong>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={generateFromFile} disabled={!pdfFile || status === "loading"} className="gap-2">
                  {status === "loading" ? "Generating…" : (
                    <>
                      <Upload className="h-4 w-4" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {cvId && status === "loading" && (
            <div className="text-sm text-muted-foreground">Generating from CV #{cvId}…</div>
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}

          {status === "ready" && questions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Questions</h3>
              <ol className="list-decimal ml-6 space-y-3">
                {questions.map((q: any, i: number) => (
                  <li key={i}>
                    <div className="font-medium">
                      {q.question || q.prompt || q.text || String(q)}
                    </div>
                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        {q.options.map((opt: string, j: number) => (
                          <li key={j}>{opt}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
