import React, { useEffect, useRef, useState } from 'react';

type Role = 'user' | 'bot';

type Message = {
  id: string;
  role: Role;
  text: string;
};

type ChatRequest = { message: string };
type ChatResponse = { reply: string };

type ChatBoxProps = {
  /** Base URL of your API, e.g., "http://localhost:3000". Defaults to same-origin. */
  apiBase?: string;
};

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const ChatBox: React.FC<ChatBoxProps> = ({ apiBase = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to newest message or typing indicator
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const send = async () => {
    const text = input.trim();
    if (!text) {
      setError('Message cannot be empty.');
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setIsSending(true);
    setIsTyping(true);

    // Append user message
    const userMsg: Message = { id: makeId(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);

    // Clear & refocus input
    setInput('');
    inputRef.current?.focus();

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text } satisfies ChatRequest),
        signal: controller.signal
      });

      // 400 -> inline message error
      if (res.status === 400) {
        setError('Message cannot be empty.');
        setIsTyping(false);
        return;
      }

      if (!res.ok) {
        setError('Connection lost, please retry.');
        setIsTyping(false);
        return;
      }

      const data = (await res.json()) as ChatResponse;
      const botMsg: Message = { id: makeId(), role: 'bot', text: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError('Connection lost, please retry.');
      }
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSending) void send();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSending) void send();
    }
  };

  const canSend = input.trim().length > 0 && !isSending;

  return (
    <div className="cbx">
      <div
        className="cbx-messages"
        ref={listRef}
        aria-live="polite"
        aria-busy={isTyping}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`cbx-row ${m.role === 'user' ? 'is-user' : 'is-bot'}`}
          >
            <div className="cbx-bubble">{m.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="cbx-row is-bot">
            <div className="cbx-bubble cbx-typing">Typing…</div>
          </div>
        )}
      </div>

      <form className="cbx-form" onSubmit={onSubmit}>
        <input
          ref={inputRef}
          className="cbx-input"
          type="text"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          aria-invalid={!!error}
          aria-label="Message"
        />
        <button className="cbx-btn" type="submit" disabled={!canSend}>
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </form>

      {error && (
        <div className="cbx-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
