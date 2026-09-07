export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing in Vercel.",
      });
    }

    const {
      message,
      language = "en",
      history = [],
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please enter a health question.",
      });
    }

    const languageNames = {
      en: "English",
      te: "Telugu",
      hi: "Hindi",
      mr: "Marathi",
    };

    const selectedLanguage =
      languageNames[language] || "English";

    const safeHistory = Array.isArray(history)
      ? history
          .slice(-10)
          .filter(
            (item) =>
              item &&
              typeof item.text === "string"
          )
          .map((item) => ({
            role:
              item.role === "model"
                ? "model"
                : "user",
            parts: [
              {
                text: item.text.slice(0, 2000),
              },
            ],
          }))
      : [];

    const systemInstruction = `
You are CareLink AI, a safe patient health guidance assistant
for people in India.

IMPORTANT:

- You are NOT a doctor.
- Do not diagnose diseases.
- Do not prescribe prescription medicines.
- Give general educational health information.
- Do not give dangerous or risky instructions.
- If the question suggests an emergency, clearly tell the
  person to seek urgent medical attention.
- Do not invent hospitals, doctors, phone numbers,
  addresses or medical records.
- Use simple language.
- Always answer in ${selectedLanguage}.
- Use helpful symbols/emojis where appropriate.
- Ask useful follow-up questions when important information
  is missing.

Return ONLY a valid JSON object.

The JSON MUST have exactly these fields:

{
  "language": "string",
  "title": "string",
  "summary": "string",
  "urgency": "emergency | urgent | routine | self_care",
  "emergencyMessage": "string",
  "steps": [
    {
      "icon": "string",
      "title": "string",
      "description": "string"
    }
  ],
  "precautions": ["string"],
  "redFlags": ["string"],
  "whenToSeekCare": "string",
  "followUpQuestions": ["string"],
  "disclaimer": "string"
}

Do not put markdown fences around the JSON.
Do not write anything before or after the JSON.
`;

    const contents = [
      ...safeHistory,
      {
        role: "user",
        parts: [
          {
            text: `${systemInstruction}

Patient's question:
${message.trim().slice(0, 5000)}`,
          },
        ],
      },
    ];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          contents,

          generationConfig: {
            temperature: 0.2,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "Gemini API error:",
        JSON.stringify(result)
      );

      return res.status(response.status).json({
        error:
          result?.error?.message ||
          "Gemini API request failed.",
      });
    }

    const rawText =
      result?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!rawText) {
      console.error(
        "Empty Gemini response:",
        JSON.stringify(result)
      );

      return res.status(502).json({
        error: "Gemini returned an empty response.",
      });
    }

    let cleanText = rawText;

    // Remove markdown code fences if Gemini adds them.
    cleanText = cleanText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleanText);
    } catch (error) {
      console.error(
        "Gemini returned invalid JSON:",
        cleanText
      );

      /*
       * Fallback response.
       * This prevents the frontend from crashing if Gemini
       * accidentally returns plain text instead of JSON.
       */
      parsed = {
        language: selectedLanguage,
        title: "CareLink AI",
        summary: cleanText,
        urgency: "routine",
        emergencyMessage: "",
        steps: [],
        precautions: [],
        redFlags: [],
        whenToSeekCare:
          "If symptoms are severe, worsening, or concerning, seek medical attention.",
        followUpQuestions: [],
        disclaimer:
          "CareLink AI provides general health information and is not a substitute for a doctor.",
      };
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(
      "CareLink server error:",
      error
    );

    return res.status(500).json({
      error:
        "Unable to connect to the AI service.",
    });
  }
}
