import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Calendar,
  TrendingUp,
  BarChart3,
  Star,
  AlertCircle,
  Activity,
  RefreshCcw
} from "lucide-react";
import { getHistorySummary, getHistoryList, type Assessment, type HistorySummary } from "@/api/endpoints";

function toNumber(n: unknown, fallback = 0): number {
  return typeof n === "number" && !Number.isNaN(n) ? n : fallback;
}

function normalizeAssessment(a: any): Assessment {
  const rawSkills = Array.isArray(a?.skills) ? a.skills : a?.top_skills || a?.tags || [];
  const skills: string[] = Array.isArray(rawSkills)
    ? rawSkills
        .map((s: any) => (typeof s === "string" ? s : s?.name ?? s?.label ?? ""))
        .filter(Boolean)
    : [];

  return {
    id: a?.id ?? a?.pk ?? a?.uuid ?? undefined,
    date: typeof a?.date === "string" ? a.date : a?.date_created ?? a?.created_at ?? a?.timestamp ?? null,
    title: a?.title ?? a?.name ?? a?.position ?? a?.filename ?? "Assessment",
    score: typeof a?.score === "number" ? a.score : a?.average_score ?? a?.overall_score ?? a?.result?.score ?? null,
    skills,
    status: a?.status ?? a?.state ?? undefined,
    ...a,
  };
}

function computeTopSkill(list: Assessment[]): string | null {
  const freq = new Map<string, number>();
  for (const a of list) {
    for (const s of a.skills ?? []) {
      freq.set(s, (freq.get(s) ?? 0) + 1);
    }
  }
  let best: string | null = null;
  let max = 0;
  for (const [skill, count] of freq) {
    if (count > max) {
      max = count;
      best = skill;
    }
  }
  return best;
}

export default function DashboardPage() {
  const {
    data: summaryRaw,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useQuery<HistorySummary>({
    queryKey: ["history", "summary"],
    queryFn: getHistorySummary,
  });

  const {
    data: listRaw,
    isLoading: listLoading,
    isError: listError,
    refetch: refetchList,
  } = useQuery<Assessment[]>({
    queryKey: ["history", "list"],
    queryFn: getHistoryList,
  });

  const loading = summaryLoading || listLoading;
  const hasError = summaryError || listError;

  const assessments = useMemo(() => {
    const arr = Array.isArray(listRaw) ? listRaw : [];
    return arr.map(normalizeAssessment);
  }, [listRaw]);

  // Enrich assessments with locally cached Job Match details (no backend changes)
  type Enriched = Assessment & {
    kind: "job_match" | "quiz";
    missing_keywords?: string[];
    summary?: string;
  };

  function loadJobMatchCache(): Array<{
    position: string;
    match_score: number;
    missing_keywords: string[];
    summary: string;
    timestamp: number;
  }> {
    try {
      const raw = localStorage.getItem("job_match_cache");
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) return arr;
    } catch {}
    return [];
  }

  const enriched: Enriched[] = useMemo(() => {
    const cache = loadJobMatchCache();
    if (!assessments.length) return [] as Enriched[];
    if (!cache.length) return assessments.map((a) => ({ ...a, kind: "quiz" as const }));

    return assessments.map((a) => {
      const aDate = a.date ? new Date(a.date).getTime() : null;
      const aScore = typeof a.score === "number" ? a.score : null;
      const aPos = (a.title ?? "").toString().toLowerCase().trim();

      const match = cache.find((c) => {
        const posOk = (c.position ?? "").toString().toLowerCase().trim() === aPos && !!aPos;
        if (!posOk) return false;
        if (aDate == null) return false;
        const dt = Math.abs(c.timestamp - aDate);
        if (dt > 5 * 60 * 1000) return false; // within 5 minutes
        if (aScore == null) return true;
        return Math.abs(c.match_score - aScore) <= 2; // within 2%
      });

      if (match) {
        return {
          ...a,
          kind: "job_match" as const,
          summary: match.summary,
          missing_keywords: Array.isArray(match.missing_keywords) ? match.missing_keywords : undefined,
        };
      }
      return { ...a, kind: "quiz" as const };
    });
  }, [assessments]);

  const totalAssessments = useMemo(() => {
    const total = (summaryRaw?.total ?? summaryRaw?.total_assessments ?? (summaryRaw as any)?.assessments) as number | undefined;
    return typeof total === "number" ? total : assessments.length;
  }, [summaryRaw, assessments.length]);

  const averageScore = useMemo(() => {
    const s = (summaryRaw?.average_score ?? summaryRaw?.avg_score) as number | undefined;
    if (typeof s === "number") return s;
    const nums = assessments.map((a) => toNumber(a.score, NaN)).filter((v) => !Number.isNaN(v));
    if (!nums.length) return 0;
    return Math.round(nums.reduce((acc, v) => acc + v, 0) / nums.length);
  }, [summaryRaw, assessments]);

  const lastActivity = useMemo(() => {
    const d = (summaryRaw?.last_activity ?? summaryRaw?.last_assessment_date) as string | undefined;
    if (d) return d;
    const dates = assessments
      .map((a) => (a.date ? new Date(a.date) : null))
      .filter((x): x is Date => x instanceof Date && !Number.isNaN(x.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());
    return dates[0]?.toISOString() ?? null;
  }, [summaryRaw, assessments]);

  const topSkill = useMemo(() => {
    return (summaryRaw?.top_skill as string | undefined) ?? computeTopSkill(assessments);
  }, [summaryRaw, assessments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero py-8">
        <div className="container mx-auto px-4 max-w-6xl space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Loading dashboard…</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-72 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-hero py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="shadow-medium border-destructive/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Unable to load dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground">Please try again in a moment.</p>
              <Button onClick={() => { refetchSummary(); refetchList(); }} variant="outline">
                <RefreshCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isEmpty = !assessments.length;

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Track your assessments and skill growth</p>
          </div>
          {/* Actions removed per request */}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalAssessments}</p>
                  <p className="text-sm text-muted-foreground">Assessments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{toNumber(averageScore, 0)}%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{topSkill ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">Top Skill</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {lastActivity ? new Date(lastActivity).toLocaleDateString() : "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">Last Activity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty state */}
        {isEmpty ? (
          <Card className="shadow-large">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Get started with your first assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-muted-foreground">
                Upload a resume to generate insights and track progress over time.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="hero">
                  <Link to="/upload">
                    <FileText className="w-4 h-4 mr-2" /> Upload Resume
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-large">
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="text-left">
                      <th className="py-2 pr-3 font-medium">Date</th>
                      <th className="py-2 pr-3 font-medium">Position</th>
                      <th className="py-2 pr-3 font-medium">Score</th>
                      <th className="py-2 pr-3 font-medium">Top Skills</th>
                      <th className="py-2 pr-3 font-medium">Type</th>
                      <th className="py-2 pr-3 font-medium">Missing Keywords</th>
                      <th className="py-2 pr-3 font-medium">Summary</th>
                      <th className="py-2 pr-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enriched.slice(0, 10).map((a, idx) => {
                      const date = a.date ? new Date(a.date) : null;
                      const isJob = (a as any).kind === "job_match";
                      const score = typeof a.score === "number" ? `${a.score}%` : "—";
                      const skills = a.skills?.slice?.(0, 4) ?? [];
                      return (
                        <tr key={String(a.id ?? idx)} className="border-t">
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {date && !Number.isNaN(date.getTime())
                              ? date.toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-2 pr-3 max-w-[28ch] truncate">{a.title ?? "Assessment"}</td>
                          <td className="py-2 pr-3">{score}</td>
                          <td className="py-2 pr-3">
                            <div className="flex flex-wrap gap-1">
                              {skills.map((s) => (
                                <Badge key={s} variant="outline" className="text-xs">
                                  {s}
                                </Badge>
                              ))}
                              {typeof a.skills?.length === "number" && a.skills.length > 4 && (
                                <Badge variant="outline" className="text-xs">+{a.skills.length - 4} more</Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-3">
                            <Badge variant={isJob ? "default" : "outline"} className="text-xs">
                              {isJob ? "Job Match" : "Quiz"}
                            </Badge>
                          </td>
                          <td className="py-2 pr-3">
                            {isJob && Array.isArray((a as any).missing_keywords) && (a as any).missing_keywords.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[36ch] truncate">
                                {(a as any).missing_keywords.slice(0, 4).map((s: string) => (
                                  <Badge key={s} variant="outline" className="text-xs">
                                    {s}
                                  </Badge>
                                ))}
                                {(a as any).missing_keywords.length > 4 && (
                                  <Badge variant="outline" className="text-xs">+{(a as any).missing_keywords.length - 4} more</Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-2 pr-3 max-w-[40ch] truncate">
                            {isJob && (a as any).summary ? (
                              <span className="text-foreground/90">{(a as any).summary}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-2 pr-3">
                            <Button asChild size="sm" variant="outline">
                              <Link to="/results">View</Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
