import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTopicQuestions } from '../lib/api.js';
import QuestionCard from '../components/QuestionCard.jsx';

export default function TopicPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answered, setAnswered] = useState(new Set());

  useEffect(() => {
    getTopicQuestions(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswered = useCallback((qId) => {
    setAnswered((prev) => new Set([...prev, qId]));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ac-bg flex items-center justify-center">
        <div className="text-ac-muted animate-pulse">Loading…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-ac-bg flex items-center justify-center">
        <div className="text-red-400">{error || 'Topic not found'}</div>
      </div>
    );
  }

  const total = data.questions?.length || 0;
  const progress = total > 0 ? Math.round((answered.size / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-ac-bg">
      {/* Nav */}
      <nav className="border-b border-ac-border px-6 py-4">
        <Link
          to={`/professor/${data.professor_id}`}
          className="text-ac-muted hover:text-ac-gold transition-colors text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Topics
        </Link>
      </nav>

      {/* Topic header */}
      <header className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{data.icon || '📚'}</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-ac-text">{data.name}</h1>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-ac-muted mb-2">
            <span>{answered.size} / {total} revealed</span>
            <span className={progress === 100 ? 'text-ac-gold font-medium' : ''}>{progress}%</span>
          </div>
          <div className="h-1.5 bg-ac-border rounded-full overflow-hidden">
            <div
              className="h-full bg-ac-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Questions */}
      <main className="max-w-3xl mx-auto px-6 pb-16 space-y-4">
        {data.questions?.length === 0 && (
          <p className="text-ac-muted text-center py-12">No questions in this topic yet.</p>
        )}
        {data.questions?.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            professorId={data.professor_id}
            number={i + 1}
            onAnswered={handleAnswered}
          />
        ))}
      </main>
    </div>
  );
}
