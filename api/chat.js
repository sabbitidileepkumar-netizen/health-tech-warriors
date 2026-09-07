export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "GEMINI_API_KEY is not configured in Vercel."
      });
    }

    const {
      message,
      language = "en",
      history = []
    } = req.body || {};

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        error: "Please enter a health question."
      });
    }

    const languageNames = {
      en: "English",
      te: "Telugu",
      hi: "Hindi",
      mr: "Marathi"
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
                text: item.text.slice(0, 2000)
              }
            ]
          }))
      : [];

    const systemInstruction = `
You are CareLink AI, a patient health guidance assistant
for a healthcare application in India.

Your job is to provide clear, calm, simple and safe
general health information.

IMPORTANT SAFETY RULES:

1. You are NOT a doctor and must not claim to diagnose
   a disease or confirm a diagnosis.

2. Do not prescribe prescription medicines.

3. Do not give dangerous instructions or recommend
   risky home procedures.

4. If the user's symptoms could represent an emergency,
   clearly tell them to seek urgent medical attention.

5. Never tell a person to ignore severe symptoms.

6. Explain warning signs clearly.

7. Use simple language that ordinary patients can understand.

8. When important information is missing, ask a small
   number of useful follow-up questions.

9. Do not invent hospital names, doctors, phone numbers,
   addresses, test results or medical records.

10. If the user asks something unrelated to health,
    politely explain that CareLink is designed primarily
    for health guidance.

11. Always respond in ${selectedLanguage}.

12. Use short sections, bullet points and helpful symbols
    where appropriate.

Return ONLY valid JSON matching the requested schema.
`;

    const contents = [
      ...safeHistory,
      {
        role: "user",
        parts: [
          {
            text: message.trim().slice(0, 5000)
          }
        ]
      }
    ];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: systemInstruction
              }
            ]
          },

          contents,

          generationConfig: {
            temperature: 0.2,

            responseMimeType:
              "application/json",

            responseSchema: {
              type: "object",

              properties: {
                language: {
                  type: "string"
                },

                title: {
                  type: "string"
                },

                summary: {
                  type: "string"
                },

                urgency: {
                  type: "string",
                  enum: [
                    "emergency",
                    "urgent",
                    "routine",
                    "self_care"
                  ]
                },

                emergencyMessage: {
                  type: "string"
                },

                steps: {
                  type: "array",
                  items: {
                    type: "object",

                    properties: {
                      icon: {
                        type: "string"
                      },

                      title: {
                        type: "string"
                      },

                      description: {
                        type: "string"
                      }
                    },

                    required: [
                      "icon",
                      "title",
                      "description"
                    ]
                  }
                },

                precautions: {
                  type: "array",

                  items: {
                    type: "string"
                  }
                },

                redFlags: {
                  type: "array",

                  items: {
                    type: "string"
                  }
                },

                whenToSeekCare: {
                  type: "string"
                },

                followUpQuestions: {
                  type: "array",

                  items: {
                    type: "string"
                  }
                },

                disclaimer: {
                  type: "string"
                }
              },

              required: [
                "language",
                "title",
                "summary",
                "urgency",
                "emergencyMessage",
                "steps",
                "precautions",
                "redFlags",
                "whenToSeekCare",
                "followUpQuestions",
                "disclaimer"
              ]
            }
          }
        })
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
          "Gemini API request failed."
      });
    }

    const rawText =
      result?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!rawText) {
      return res.status(502).json({
        error:
          "The AI returned an empty response."
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      console.error(
        "JSON parsing error:",
        rawText
      );

      return res.status(502).json({
        error:
          "The AI returned an invalid response."
      });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(
      "CareLink server error:",
      error
    );

    return res.status(500).json({
      error:
        "Unable to connect to the AI service."
    });
  }
}
