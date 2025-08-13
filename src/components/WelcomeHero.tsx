import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, Users, TrendingUp, FileText } from "lucide-react";
import heroImage from "@/assets/innovation-hero.jpg";
import BestIdeaDisplay from "./BestIdeaDisplay";
import { supabase } from "@/integrations/supabase/client";

interface WelcomeHeroProps {
  onGetStarted: () => void;
  onLearnSCM: () => void;
  onKnowledgeBase: () => void;
}

const WelcomeHero = ({ onGetStarted, onLearnSCM, onKnowledgeBase }: WelcomeHeroProps) => {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [articleCount, setArticleCount] = useState<number>(0);

  useEffect(() => {
    const incrementVisitorCount = async () => {
      try {
        const { data, error } = await supabase.rpc('increment_visitor_count');
        if (error) {
          console.error('Error incrementing visitor count:', error);
        } else {
          setVisitorCount(data || 0);
        }
      } catch (error) {
        console.error('Error calling increment_visitor_count:', error);
      }
    };

    const fetchArticleCount = async () => {
      try {
        const { count, error } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');
        
        if (error) {
          console.error('Error fetching article count:', error);
        } else {
          setArticleCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching article count:', error);
      }
    };

    incrementVisitorCount();
    fetchArticleCount();
  }, []);

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
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
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

        <div className="flex flex-col lg:flex-row gap-8 justify-center items-center mb-12">
          <div className="relative">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-innovation hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
            >
              Submit Your Idea
            </Button>
            {/* Animated motivational emoji */}
            <div className="absolute -top-2 -right-2 animate-bounce">
              <span className="text-2xl animate-pulse">💡</span>
            </div>
            <div className="absolute -top-1 -left-2 animate-ping">
              <span className="text-lg">✨</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Button 
                onClick={onLearnSCM}
                size="lg"
                variant="outline"
                className="px-6 py-4 text-lg font-semibold border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Brain className="w-5 h-5 mr-2" />
                Learn SCM
              </Button>
              <Badge variant="secondary" className="text-sm">
                <FileText className="w-3 h-3 mr-1" />
                {articleCount} articles
              </Badge>
            </div>
            
            <Button 
              onClick={onKnowledgeBase}
              size="lg"
              variant="secondary"
              className="px-6 py-4 text-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <FileText className="w-5 h-5 mr-2" />
              Knowledge Base
            </Button>
          </div>
          
          <BestIdeaDisplay />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">Ideas Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-innovation mb-2">{visitorCount}</div>
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