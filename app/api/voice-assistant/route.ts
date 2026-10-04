import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, weddingContext } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemInstruction = `You are "Shaadi Squad Radio AI", the live operational voice dispatcher and coordinator for the Indian wedding operations team.
Wedding Context:
- Active Event: ${weddingContext?.name || 'Sharma Wedding'} (Couple: ${weddingContext?.coupleName || 'Pooja & Rahul'})
- Active Day: Day ${weddingContext?.dayNumber || 2} (${weddingContext?.date || 'Today'})
- Current User: ${weddingContext?.currentUserName || 'Team Member'} (${weddingContext?.currentUserRole || 'Member'})
- Total Active Tasks: ${weddingContext?.totalTasks || 5}
- Pending Tasks: ${weddingContext?.pendingTasks || 2}

Guidelines:
- Keep answers ultra-concise, operational, and punchy (1 to 2 short sentences max) like a real walkie-talkie radio dispatcher.
- Speak in natural Hindi/English (Hinglish) tone suitable for an Indian wedding squad (e.g. "Roger that! Baraat is arriving at Gate 2 in 10 minutes", "Check with Rahul on Stage Sound right away").
- Be reassuring, decisive, crisp, and helpful.`;

    let replyText = '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });
      replyText = response.text?.trim() || '';
    } catch (genErr) {
      console.warn('Gemini text generation fallback:', genErr);
      replyText = 'Roger that! Operational dispatch received. Continue as scheduled or coordinate on squad radio.';
    }

    if (!replyText) {
      replyText = 'Roger that! Standing by for your next update on wedding channel.';
    }

    // Generate spoken audio voice for the response using gemini-3.8-flash-lite-tts
    let audioData: string | null = null;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: replyText }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr) {
      console.warn('TTS generation fallback:', ttsErr);
    }

    return NextResponse.json({
      text: replyText,
      audioBase64: audioData,
    });
  } catch (error: unknown) {
    console.error('Voice Assistant API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Voice conversation failed' },
      { status: 500 }
    );
  }
}

