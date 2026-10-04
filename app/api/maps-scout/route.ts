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
    const { query, latitude = 28.5360, longitude = 77.3915 } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const prompt = `You are the local logistics coordinator for a wedding in this city. A member of the wedding team needs urgent local help for: "${query}".
Use Google Maps data to find the most accurate, real, and currently open local vendors, stores, or places nearby.
Provide a clear, brief 2-3 bullet answer with exact store names, what they provide, and operational tips (e.g. cash, emergency turnaround time).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: Number(latitude) || 28.5360,
              longitude: Number(longitude) || 77.3915,
            },
          },
        },
      },
    });

    const text = response.text || '';
    
    // Extract Maps grounding links and review snippets as required by the Maps Grounding skill
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    interface GroundedPlace {
      title: string;
      uri: string;
      snippet?: string;
    }

    const places: GroundedPlace[] = [];

    for (const chunk of groundingChunks) {
      if (chunk.maps) {
        const rawSnippet = chunk.maps.placeAnswerSources?.reviewSnippets?.[0] as unknown;
        let snippetText: string | undefined = undefined;
        if (typeof rawSnippet === 'string') {
          snippetText = rawSnippet;
        } else if (rawSnippet && typeof rawSnippet === 'object' && 'snippet' in rawSnippet) {
          snippetText = String((rawSnippet as { snippet?: unknown }).snippet || '');
        }

        places.push({
          title: chunk.maps.title || 'Location on Google Maps',
          uri: chunk.maps.uri || '',
          snippet: snippetText,
        });
      }
    }

    return NextResponse.json({
      text,
      places,
      groundingChunks,
    });
  } catch (error: unknown) {
    console.error('Maps Scout API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to query Google Maps data' },
      { status: 500 }
    );
  }
}
