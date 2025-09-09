// src/components/ChatBox.tsx
import React, { useEffect, useRef, useState } from 'react';

type Role = 'user' | 'bot';
type Message = { id: string; role: Role; text: string };
type ChatResponse = { reply: string };

const uid = () => Math.random().toString(36).slice(2);

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  // Extract a readable error message from any backend shape
  async function readErrorMessage(
    res: Response,
    fallback = 'Connection lost, please retry.'
  ): Promise<string> {
    try {
      const text = await res.text(); // read once
      const maybeJson = (() => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })();
      const msg =
        (maybeJson &&
          (Array.isArray(maybeJson.message)
            ? maybeJson.message[0]
            : maybeJson.message)) ||
        (maybeJson && maybeJson.error) ||
        text;
      return (msg && String(msg).trim()) || fallback;
    } catch {
      return fallback;
    }
  }

  async function send() {
    const text = input.trim();
    if (!text) {
      setError('Message cannot be empty.');
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setIsSending(true);
    setIsTyping(true);

    setMessages((m) => [...m, { id: uid(), role: 'user', text }]);
    setInput('');
    inputRef.current?.focus();

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) {
        // Show server-provided message (e.g., "Rate limit exceeded. Try again in ~21s")
        const msg = await readErrorMessage(res);
        setError(msg);
        setIsTyping(false);
        return;
      }

      const data = (await res.json()) as ChatResponse;
      setMessages((m) => [...m, { id: uid(), role: 'bot', text: data.reply }]);
    } catch {
      setError('Connection lost, please retry.');
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }

  const canSend = input.trim().length > 0 && !isSending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSend) void send();
  }

  return (
    <div className="mx-auto h-[80vh] max-w-3xl rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold">ChatBox</h1>
        <p className="text-xs text-gray-500">
          Bot on the left • You on the right
        </p>
      </div>

      <div
        ref={listRef}
        className="flex h-[calc(80vh-8rem)] flex-col gap-2 overflow-y-auto bg-gray-50 p-3"
        aria-live="polite"
        aria-busy={isTyping}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={[
                'max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              ].join(' ')}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="animate-pulse rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
              Typing…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-gray-200 p-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error && e.target.value.trim().length > 0) setError(null);
          }}
          placeholder="Type your message…"
          aria-label="Message"
          aria-invalid={!!error}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </form>

      {error && (
        <div className="px-3 pb-3">
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
