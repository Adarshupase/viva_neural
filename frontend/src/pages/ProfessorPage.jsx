import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProfessor } from '../lib/api.js';

export default function ProfessorPage() {
  const { id } = useParams();
  const [prof, setProf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfessor(id)
      .then(setProf)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ac-bg flex items-center justify-center">
        <div className="text-ac-muted animate-pulse">Loading…</div>
      </div>
    );
  }

  if (error || !prof) {
    return (
      <div className="min-h-screen bg-ac-bg flex items-center justify-center">
        <div className="text-red-400">{error || 'Professor not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ac-bg">
      {/* Nav */}
      <nav className="border-b border-ac-border px-6 py-4">
        <Link to="/" className="text-ac-muted hover:text-ac-gold transition-colors text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Professors
        </Link>
      </nav>

      {/* Professor header */}
      <header className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="text-7xl flex-shrink-0">{prof.avatar_emoji || '👨‍⚕️'}</div>
          <div>
            <h1 className="font-serif text-4xl text-ac-text mb-1">{prof.name}</h1>
            {prof.title && <p className="text-ac-gold font-medium mb-1">{prof.title}</p>}
            {prof.credentials && <p className="text-ac-muted text-sm mb-3">{prof.credentials}</p>}
            {prof.bio && (
              <p className="text-ac-text/80 leading-relaxed max-w-xl">{prof.bio}</p>
            )}
          </div>
        </div>
      </header>

      {/* Topics */}
      <main className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="font-serif text-2xl text-ac-text mb-6">
          <span className="text-ac-gold">—</span> Topics
        </h2>

        {prof.topics?.length === 0 && (
          <p className="text-ac-muted">No published topics yet.</p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {prof.topics?.map((topic) => (
            <Link
              key={topic.id}
              to={`/topic/${topic.id}`}
              className="group bg-ac-card border border-ac-border hover:border-ac-gold/60 rounded-xl p-5 transition-all hover:shadow-md hover:shadow-ac-gold/5"
            >
              <div className="text-3xl mb-3">{topic.icon || '📚'}</div>
              <h3 className="font-serif text-lg text-ac-text group-hover:text-ac-gold transition-colors">
                {topic.name}
              </h3>
              <div className="mt-3 flex items-center gap-1 text-ac-gold text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Study Now</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
