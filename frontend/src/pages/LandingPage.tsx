import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Brain, BarChart3, CheckCircle, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const LandingPage = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload",
      description: "Upload your resume in PDF format",
    },
    {
      icon: Brain,
      title: "Analyze",
      description: "AI extracts and categorizes your skills",
    },
    {
      icon: CheckCircle,
      title: "Quiz",
      description: "Take a personalized skill assessment",
    },
    {
      icon: BarChart3,
      title: "Feedback",
      description: "Get detailed insights and improvement tips",
    },
  ];

  const features = [
    {
      icon: FileText,
      title: "Smart Resume Analysis",
      description: "AI-powered extraction of technical and soft skills from your resume",
    },
    {
      icon: Brain,
      title: "Personalized Quizzes",
      description: "Tailored assessments based on your specific skill set",
    },
    {
      icon: BarChart3,
      title: "Detailed Feedback",
      description: "Comprehensive reports with actionable improvement suggestions",
    },
    {
      icon: Users,
      title: "Career Ready",
      description: "Build confidence and stand out in tech job interviews",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="gradient-hero absolute inset-0" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto animate-slide-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              VeriCV
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Discover your real strengths.
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-12">
              Be job-ready.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="xl" className="animate-float">
                <Link to="/upload">Upload Resume</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get personalized insights into your skills in just four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={step.title} className="card-hover text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose VeriCV?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced AI technology meets career development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your resume and discover your true potential with AI-powered analysis
          </p>
          <Button asChild variant="hero" size="xl">
            <Link to="/upload">Upload Your Resume</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
