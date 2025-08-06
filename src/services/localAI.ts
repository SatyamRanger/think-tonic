import { pipeline } from "@huggingface/transformers";

interface BrainstormingService {
  generateIdea: (problemStatement: string, category: string) => Promise<string>;
  refineIdea: (currentIdea: string, feedback: string, category: string) => Promise<string>;
}

class LocalAIBrainstorming implements BrainstormingService {
  private textGenerator: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("Initializing local AI model...");
      // Use a lightweight text generation model that can run in browser
      this.textGenerator = await pipeline(
        "text-generation",
        "onnx-community/Qwen2.5-0.5B-Instruct",
        { 
          device: "webgpu", // Falls back to CPU if WebGPU not available
          dtype: "fp16" // Use half precision for better performance
        }
      );
      this.isInitialized = true;
      console.log("Local AI model initialized successfully");
    } catch (error) {
      console.warn("WebGPU not available, falling back to WASM...");
      try {
        this.textGenerator = await pipeline(
          "text-generation",
          "onnx-community/Qwen2.5-0.5B-Instruct",
          { device: "wasm" }
        );
        this.isInitialized = true;
        console.log("Local AI model initialized on WASM");
      } catch (wasmError) {
        console.error("Failed to initialize AI model:", wasmError);
        throw new Error("Unable to initialize local AI model");
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

  async generateIdea(problemStatement: string, category: string): Promise<string> {
    if (!this.isInitialized || !this.textGenerator) {
      throw new Error("AI model not initialized");
    }

    const categoryContext = this.getCategoryContext(category);
    const prompt = `You are an innovation expert specializing in ${category}. ${categoryContext}

Problem Statement: ${problemStatement}

Generate a creative and practical solution idea that addresses this problem. Provide a clear, actionable idea with specific benefits and implementation approach.

Idea:`;

    try {
      const result = await this.textGenerator(prompt, {
        max_new_tokens: 200,
        temperature: 0.8,
        do_sample: true,
        top_p: 0.9,
        repetition_penalty: 1.1
      });

      const generatedText = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
      
      // Extract only the generated part after the prompt
      const ideaText = generatedText.split("Idea:")[1]?.trim() || generatedText;
      return ideaText.split("\n")[0] || ideaText; // Get first paragraph
    } catch (error) {
      console.error("Error generating idea:", error);
      throw new Error("Failed to generate idea");
    }
  }

  async refineIdea(currentIdea: string, feedback: string, category: string): Promise<string> {
    if (!this.isInitialized || !this.textGenerator) {
      throw new Error("AI model not initialized");
    }

    const categoryContext = this.getCategoryContext(category);
    const prompt = `You are an innovation expert specializing in ${category}. ${categoryContext}

Current Idea: ${currentIdea}

User Feedback: ${feedback}

Based on the feedback, refine and improve the idea. Make it more specific, practical, and aligned with the user's needs.

Refined Idea:`;

    try {
      const result = await this.textGenerator(prompt, {
        max_new_tokens: 200,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.9,
        repetition_penalty: 1.1
      });

      const generatedText = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
      const refinedText = generatedText.split("Refined Idea:")[1]?.trim() || generatedText;
      return refinedText.split("\n")[0] || refinedText;
    } catch (error) {
      console.error("Error refining idea:", error);
      throw new Error("Failed to refine idea");
    }
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