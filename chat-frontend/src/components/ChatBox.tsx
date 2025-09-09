import React, { useEffect, useRef, useState } from 'react';

type Role = 'user' | 'bot';
type Message = {
  id: string;
  role: Role;
  text: string;
  grounded?: boolean;
  sources?: string[];
};
type ChatResponse = {
  reply: string;
  grounded?: boolean;
  sources?: string[];
  domain?: string; // <-- NEW
};

const uid = () => Math.random().toString(36).slice(2);

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [useLLM, setUseLLM] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [domain, setDomain] = useState(''); // <-- NEW

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);
  useEffect(() => {
    if (!useLLM) setUseWeb(false);
  }, [useLLM]);

  async function readErrorMessage(
    res: Response,
    fallback = 'Connection lost, please retry.'
  ): Promise<string> {
    try {
      const text = await res.text();
      const maybe = (() => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })();
      const msg =
        (maybe &&
          (Array.isArray(maybe.message) ? maybe.message[0] : maybe.message)) ||
        (maybe && maybe.error) ||
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
        body: JSON.stringify({
          message: text,
          useLLM,
          useWeb: useLLM && useWeb
        })
      });

      if (!res.ok) {
        const msg = await readErrorMessage(res);
        setError(msg);
        return;
      }

      const data = (await res.json()) as ChatResponse;

      // store domain sent by the backend (LLM_DOMAIN) for the header badge
      if (typeof data.domain === 'string') {
        setDomain(data.domain);
      }

      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: 'bot',
          text: data.reply,
          grounded: data.grounded,
          sources: data.sources
        }
      ]);
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

  const domainBadge = domain ? domain : 'General assistant';

  return (
    <div className="mx-auto h-[80vh] max-w-3xl rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header with domain badge from BACKEND */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">ChatBox</h1>
          <p className="text-xs text-gray-500">
            Bot on the left • You on the right
          </p>
        </div>
        <span
          title="LLM domain"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
        >
          Domain: <strong className="ml-1 font-medium">{domainBadge}</strong>
        </span>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex h-[calc(80vh-10.5rem)] flex-col gap-2 overflow-y-auto bg-gray-50 p-3"
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

              {/* Show sources if web search was actually used */}
              {m.role === 'bot' && m.grounded && m.sources?.length ? (
                <div className="mt-2 text-[11px] text-gray-600">
                  <span className="mr-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                    Used web search
                  </span>
                  Sources:{' '}
                  {m.sources.map((u, i) => (
                    <a
                      key={i}
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-blue-600"
                    >
                      [{i + 1}]
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {/* Live status */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
              {useLLM && useWeb ? 'Searching the web…' : 'Typing…'}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <form
        onSubmit={onSubmit}
        className="space-y-2 border-t border-gray-200 p-3"
      >
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={useLLM}
              onChange={(e) => setUseLLM(e.target.checked)}
            />
            <span>Use Google Gemini</span>
            <span
              title="Current domain from server"
              className="ml-1 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700"
            >
              {domainBadge}
            </span>
          </label>

          {useLLM && (
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={useWeb}
                onChange={(e) => setUseWeb(e.target.checked)}
              />
              <span>Allow web search</span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error && e.target.value.trim()) setError(null);
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
        </div>
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
