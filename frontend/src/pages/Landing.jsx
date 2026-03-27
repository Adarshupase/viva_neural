import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfessors } from '../lib/api.js';

export default function Landing() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfessors()
      .then(setProfessors)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-ac-bg">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-ac-border">
        <div className="absolute inset-0 bg-gradient-to-br from-ac-surface via-ac-bg to-ac-bg" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-ac-gold/10 border border-ac-gold/30 rounded-full px-4 py-1.5 text-ac-gold text-sm font-medium mb-6">
            <span>⚕️</span>
            <span>Medical Viva Voce Study Platform</span>
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl text-ac-text mb-5 leading-tight">
            Master Your{' '}
            <span className="text-ac-gold italic">Viva Voce</span>
          </h1>
          <p className="text-ac-muted text-lg max-w-xl mx-auto leading-relaxed">
            Study with expert professors, explore curated Q&amp;A, and get instant AI explanations
            tailored to your exam needs.
          </p>
        </div>
      </header>

      {/* Professors */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-serif text-2xl text-ac-text mb-8">
          <span className="text-ac-gold">—</span> Choose Your Professor
        </h2>

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-ac-card border border-ac-border rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-ac-border rounded-full mb-4" />
                <div className="h-4 bg-ac-border rounded w-3/4 mb-2" />
                <div className="h-3 bg-ac-border rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && professors.length === 0 && (
          <div className="text-center py-20 text-ac-muted">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-lg">No professors yet.</p>
            <p className="text-sm mt-1">
              <Link to="/admin" className="text-ac-gold hover:underline">Admin panel</Link> to get started.
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {professors.map((prof) => (
            <Link
              key={prof.id}
              to={`/professor/${prof.id}`}
              className="group bg-ac-card border border-ac-border hover:border-ac-gold/60 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-ac-gold/5"
            >
              <div className="text-5xl mb-4">{prof.avatar_emoji || '👨‍⚕️'}</div>
              <h3 className="font-serif text-xl text-ac-text group-hover:text-ac-gold transition-colors mb-1">
                {prof.name}
              </h3>
              {prof.title && (
                <p className="text-ac-gold text-sm font-medium mb-2">{prof.title}</p>
              )}
              {prof.credentials && (
                <p className="text-ac-muted text-xs mb-3">{prof.credentials}</p>
              )}
              {prof.bio && (
                <p className="text-ac-muted text-sm line-clamp-3 leading-relaxed">{prof.bio}</p>
              )}
              <div className="mt-4 flex items-center gap-1 text-ac-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Topics</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-ac-border text-center py-8 text-ac-muted text-sm">
        <Link to="/admin/login" className="hover:text-ac-gold transition-colors">Admin</Link>
      </footer>
    </div>
  );
}
