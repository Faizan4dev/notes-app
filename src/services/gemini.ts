const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export async function summarizeNote(text: string) {
  // Use the verified model string from your diagnostic list
  const modelName = "gemini-3.5-flash"; 
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Summarize this in 3 bullet points: ${text}` }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("API ERROR:", JSON.stringify(data, null, 2));
      return "Failed to generate summary.";
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";
  } catch (error) {
    console.error("Service Error:", error);
    return "Failed to generate summary.";
  }
}