import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Specialized knowledge base for supply chain platforms
const supplyChainKnowledge = {
  "Blue Yonder": {
    description: "AI-driven supply chain solutions focusing on demand planning, inventory optimization, and autonomous supply chains",
    capabilities: ["Demand sensing", "Inventory optimization", "Supply planning", "Warehouse management", "Transportation optimization", "Price optimization"],
    features: ["Machine learning algorithms", "Real-time analytics", "Autonomous replenishment", "Multi-echelon inventory optimization"]
  },
  "Kinaxis": {
    description: "RapidResponse platform for concurrent supply chain planning with real-time visibility and scenario modeling",
    capabilities: ["Demand planning", "Supply planning", "S&OP", "Risk management", "Scenario modeling", "Real-time collaboration"],
    features: ["Concurrent planning", "What-if analysis", "Supply chain control tower", "Risk monitoring", "Multi-tier visibility"]
  },
  "Coupa": {
    description: "Business Spend Management platform covering procurement, invoicing, expenses, and supply chain collaboration",
    capabilities: ["Procurement", "Supplier management", "Contract management", "Invoice processing", "Expense management", "Supply chain collaboration"],
    features: ["AI-powered insights", "Supplier risk management", "Spend analytics", "Contract lifecycle management", "Community intelligence"]
  },
  "Manhattan": {
    description: "Supply chain commerce solutions for warehouse management, transportation, and omnichannel fulfillment",
    capabilities: ["Warehouse management", "Transportation management", "Distributed order management", "Labor management", "Yard management"],
    features: ["Real-time inventory tracking", "Advanced fulfillment", "Labor optimization", "Route optimization", "Multi-channel distribution"]
  },
  "Daily Hurdles": {
    description: "Common operational challenges in supply chain and business operations",
    areas: ["Process inefficiencies", "Communication gaps", "Resource constraints", "Technology limitations", "Compliance issues"]
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, category, context } = await req.json();

    // Get specialized knowledge for the category
    const categoryKnowledge = supplyChainKnowledge[category as keyof typeof supplyChainKnowledge];
    
    // Build specialized system prompt
    const systemPrompt = `You are a specialized AI assistant for supply chain management and innovation. You have deep expertise in the following platforms and areas:

${category && categoryKnowledge ? `
CURRENT FOCUS: ${category}
${JSON.stringify(categoryKnowledge, null, 2)}
` : ''}

SUPPLY CHAIN PLATFORMS EXPERTISE:
- Kinaxis RapidResponse: Concurrent planning, real-time visibility, scenario modeling, S&OP
- Blue Yonder: AI-driven demand planning, inventory optimization, autonomous supply chains
- Coupa: Business spend management, procurement, supplier management, contract management
- Manhattan: Warehouse management, transportation, omnichannel fulfillment, labor optimization

Your role is to:
1. Help users brainstorm innovative solutions for supply chain challenges
2. Provide specific insights related to the selected platform/category
3. Suggest practical implementation approaches
4. Consider integration possibilities between different platforms
5. Focus on real-world business value and ROI

Be specific, actionable, and innovative in your responses. Consider both technical and business perspectives.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context || []),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      category: category 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in supply-chain-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate AI response' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});