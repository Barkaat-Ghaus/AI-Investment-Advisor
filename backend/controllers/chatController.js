import dotenv from "dotenv";
dotenv.config();

export const chatWithAI = async (req, res, next) => {
  const { message, messages } = req.body;

  if (!message && (!messages || !Array.isArray(messages))) {
    const error = new Error("Message or messages array is required");
    error.statusCode = 400;
    return next(error);
  }

  const finalMessages = messages || [{ role: "user", content: message }];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "ShatApp"
      },
      body: JSON.stringify({
     model: "openrouter/auto",
        messages: finalMessages
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter request failed: ${text}`);
    }

    const data = await response.json();

    const responseMessage = data?.choices?.[0]?.message;
    const answer = responseMessage?.content || "No response found.";

    res.status(200).json({
      success: true,
      answer,
      fullMessage: responseMessage
    });

  } catch (error) {
    console.error("Failed to fetch from OpenRouter:", error);
    next(new Error("Failed to fetch response from AI"));
  }
};