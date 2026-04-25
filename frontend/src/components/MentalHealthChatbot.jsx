import React, { useMemo, useState } from "react";
import { FaComments, FaPaperPlane, FaTimes } from "react-icons/fa";

const API_BASE = "http://localhost:3000";

export default function MentalHealthChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I am the MindBridge wellbeing assistant. How are you feeling today?",
    },
  ]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending,
    [input, isSending]
  );

  const sendMessage = async () => {
    const userText = input.trim();
    if (!userText || isSending) return;

    setError("");
    setIsSending(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);

    try {
      const res = await fetch(`${API_BASE}/api/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get chatbot response");
      }

      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setError(err.message || "Could not contact chatbot service");
    } finally {
      setIsSending(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="w-[350px] max-w-[90vw] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-3">
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">MindBridge AI Support</h3>
              <p className="text-xs text-blue-100">
                Mental wellbeing guidance
              </p>
            </div>
            <button
              type="button"
              className="text-white/90 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-[11px] text-amber-800">
            This chatbot is supportive guidance only, not emergency or medical care.
          </div>

          <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                {m.text}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-white border border-slate-200 text-slate-500">
                Thinking...
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
              {error}
            </div>
          )}

          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Type your message..."
                className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!canSend}
                className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition"
        aria-label="Open mental health chatbot"
      >
        <FaComments size={20} />
      </button>
    </div>
  );
}
