import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, User, Lightbulb, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBrainstormingService } from "@/services/localAI";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AIBrainstormingProps {
  category: string;
  categoryLabel: string;
  onBack: () => void;
  onSaveIdea: (idea: string) => void;
}

const categoryDescriptions = {
  daily_hurdles: "Everyday challenges and lifestyle improvements",
  blue_yonder: "Blue Yonder supply chain optimization",
  kinaxis: "Kinaxis supply chain planning solutions",
  coupa: "Coupa business spend management",
  manhattan: "Manhattan supply chain commerce",
  other_scm: "General supply chain management"
};

const AIBrainstorming = ({ category, categoryLabel, onBack, onSaveIdea }: AIBrainstormingProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentIdea, setCurrentIdea] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeAI();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeAI = async () => {
    try {
      await getBrainstormingService();
      setIsInitializing(false);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: `Hello! I'm your local AI brainstorming assistant for ${categoryLabel}. ${categoryDescriptions[category as keyof typeof categoryDescriptions]}. 

Tell me about the problem or challenge you're facing, and I'll help you generate innovative solutions!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Failed to initialize AI:", error);
      toast({
        title: "AI Initialization Failed",
        description: "Unable to start the local AI assistant. Please try again.",
        variant: "destructive"
      });
      setIsInitializing(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const brainstormingService = await getBrainstormingService();
      let aiResponse: string;

      if (currentIdea) {
        // If we have a current idea, refine it based on user feedback
        aiResponse = await brainstormingService.refineIdea(currentIdea, userMessage.content, category);
      } else {
        // Generate new idea based on problem statement
        aiResponse = await brainstormingService.generateIdea(userMessage.content, category);
      }

      setCurrentIdea(aiResponse);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        title: "AI Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Initializing Local AI</h3>
            <p className="text-muted-foreground mb-4">
              Loading the AI model for {categoryLabel}...
            </p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">This may take a moment</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">AI Brainstorming</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{categoryLabel}</Badge>
                <span className="text-sm text-muted-foreground">Local AI Assistant</span>
              </div>
            </div>
          </div>
          {currentIdea && (
            <Button
              onClick={() => onSaveIdea(currentIdea)}
              className="ml-auto bg-gradient-to-r from-primary to-innovation"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Save Idea
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-innovation text-innovation-foreground"
                  }`}>
                    {message.type === "user" ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                  </div>
                  <Card className={`${message.type === "user" ? "bg-primary/10" : "bg-innovation/10"}`}>
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-innovation text-innovation-foreground flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <Card className="bg-innovation/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentIdea ? "Share feedback to refine the idea..." : "Describe your problem or challenge..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="max-w-4xl mx-auto mt-2">
          <p className="text-xs text-muted-foreground text-center">
            {currentIdea 
              ? "Provide feedback to refine your idea, or save it when you're happy with the result."
              : "Describe your challenge in detail. The more context you provide, the better the AI can help generate solutions."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIBrainstorming;