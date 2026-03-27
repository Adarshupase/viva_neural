import { useState } from 'react';
import Lightbox from './Lightbox.jsx';
import AskProfessor from './AskProfessor.jsx';

const DIFFICULTY = {
  easy: { label: 'Easy', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
  med: { label: 'Medium', color: 'bg-amber-900/60 text-amber-300 border-amber-700' },
  hot: { label: 'Hot', color: 'bg-red-900/60 text-red-300 border-red-700' },
};

export default function QuestionCard({ question, professorId, number, onAnswered }) {
  const [open, setOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  const diff = DIFFICULTY[question.difficulty] || DIFFICULTY.easy;

  function handleToggle() {
    if (!open) onAnswered?.(question.id);
    setOpen((v) => !v);
  }

  return (
    <>
      <div className="bg-ac-card border border-ac-border rounded-xl overflow-hidden transition-all hover:border-ac-gold/40">
        {/* Question header */}
        <button
          onClick={handleToggle}
          className="w-full text-left p-5 flex items-start gap-4 hover:bg-ac-surface/50 transition-colors"
        >
          <span className="text-ac-muted font-mono text-sm mt-0.5 flex-shrink-0 w-6">
            {String(number).padStart(2, '0')}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-ac-text font-medium leading-relaxed">{question.question_text}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${diff.color}`}>
              {diff.label}
            </span>
            <svg
              className={`w-4 h-4 text-ac-muted transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Answer */}
        {open && (
          <div className="border-t border-ac-border">
            <div className="p-5">
              <div
                className="answer-content text-ac-text text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: question.answer_html || '<p class="text-ac-muted italic">No answer provided yet.</p>' }}
              />

              {/* Images */}
              {question.images?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {question.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setLightboxImg(img)}
                      className="group relative"
                    >
                      <img
                        src={img.image_url}
                        alt={img.caption || 'Image'}
                        className="h-20 w-28 object-cover rounded-lg border border-ac-border group-hover:border-ac-gold transition-colors"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                          View
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Ask Professor button */}
              <div className="mt-5 pt-4 border-t border-ac-border/50">
                <button
                  onClick={() => setAskOpen(true)}
                  className="flex items-center gap-2 text-ac-gold hover:text-ac-gold-light transition-colors text-sm font-medium"
                >
                  <span>💬</span>
                  <span>Ask the Professor</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {lightboxImg && <Lightbox image={lightboxImg} onClose={() => setLightboxImg(null)} />}
      {askOpen && (
        <AskProfessor
          question={question}
          professorId={professorId}
          onClose={() => setAskOpen(false)}
        />
      )}
    </>
  );
}
