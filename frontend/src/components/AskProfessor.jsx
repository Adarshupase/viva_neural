import { useState } from 'react';
import { askProfessor } from '../lib/api.js';

export default function AskProfessor({ question, professorId, onClose }) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAsk(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    setResponse('');
    try {
      const data = await askProfessor({
        question_id: question.id,
        professor_id: professorId,
        user_message: message,
      });
      setResponse(data.response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="bg-ac-card border border-ac-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ac-border">
          <div>
            <h3 className="font-serif text-lg text-ac-gold">Ask the Professor</h3>
            <p className="text-ac-muted text-sm mt-0.5 line-clamp-1">{question.question_text}</p>
          </div>
          <button onClick={onClose} className="text-ac-muted hover:text-ac-text transition-colors ml-4 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Response area */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[120px]">
          {loading && (
            <div className="flex items-center gap-3 text-ac-muted">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-ac-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-ac-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-ac-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Professor is thinking…</span>
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}
          {response && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-ac-gold text-sm font-medium">
                <span>👩‍⚕️</span>
                <span>Professor's Response</span>
              </div>
              <div className="bg-ac-surface rounded-lg p-4 text-ac-text text-sm leading-relaxed whitespace-pre-wrap border border-ac-border">
                {response}
              </div>
            </div>
          )}
          {!loading && !response && !error && (
            <p className="text-ac-muted text-sm">
              Ask anything about this question — clarifications, deeper explanations, or clinical applications.
            </p>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleAsk} className="p-5 border-t border-ac-border">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a follow-up question…"
              disabled={loading}
              className="flex-1 bg-ac-surface border border-ac-border rounded-lg px-4 py-2.5 text-ac-text text-sm placeholder:text-ac-muted focus:outline-none focus:border-ac-gold transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-ac-gold hover:bg-ac-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-ac-bg font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm flex-shrink-0"
            >
              Ask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
