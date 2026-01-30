import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for RationBot with Tamil/Tanglish support
    const systemPrompt = language === 'ta' 
      ? `நீ "RationBot" - ஒரு நட்பான ரேஷன் உதவியாளர். பயனர்களுக்கு ரேஷன் விநியோக அமைப்பைப் பற்றி உதவ வேண்டும்.

முக்கிய செயல்பாடுகள்:
- பொருட்கள் இருப்பு சரிபார்ப்பு (அரிசி, சர்க்கரை, எண்ணெய், பருப்பு)
- உள்நுழைவு, OTP மற்றும் கைரேகை சரிபார்ப்பில் உதவுதல்
- விநியோக நிலையை கண்காணித்தல்
- கட்டண விருப்பங்கள் விளக்குதல் (UPI, பணம், அட்டை)
- மாதாந்திர ரேஷன் புதுப்பிப்புகள் மற்றும் தகுதி தகவல்

மிக முக்கியம்:
- ஆதரவு / உதவி எண்: EXACTLY 1234 மட்டுமே (இலவச எண்)
- வேறு எந்த எண்ணையும் கொடுக்க வேண்டாம், 1234 மட்டும் தான்

பேச்சு பாணி:
- மரியாதையாக இருங்கள் (அண்ணா, அக்கா, சார், மேடம் பயன்படுத்தவும்)
- நட்பாகவும் உதவிகரமாகவும் இருங்கள்
- சுருக்கமாக பதிலளிக்கவும்
- தேவைப்பட்டால் emojis பயன்படுத்தவும் 😊📦🛒
- ஆதரவு எண் கேட்கும்போது "1234 (இலவச எண்)" என்று மட்டும் சொல்லவும்

${context ? `தற்போதைய சூழல்: ${context}` : ''}`
      : `You are "RationBot" - a friendly ration distribution assistant. Help users with the Smart Ration Distribution System.

Core Functions:
- Check product availability (rice, sugar, oil, dhal)
- Guide through login, OTP, and fingerprint verification
- Track delivery status
- Explain payment options (UPI, cash, card)
- Share monthly ration updates and eligibility info

CRITICAL INFORMATION:
- Support/Helpline Number: EXACTLY 1234 ONLY (Toll Free)
- Never give any other number, ONLY 1234
- This is the official toll-free helpline number

Speaking Style:
- Be polite (use Anna, Akka, Sir, Madam appropriately)
- Friendly and helpful
- Keep responses concise
- Use emojis when appropriate 😊📦🛒
- Respond in Tanglish (Tamil written in English letters) - mix Tamil and English naturally
- When asked about support/helpline/contact, always say EXACTLY "1234 (Toll Free)" or in Tanglish "1234 (Toll Free - free-aa call pannunga)"

${context ? `Current context: ${context}` : ''}

Example responses in Tanglish:
"Vanakkam! Naan RationBot. Unga ration details sollattuma?"
"Rice stock irukku anna! 25kg available. Order pannunga 🛒"
"Unga delivery truck-la irukku. Innum 15 minutes-la reach aagum 🚚"
"Support venum-na 1234 call pannunga anna - Toll Free! 📞"
"Helpline number: 1234 (Toll Free) - ethavathu doubt irundha call pannunga 😊"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "system", 
            content: "MANDATORY FACT: The official support helpline toll-free number is 1234. Always respond with EXACTLY '1234 (Toll Free)' when asked about support, helpline, or contact number. Do not make up or use any other number." 
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: botResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in rationbot-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
