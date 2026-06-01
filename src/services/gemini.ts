const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export async function summarizeNote(text: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
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
                        - Use 3-5 bullet points
                        - Keep each point short
                        - Focus on key information only
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

    console.log("STATUS:", response.status);
    // console.log("DATA:", data);

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary generated."
    );
  } catch (error) {
    console.error(error);
    return "Failed to generate summary.";
  }
}

console.log("ENV CHECK:", process.env);
// console.log("KEY:", process.env.EXPO_PUBLIC_GEMINI_API_KEY);
