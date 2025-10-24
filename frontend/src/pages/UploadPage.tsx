import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { uploadCV } from "@/api/endpoints";

type UploadState = "idle" | "uploading" | "success" | "error" | "unauth";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [cvId, setCvId] = useState<string | number | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const nav = useNavigate();

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setError(null);
    if (!f) return setFile(null);
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFile(null);
      return setError("Please choose a PDF file.");
    }
    setFile(f);
  };

  async function doUpload() {
    const token = localStorage.getItem("access");
    if (!token) {
      setState("unauth");
      setError("You must be logged in to upload.");
      return;
    }
    if (!file) {
      setError("Please choose a PDF to upload.");
      return;
    }
    setState("uploading");
    setError(null);

    try {
      const res = await uploadCV(file);
      const returnedId = res?.cv_id ?? res?.id ?? res?.cvId;
      const returnedName = res?.filename ?? file.name;
      if (!returnedId) throw new Error("Upload succeeded but no cv_id returned.");

      localStorage.setItem("last_cv_id", String(returnedId));
      // notify any listeners (Navbar)
      window.dispatchEvent(new StorageEvent("storage", { key: "last_cv_id", newValue: String(returnedId) }));

      setCvId(returnedId);
      setFilename(returnedName);
      setState("success");
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setState("unauth");
        setError("Authentication required. Please log in.");
        return;
      }
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.detail ||
        e?.message ||
        "Upload failed.";
      setError(msg);
      setState("error");
    }
  }

  const goQuiz = () => {
    if (!cvId) return;
    nav("/quiz", { state: { cvId } });
  };

  const resetAll = () => {
    setFile(null);
    setError(null);
    setCvId(null);
    setFilename(null);
    setState("idle");
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload your CV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Unauth notice */}
          {state === "unauth" && (
            <div className="space-y-3">
              <div className="text-amber-600 text-sm">
                You’re not logged in. Please sign in, then try again.
              </div>
              <div className="flex gap-3">
                <Button size="lg" className="gap-2" onClick={() => nav("/login")}>
                  Go to Login
                </Button>
                <Button size="lg" variant="secondary" className="gap-2" onClick={resetAll}>
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </Button>
              </div>
            </div>
          )}

          {/* Idle / uploading */}
          {state !== "success" && state !== "unauth" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm">Choose your PDF</label>
                <input type="file" accept="application/pdf,.pdf" onChange={onPick} />
                {file && (
                  <div className="text-sm text-muted-foreground">
                    Selected: <strong>{file.name}</strong>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">Supported format: PDF only.</div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={doUpload}
                  disabled={!file || state === "uploading"}
                >
                  {state === "uploading" ? "Uploading…" : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload resume
                    </>
                  )}
                </Button>

                {state === "error" && (
                  <Button variant="secondary" size="lg" className="gap-2" onClick={resetAll}>
                    <RotateCcw className="h-4 w-4" />
                    Try again
                  </Button>
                )}
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}
            </>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">
                  ✅ CV uploaded successfully{filename ? `: ${filename}` : ""}.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" className="gap-2" onClick={goQuiz}>
                  <ArrowRight className="h-4 w-4" />
                  Start Quiz
                </Button>
                <Button variant="secondary" size="lg" className="gap-2" onClick={resetAll}>
                  <Upload className="h-4 w-4" />
                  Upload another file
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Tip: saved CV ID <code>{String(cvId)}</code> so the Quiz page can auto-generate.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
