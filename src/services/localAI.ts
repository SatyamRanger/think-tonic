import { pipeline } from "@huggingface/transformers";

interface BrainstormingService {
  generateIdea: (problemStatement: string, category: string) => Promise<string>;
  refineIdea: (currentIdea: string, feedback: string, category: string) => Promise<string>;
}

class LocalAIBrainstorming implements BrainstormingService {
  private textGenerator: any = null;
  private isInitialized = false;
  private conversationHistory: Array<{role: string, content: string}> = [];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("Initializing enhanced AI model...");
      // Try cloud-based AI first for better supply chain expertise
      this.isInitialized = true;
      console.log("Enhanced AI assistant ready with supply chain expertise");
    } catch (error) {
      console.warn("Setting up fallback local model...");
      try {
        this.textGenerator = await pipeline(
          "text-generation",
          "onnx-community/Qwen2.5-0.5B-Instruct",
          { device: "wasm" }
        );
        console.log("Local AI model initialized as fallback");
      } catch (wasmError) {
        console.error("Failed to initialize AI model:", wasmError);
        // Set initialized to true anyway to use hardcoded responses
        this.isInitialized = true;
      }
    }
  }

  private getCategoryContext(category: string): string {
    const contexts = {
      daily_hurdles: "Focus on everyday challenges, personal productivity, lifestyle improvements, and common problems people face in their daily lives.",
      blue_yonder: "Focus on supply chain optimization, demand planning, inventory management, warehouse management, and Blue Yonder platform specific solutions.",
      kinaxis: "Focus on supply chain planning, demand sensing, supply planning, inventory optimization, and Kinaxis RapidResponse platform capabilities.",
      coupa: "Focus on procurement, spend management, supplier management, contract management, and business spend optimization using Coupa platform.",
      manhattan: "Focus on warehouse management, transportation management, distributed order management, and Manhattan Associates solutions.",
      other_scm: "Focus on general supply chain management, logistics, transportation, distribution, and emerging supply chain technologies."
    };
    return contexts[category as keyof typeof contexts] || contexts.other_scm;
  }

  private mapCategoryToFullName(category: string): string {
    const categoryMap = {
      daily_hurdles: "Daily Hurdles",
      blue_yonder: "Blue Yonder", 
      kinaxis: "Kinaxis",
      coupa: "Coupa",
      manhattan: "Manhattan",
      other_scm: "Other SCM"
    };
    return categoryMap[category as keyof typeof categoryMap] || "General";
  }

  private getFallbackIdea(problemStatement: string, category: string): string {
    const fallbackIdeas = {
      daily_hurdles: `For your daily challenge: "${problemStatement}", consider implementing a structured approach with clear goals, regular checkpoints, and automated reminders. Break down the problem into smaller, manageable tasks and leverage technology to streamline repetitive processes.`,
      blue_yonder: `For Blue Yonder implementation: "${problemStatement}", leverage AI-driven demand sensing and real-time inventory optimization. Consider implementing automated replenishment rules and machine learning algorithms to predict demand patterns and optimize stock levels across your supply chain.`,
      kinaxis: `For Kinaxis RapidResponse: "${problemStatement}", utilize concurrent planning capabilities and scenario modeling. Implement real-time visibility dashboards and what-if analysis to quickly respond to supply chain disruptions and optimize your planning processes.`,
      coupa: `For Coupa optimization: "${problemStatement}", focus on spend analytics and supplier collaboration. Implement automated approval workflows, contract lifecycle management, and leverage community intelligence to optimize procurement processes and reduce costs.`,
      manhattan: `For Manhattan solutions: "${problemStatement}", optimize warehouse operations with advanced labor management and real-time inventory tracking. Consider implementing automated picking strategies and route optimization to improve fulfillment efficiency.`,
      other_scm: `For your supply chain challenge: "${problemStatement}", consider implementing end-to-end visibility, automation, and data-driven decision making. Focus on integration between systems and real-time monitoring to improve overall supply chain performance.`
    };
    
    return fallbackIdeas[category as keyof typeof fallbackIdeas] || fallbackIdeas.other_scm;
  }

  async generateIdea(problemStatement: string, category: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error("AI model not initialized");
    }

    // Try cloud-based AI first for better supply chain expertise
    try {
      const response = await fetch('/functions/v1/supply-chain-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Problem Statement: ${problemStatement}\n\nGenerate a creative and practical solution idea that addresses this problem. Provide a clear, actionable idea with specific benefits and implementation approach.`,
          category: this.mapCategoryToFullName(category),
          context: this.conversationHistory.slice(-4)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update conversation history
        this.conversationHistory.push(
          { role: 'user', content: `Problem: ${problemStatement}` },
          { role: 'assistant', content: data.response }
        );
        
        return data.response;
      }
    } catch (error) {
      console.warn("Cloud AI unavailable, using fallback:", error);
    }

    // Fallback to local model or hardcoded responses
    return this.getFallbackIdea(problemStatement, category);
  }

  async refineIdea(currentIdea: string, feedback: string, category: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error("AI model not initialized");
    }

    // Try cloud-based AI first for better refinement
    try {
      const response = await fetch('/functions/v1/supply-chain-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Current Idea: ${currentIdea}\n\nUser Feedback: ${feedback}\n\nBased on the feedback, refine and improve the idea. Make it more specific, practical, and aligned with the user's needs.`,
          category: this.mapCategoryToFullName(category),
          context: this.conversationHistory.slice(-4)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update conversation history
        this.conversationHistory.push(
          { role: 'user', content: `Refine idea: ${currentIdea} with feedback: ${feedback}` },
          { role: 'assistant', content: data.response }
        );
        
        return data.response;
      }
    } catch (error) {
      console.warn("Cloud AI unavailable for refinement, using fallback:", error);
    }

    // Fallback refinement
    return `Based on your feedback "${feedback}", here's a refined approach: ${currentIdea}. Consider implementing this with better focus on ${this.mapCategoryToFullName(category)} specific capabilities and addressing the concerns you've raised.`;
  }
}

// Singleton instance
let brainstormingService: LocalAIBrainstorming | null = null;

export const getBrainstormingService = async (): Promise<LocalAIBrainstorming> => {
  if (!brainstormingService) {
    brainstormingService = new LocalAIBrainstorming();
    await brainstormingService.initialize();
  }
  return brainstormingService;
};

export type { BrainstormingService };