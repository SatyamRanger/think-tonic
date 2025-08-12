import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/innovation-hero.jpg";
import BestIdeaDisplay from "@/components/BestIdeaDisplay";

interface WelcomeHeroProps {
  onGetStarted: () => void;
}

const WelcomeHero = ({ onGetStarted }: WelcomeHeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-16 h-16 bg-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-40 right-32 w-8 h-8 bg-innovation/30 rounded-full animate-bounce" />
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-primary-glow/20 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-innovation/10 rounded-full animate-bounce" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Brain className="w-16 h-16 text-primary animate-pulse" />
            <div className="absolute -top-2 -right-2">
              <Lightbulb className="w-8 h-8 text-innovation animate-bounce" />
            </div>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-innovation to-primary-glow bg-clip-text text-transparent animate-pulse">
          IDEATE
        </h1>
        
        <div className="text-2xl md:text-3xl mb-8 text-foreground/90">
          <span className="font-semibold">The world is changing</span>
          <br />
          <span className="text-lg md:text-xl text-muted-foreground">
            So better start ideation now
          </span>
        </div>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Brainstorm with AI, discuss challenges, and generate breakthrough ideas for 
          <span className="text-innovation font-semibold"> Supply Chain Management</span> and beyond.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-innovation hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
          >
            Submit Your Idea
          </Button>
          
          <BestIdeaDisplay />
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Join thousands of innovators</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Daily new ideas</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">Ideas Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-innovation mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Daily Visitors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-glow mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">AI Brainstorming</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHero;