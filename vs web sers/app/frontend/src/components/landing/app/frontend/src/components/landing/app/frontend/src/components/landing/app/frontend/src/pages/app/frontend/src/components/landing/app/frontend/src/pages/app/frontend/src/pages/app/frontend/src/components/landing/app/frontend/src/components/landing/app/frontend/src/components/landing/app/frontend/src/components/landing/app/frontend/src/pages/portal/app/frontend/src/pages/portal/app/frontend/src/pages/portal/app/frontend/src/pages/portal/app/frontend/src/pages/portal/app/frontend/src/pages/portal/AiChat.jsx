import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, SendHorizonal, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";

const suggestions = [
  "Explain SN1 vs SN2 in 10 seconds",
  "Give me a 7-day revision plan for Kinematics",
  "Why does entropy increase?",
];

export default function AiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef(null);

  const { data: history } = useQuery({
    queryKey: ["ai-history"],
    queryFn: async () => (await api.get("/api/ai/history")).data,
  });

  useEffect(() => {
    if (history && messages.length === 0) setMessages(history);
  }, [history]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text) => {
    const question = (text || input).trim();
    if (!question || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
     const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/doubt`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok || !res.body) throw new Error(`Server said ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop();
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.delta) {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + payload.delta };
              return copy;
            });
          }
          if (payload.error) toast.error(payload.error);
        }
      }
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-9rem)]" data-testid="ai-chat-page">
      <div className="flex items-center gap-3 pb-5 border-b border-border">
        <span className="w-11 h-11 rounded-2xl bg-brand text-white flex items-center justify-center shadow-glow">
          <Bot size={20} />
        </span>
        <div>
          <h1 className="font-display font-extrabold tracking-tight text-2xl leading-none">Setu AI</h1>
          <p className="text-xs text-muted-foreground mt-1">Exam-focused answers, memory tricks included</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-5" data-testid="ai-chat-messages">
        {messages.length === 0 && !streaming && (
          <div className="text-center py-10">
            <p className="font-display font-bold text-xl">What's blocking you today?</p>
            <p className="text-sm text-muted-foreground mt-2">Ask like you'd ask a mentor at 2 a.m.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  data-testid="ai-suggestion-chip"
                  className="rounded-full border border-border bg-card px-4 py-2.5 text-xs text-slate-600 hover:border-brand/50 hover:text-brand transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`} data-testid={`ai-message-${m.role}-${i}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-slate-200 text-slate-600" : "bg-brand text-white"}`}>
              {m.role === "user" ? <UserIcon size={14} /> : <Bot size={14} />}
            </span>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user" ? "bg-brand text-white rounded-br-md" : "bg-card border border-border text-foreground rounded-bl-md"
              }`}
            >
              {m.role === "user"
                ? m.content
                : m.content.replace(/\*\*/g, "") || (streaming && i === messages.length - 1 ? <span className="inline-flex gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" /><span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.15s]" /><span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.3s]" /></span> : "")}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-3 rounded-full border border-border bg-card pl-5 pr-2 py-2 focus-within:border-brand/60 transition-colors"
        data-testid="ai-chat-form"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any doubt — physics, chem, bio, maths…"
          data-testid="ai-chat-input"
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          aria-label="Ask Setu AI a doubt"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          data-testid="ai-chat-send"
          aria-label="Send doubt"
          className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40"
        >
          <SendHorizonal size={17} />
        </button>
      </form>
    </div>
  );
}
