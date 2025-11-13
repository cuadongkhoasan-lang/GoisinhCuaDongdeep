import { HOSPITAL_DATA } from "../data";
import { SYSTEM_PROMPT } from "../constants";

// ⚠️ Dán API KEY của DeepSeek vào đây ↓
// Ví dụ: const API_KEY = "sk-xxxx";
const API_KEY = "sk-13b6c7aac96e480f968b1fd63f398eb0";

if (!API_KEY) {
  throw new Error("API_KEY is not set. Please add your DeepSeek API key.");
}

// ======================================================
// Tạo system prompt hoàn chỉnh (như bản Gemini)
// ======================================================
const fullSystemPrompt = `${SYSTEM_PROMPT}\n\nDATA:\n${JSON.stringify(
  HOSPITAL_DATA,
  null,
  2
)}`;

// ======================================================
// Hàm tạo session chat DeepSeek
// (DeepSeek API không có "session" như Gemini, nên ta tự mô phỏng)
// ======================================================

export interface ChatSession {
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>;
}

export const createChatSession = (): ChatSession => {
  return {
    history: [
      {
        role: "system",
        content: fullSystemPrompt,
      },
    ],
  };
};

// ======================================================
// Gửi tin nhắn cho DeepSeek
// ======================================================

export const sendMessageToChat = async (
  chat: ChatSession,
  userQuery: string
): Promise<string> => {
  try {
    // Lưu message vào history
    chat.history.push({ role: "user", content: userQuery });

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat", // Hoặc deepseek-reasoner tuỳ bạn
        messages: chat.history,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error("DeepSeek API error:", await response.text());
      return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || "";

    // Lưu lại câu trả lời vào history
    chat.history.push({ role: "assistant", content: answer });

    return answer;
  } catch (error) {
    console.error("Error calling DeepSeek API:", error);
    return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
  }
};
