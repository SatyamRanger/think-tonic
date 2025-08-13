import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, FileText, Download, Search, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  article_type: string;
  votes: number;
  created_at: string;
  user_id: string;
}

interface KnowledgeBaseProps {
  onBack: () => void;
}

const KnowledgeBase = ({ onBack }: KnowledgeBaseProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const { toast } = useToast();

  const categories = [
    { value: 'general', label: 'General SCM' },
    { value: 'technology', label: 'Technology' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'inventory', label: 'Inventory Management' },
    { value: 'sustainability', label: 'Sustainability' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch articles
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (articlesError) throw articlesError;

      // Fetch ideas to include in knowledge base
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (ideasError) throw ideasError;

      setArticles(articlesData || []);
      setIdeas(ideasData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitArticle = async () => {
    if (!newArticle.title.trim() || !newArticle.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('articles')
        .insert({
          title: newArticle.title,
          content: newArticle.content,
          category: newArticle.category,
          article_type: 'user_submitted',
          user_id: crypto.randomUUID() // In a real app, this would be the authenticated user ID
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article submitted successfully!",
      });

      setIsDialogOpen(false);
      setNewArticle({ title: '', content: '', category: 'general' });
      fetchData();
    } catch (error) {
      console.error('Error submitting article:', error);
      toast({
        title: "Error",
        description: "Failed to submit article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    const allData = [
      ...articles.map(article => ({
        Type: 'Article',
        Title: article.title,
        Content: article.content.substring(0, 100) + '...',
        Category: article.category,
        Votes: article.votes,
        Author: 'Anonymous',
        Date: new Date(article.created_at).toLocaleDateString()
      })),
      ...ideas.map(idea => ({
        Type: 'Idea',
        Title: idea.title,
        Content: idea.description.substring(0, 100) + '...',
        Category: idea.category,
        Votes: idea.votes,
        Author: 'Anonymous',
        Date: new Date(idea.created_at).toLocaleDateString()
      }))
    ];

    const csvContent = [
      Object.keys(allData[0]).join(','),
      ...allData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge_base_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Knowledge base exported to CSV file.",
    });
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-innovation bg-clip-text text-transparent">
              SCM Knowledge Base
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportToExcel} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit New Article</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newArticle.title}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter article title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newArticle.category}
                      onValueChange={(value) => setNewArticle(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newArticle.content}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your article content..."
                      rows={10}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitArticle}>
                      Submit Article
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search articles and ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="articles">Knowledge Articles ({filteredArticles.length})</TabsTrigger>
            <TabsTrigger value="ideas">Submitted Ideas ({filteredIdeas.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="articles" className="space-y-4">
            {filteredArticles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{article.category}</Badge>
                        <Badge variant="outline">{article.article_type.replace('_', ' ')}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{article.votes}</span>
                        </div>
                      </div>
                    </div>
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {article.content.substring(0, 200)}...
                  </p>
                  <div className="text-xs text-muted-foreground">
                    By Anonymous • {new Date(article.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="ideas" className="space-y-4">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{idea.category}</Badge>
                        <Badge variant="outline">{idea.status}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{idea.votes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {idea.description.substring(0, 200)}...
                  </p>
                  <div className="text-xs text-muted-foreground">
                    By Anonymous • {new Date(idea.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KnowledgeBase;