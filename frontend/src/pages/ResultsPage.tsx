import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  TrendingUp,
  Target,
  BookOpen,
  ArrowRight,
  Download,
  Share,
} from "lucide-react";

type SkillResult = {
  skill: string;
  score?: number;        // optional (backend may not send a numeric score)
  category?: "technical" | "soft";
  status?: "strong" | "good" | "needs-improvement";
};

type LocationState = {
  score?: number;
  results?: SkillResult[];
  feedback?: string[];   // if you decide to pass textual feedback too
};

const ResultsPage = () => {
  const { state } = useLocation() as { state?: LocationState };

  // If no state was passed (e.g., a direct refresh), show a helpful message.
  if (!state || (!state.score && !state.results?.length)) {
    return (
      <div className="min-h-screen bg-gradient-hero py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="shadow-large">
            <CardContent className="p-8 space-y-4">
              <p className="text-muted-foreground">
                No results to display yet. Please complete the quiz first.
              </p>
              <Button asChild variant="outline">
                <Link to="/quiz">Back to Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const overallScore = typeof state.score === "number" ? state.score : 0;
  const skillResults: SkillResult[] = Array.isArray(state.results) ? state.results : [];

  // Derive strengths / improvements even if scores are missing
  const strengths = useMemo(
    () => skillResults.filter((s) => (s.score ?? 0) >= 80),
    [skillResults]
  );
  const improvements = useMemo(
    () => skillResults.filter((s) => (s.score ?? 0) > 0 && (s.score ?? 0) < 70),
    [skillResults]
  );

  // Sample recommendations if backend didn’t provide any
  const recommendations = useMemo(() => {
    if (improvements.length === 0) {
      return [
        {
          skill: "Practice",
          suggestion: "Review topics you found challenging and retake a focused quiz.",
          resources: ["Docs", "Video Walkthrough", "Practice Set"],
        },
      ];
    }
    return improvements.slice(0, 3).map((imp) => ({
      skill: imp.skill,
      suggestion: `Deepen your understanding of ${imp.skill} with structured practice.`,
      resources: ["Official Docs", "Recommended Course", "Hands-on Exercises"],
    }));
  }, [improvements]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 70) return "text-primary";
    return "text-destructive";
  };
  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 70) return "bg-primary";
    return "bg-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 gradient-primary text-white p-3 rounded-full mx-auto mb-4 shadow-glow" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Assessment Results</h1>
          <p className="text-lg text-muted-foreground">
            Here&apos;s your personalized skill analysis and improvement roadmap
          </p>
        </div>

        {/* Overall Score */}
        <Card className="shadow-large mb-8">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center space-x-8">
              <div>
                <div className="text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                  {overallScore}%
                </div>
                <p className="text-muted-foreground">Overall Score</p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">
                  {overallScore >= 80 ? "Great Performance!" : overallScore >= 60 ? "Good Progress!" : "Keep Going!"}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {overallScore >= 80
                    ? "You've demonstrated strong technical and soft skills. Focus on the areas below for even better results."
                    : overallScore >= 60
                    ? "Solid foundation. Review the focus areas below to lift your score."
                    : "No worries—use the recommendations to build momentum steadily."}
                </p>
              </div>
            </div>
            <div className="mt-6 max-w-xl mx-auto">
              <Progress value={overallScore} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Skill Breakdown */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Skill Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skillResults.length === 0 ? (
                <p className="text-muted-foreground">No detailed breakdown available.</p>
              ) : (
                <div className="space-y-4">
                  {skillResults.map((result) => {
                    const score = result.score ?? 0;
                    return (
                      <div key={result.skill} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{result.skill}</span>
                            <Badge
                              variant={result.category === "technical" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {result.category ?? "n/a"}
                            </Badge>
                          </div>
                          {result.score !== undefined ? (
                            <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                          ) : (
                            <Badge variant="outline" className="text-xs">assessed</Badge>
                          )}
                        </div>
                        {result.score !== undefined && (
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(score)}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strengths & Improvements */}
          <div className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-success">
                  <TrendingUp className="w-5 h-5" />
                  <span>Your Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {strengths.length === 0 ? (
                  <p className="text-muted-foreground">No strong areas detected yet.</p>
                ) : (
                  <div className="space-y-2">
                    {strengths.map((s) => (
                      <div key={s.skill} className="flex items-center justify-between">
                        <span>{s.skill}</span>
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          {s.score ?? "✓"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <Target className="w-5 h-5" />
                  <span>Focus Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {improvements.length === 0 ? (
                  <p className="text-muted-foreground">No immediate improvement areas detected.</p>
                ) : (
                  <div className="space-y-2">
                    {improvements.map((imp) => (
                      <div key={imp.skill} className="flex items-center justify-between">
                        <span>{imp.skill}</span>
                        <Badge variant="outline" className="border-primary text-primary">
                          {imp.score ?? "review"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        <Card className="shadow-medium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Personalized Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <div key={rec.skill} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{rec.skill}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{rec.suggestion}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Recommended Resources:</p>
                    {rec.resources.map((resource) => (
                      <Badge key={resource} variant="outline" className="mr-2 text-xs">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" size="lg">
            <Share className="w-4 h-4 mr-2" />
            Share Results
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/dashboard">
              View Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
