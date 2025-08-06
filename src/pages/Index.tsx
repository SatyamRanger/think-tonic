import { useState, useEffect } from "react";
import WelcomeHero from "@/components/WelcomeHero";
import IdeaSubmissionForm from "@/components/IdeaSubmissionForm";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

const Index = () => {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {!showSubmissionForm ? (
        <>
          <WelcomeHero onGetStarted={() => setShowSubmissionForm(true)} />
          <AnalyticsDashboard />
        </>
      ) : (
        <IdeaSubmissionForm onClose={() => setShowSubmissionForm(false)} />
      )}
    </div>
  );
};

export default Index;