
import { GoogleGenAI, Type } from "@google/genai";
import { ImageAnalysisResult, ChatResponse, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const imageAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        description_de: { type: Type.STRING, description: "Kurze Beschreibung des Bildes auf Deutsch (1-2 Sätze)." },
        description_es: { type: Type.STRING, description: "Detaillierte Beschreibung auf Spanisch (3-5 Sätze, A2-B1 Niveau)." },
        vocab: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    es: { type: Type.STRING },
                    de: { type: Type.STRING }
                },
                required: ["es", "de"]
            },
            description: "Liste von 5-10 relevanten Vokabeln (Spanisch -> Deutsch)."
        },
        quiz: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "Quizfrage auf Spanisch." },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correct: { type: Type.STRING, description: "Die korrekte Antwort." }
                },
                required: ["question", "options", "correct"]
            },
            description: "3 Multiple-Choice-Quizfragen auf Spanisch."
        },
        labels: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Relevante Tags/Labels für das Foto."
        }
    },
    required: ["description_de", "description_es", "vocab", "quiz", "labels"]
};

const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        reply: { type: Type.STRING, description: "Die textliche Antwort an den Benutzer." },
        suggested_flashcards: {
            type: Type.ARRAY,
            description: "Optionale Liste von 2-3 Vokabeln als Lernkarten.",
            items: {
                type: Type.OBJECT,
                properties: {
                    es: { type: Type.STRING },
                    de: { type: Type.STRING }
                },
                required: ["es", "de"]
            }
        }
    },
    required: ["reply"]
};

export const analyzeImage = async (imageDataBase64: string, mimeType: string, location: string): Promise<ImageAnalysisResult> => {
    const prompt = `Du bist ein KI-Assistent für eine mobile Reisetagebuch-App. Dein Ziel ist es, Benutzern beim Spanischlernen zu helfen, während sie ihre Reisen dokumentieren. Ein Benutzer hat ein Bild von seiner Reise hochgeladen und einen Ort angegeben.

Ort: ${location}

Analysiere das Bild und den Ort und gib ein JSON-Objekt zurück, das der angegebenen Struktur entspricht. Der spanische Inhalt sollte auf dem Niveau A2-B1 sein. Sei freundlich, motivierend und praxisnah.`;

    const imagePart = {
        inlineData: {
            data: imageDataBase64,
            mimeType: mimeType
        }
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: imageAnalysisSchema
        }
    });

    const jsonString = response.text;
    return JSON.parse(jsonString) as ImageAnalysisResult;
};

export const getChatReply = async (history: ChatMessage[]): Promise<ChatResponse> => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `Du bist ein freundlicher und motivierender KI-Spanischlehrer für eine Reisetagebuch-App. Dein Benutzer ist ein Anfänger bis Fortgeschrittener (A2-B1 Niveau). Dein Hauptziel ist es, ihm zu helfen, Konversationen auf Spanisch zum Thema Reisen zu üben.
- Halte deine Antworten in einfachem, klarem und alltagsnahem Spanisch.
- Wenn der Benutzer einen Fehler macht, korrigiere ihn sanft und erkläre die Grammatik auf einfache, nicht überfordernde Weise mit Beispielen.
- Sei ermutigend und positiv.
- Wenn der Benutzer nach Übersetzungen oder Vokabeln fragt, gib sie ihm.
- Du musst immer im JSON-Format mit dem folgenden Schema antworten: { "reply": string, "suggested_flashcards": [{ "es": string, "de": string }] | undefined }. Das Feld 'reply' ist deine Textantwort an den Benutzer. 'suggested_flashcards' ist eine optionale Liste von 2-3 Vokabeln aus deiner Antwort, die für den Benutzer nützlich sein könnten.`,
            responseMimeType: 'application/json',
            responseSchema: chatResponseSchema
        },
        history: history.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: msg.parts
        }))
    });

    const lastMessage = history[history.length - 1];
    const result = await chat.sendMessage({ message: lastMessage.parts[0].text });

    const jsonString = result.text;
    return JSON.parse(jsonString) as ChatResponse;
};
