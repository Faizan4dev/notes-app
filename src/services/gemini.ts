const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export async function summarizeNote(text: string) {
  const modelName = "gemini-2.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
Summarize the following note.

Rules:
- Use exactly 3-5 key points
- Keep each point concise
- Do not use markdown
- Do not use **bold**
- Do not use headings like "Key Points"
- Start every point with "•"
- Put each point on a new line
- Do not add information not present in the note

Note:
${text}
                  `,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("API ERROR:", JSON.stringify(data, null, 2));
      return "Failed to generate summary.";
    }

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary generated."
    );
  } catch (error) {
    console.error("Service Error:", error);
    return "Failed to generate summary.";
  }
}
