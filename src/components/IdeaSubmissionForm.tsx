import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, Users, Building2, Truck, Package, Settings, Brain } from "lucide-react";

interface IdeaSubmissionFormProps {
  onClose: () => void;
  onBrainstorm: (category: string, categoryLabel: string) => void;
}

const categories = [
  { value: "daily_hurdles", label: "Daily Hurdles", icon: Users, description: "Everyday challenges and improvements" },
  { value: "blue_yonder", label: "Blue Yonder", icon: Building2, description: "Supply chain optimization platform" },
  { value: "kinaxis", label: "Kinaxis", icon: Truck, description: "Supply chain planning solutions" },
  { value: "coupa", label: "Coupa", icon: Package, description: "Business spend management" },
  { value: "manhattan", label: "Manhattan", icon: Settings, description: "Supply chain commerce solutions" },
  { value: "other_scm", label: "Other SCM", icon: Lightbulb, description: "Other supply chain technologies" },
];

const IdeaSubmissionForm = ({ onClose, onBrainstorm }: IdeaSubmissionFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    description: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, create or get user
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", formData.email)
        .single();

      let userId;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .insert({ name: formData.name, email: formData.email })
          .select("id")
          .single();

        if (createUserError) throw createUserError;
        userId = newUser.id;
      }

      // Create the idea
      const { error: ideaError } = await supabase
        .from("ideas")
        .insert({
          user_id: userId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
        });

      if (ideaError) throw ideaError;

      // Increment analytics
      const { error: analyticsError } = await supabase.rpc("increment_idea_count", {
        idea_category: formData.category,
      });

      if (analyticsError) console.warn("Analytics update failed:", analyticsError);

      toast({
        title: "Idea Submitted Successfully!",
        description: "Your idea has been submitted and a confirmation email will be sent shortly.",
      });

      onClose();
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Submit Your Innovation Idea</CardTitle>
          <CardDescription className="text-center">
            Share your breakthrough ideas and connect with the innovation community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Idea Information */}
            <div className="space-y-2">
              <Label htmlFor="title">Idea Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Give your idea a compelling title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Idea Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
                rows={4}
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <Label>Category *</Label>
              <Tabs value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 h-auto">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.value}
                      value={category.value}
                      className="flex flex-col items-center gap-2 p-4 h-auto"
                    >
                      <category.icon className="w-5 h-5" />
                      <span className="text-xs">{category.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map((category) => (
                  <TabsContent key={category.value} value={category.value} className="mt-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-2">
                          <category.icon className="w-6 h-6 text-primary" />
                          <h3 className="font-semibold">{category.label}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {formData.category && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const selectedCategory = categories.find(c => c.value === formData.category);
                    onBrainstorm(formData.category, selectedCategory?.label || "Unknown");
                  }}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Brainstorm with AI
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-innovation"
                disabled={isSubmitting || !formData.category}
              >
                {isSubmitting ? "Submitting..." : "Submit Idea"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdeaSubmissionForm;