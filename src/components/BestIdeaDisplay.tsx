import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Calendar, User, ThumbsUp, Mail, Share } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BestIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  votes: number;
  created_at: string;
  users: {
    name: string;
    email: string;
  } | null;
}

const BestIdeaDisplay = () => {
  const [bestIdea, setBestIdea] = useState<BestIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchBestIdea = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select(`
          id,
          title,
          description,
          category,
          votes,
          created_at,
          users (
            name,
            email
          )
        `)
        .order("votes", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching best idea:", error);
        toast({
          title: "Error",
          description: "Failed to fetch the best idea. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        toast({
          title: "No Ideas Found",
          description: "No ideas have been submitted yet. Be the first to share your innovation!",
        });
        return;
      }

      setBestIdea(data);
      setIsOpen(true);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      "blue_yonder": "🔷",
      "kinaxis": "⚡",
      "coupa": "💼", 
      "manhattan": "🏢",
      "daily_hurdles": "🎯",
      "other_scm": "🔗"
    };
    return icons[category as keyof typeof icons] || "💡";
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      "blue_yonder": "Blue Yonder",
      "kinaxis": "Kinaxis",
      "coupa": "Coupa",
      "manhattan": "Manhattan",
      "daily_hurdles": "Daily Hurdles",
      "other_scm": "Other SCM"
    };
    return labels[category as keyof typeof labels] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const shareIdeaByEmail = (idea: BestIdea) => {
    const subject = encodeURIComponent(`Check out this innovative idea: ${idea.title}`);
    const body = encodeURIComponent(
      `I thought you'd be interested in this idea:\n\n` +
      `Title: ${idea.title}\n` +
      `Category: ${getCategoryLabel(idea.category)}\n` +
      `Description: ${idea.description}\n` +
      `Votes: ${idea.votes}\n` +
      `Submitted by: ${idea.users?.name || 'Anonymous'}\n\n` +
      `This idea was shared from our innovation platform!`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Email Sharing",
      description: "Email client opened with the idea details.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={fetchBestIdea}
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <Trophy className="w-4 h-4 mr-2" />
          {isLoading ? "Loading..." : "Show Best Idea"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Star className="w-6 h-6 text-yellow-500" />
            Top Voted Idea
          </DialogTitle>
        </DialogHeader>
        
        {bestIdea && (
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(bestIdea.category)}</span>
                    {bestIdea.title}
                  </CardTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(bestIdea.category)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span className="font-medium">{bestIdea.votes} votes</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description:</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {bestIdea.description}
                </p>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <div className="space-y-2">
                  {bestIdea.users && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Submitted by: {bestIdea.users.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(bestIdea.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={() => shareIdeaByEmail(bestIdea)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Share by Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BestIdeaDisplay;