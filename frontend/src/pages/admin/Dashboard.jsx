import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetStats } from '../../lib/api.js';

const CARDS = [
  { key: 'professors', label: 'Professors', icon: '👨‍⚕️', to: '/admin/professors', color: 'bg-purple-50 text-purple-700' },
  { key: 'topics', label: 'Topics', icon: '📚', to: '/admin/topics', color: 'bg-blue-50 text-blue-700' },
  { key: 'questions', label: 'Questions', icon: '❓', to: '/admin/questions', color: 'bg-amber-50 text-amber-700' },
  { key: 'images', label: 'Images', icon: '🖼️', to: '/admin/questions', color: 'bg-green-50 text-green-700' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Overview of your content</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {CARDS.map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl ${card.color} mb-3`}>
              {card.icon}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-0.5">
              {stats ? stats[card.key] : '—'}
            </div>
            <div className="text-gray-500 text-sm">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Start</h2>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
            <span>Create a <Link to="/admin/professors" className="text-indigo-600 hover:underline">Professor</Link> with their name, credentials and emoji</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
            <span>Add <Link to="/admin/topics" className="text-indigo-600 hover:underline">Topics</Link> for the professor and publish them</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
            <span>Add <Link to="/admin/questions" className="text-indigo-600 hover:underline">Questions</Link> with HTML answers to each topic</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
            <span>Customise the <Link to="/admin/ai-config" className="text-indigo-600 hover:underline">AI Config</Link> per professor</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
