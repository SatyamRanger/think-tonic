import { useState, useEffect } from "react";
import WelcomeHero from "@/components/WelcomeHero";
import IdeaSubmissionForm from "@/components/IdeaSubmissionForm";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import AIBrainstorming from "@/components/AIBrainstorming";
import BestIdeaDisplay from "@/components/BestIdeaDisplay";

type ViewState = "hero" | "submission" | "brainstorming";

interface BrainstormingState {
  category: string;
  categoryLabel: string;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>("hero");
  const [brainstormingState, setBrainstormingState] = useState<BrainstormingState | null>(null);

  const handleBrainstorm = (category: string, categoryLabel: string) => {
    setBrainstormingState({ category, categoryLabel });
    setCurrentView("brainstorming");
  };

  const handleSaveIdea = (idea: string) => {
    // You could pre-fill the submission form with the AI-generated idea
    console.log("Saving idea:", idea);
    setCurrentView("submission");
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === "hero" && (
        <>
          <WelcomeHero onGetStarted={() => setCurrentView("submission")} />
          <AnalyticsDashboard />
        </>
      )}
      
      {currentView === "submission" && (
        <IdeaSubmissionForm 
          onClose={() => setCurrentView("hero")} 
          onBrainstorm={handleBrainstorm}
        />
      )}
      
      {currentView === "brainstorming" && brainstormingState && (
        <AIBrainstorming
          category={brainstormingState.category}
          categoryLabel={brainstormingState.categoryLabel}
          onBack={() => setCurrentView("submission")}
          onSaveIdea={handleSaveIdea}
        />
      )}
    </div>
  );
};

export default Index;