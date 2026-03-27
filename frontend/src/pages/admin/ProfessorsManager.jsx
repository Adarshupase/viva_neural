import { useEffect, useState } from 'react';
import {
  adminGetProfessors,
  adminCreateProfessor,
  adminUpdateProfessor,
  adminDeleteProfessor,
} from '../../lib/api.js';

const EMPTY = { name: '', title: '', credentials: '', avatar_emoji: '👨‍⚕️', bio: '' };

export default function ProfessorsManager() {
  const [professors, setProfessors] = useState([]);
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    adminGetProfessors().then(setProfessors).catch((e) => setError(e.message));
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY); setModal({ mode: 'add' }); setError(''); }
  function openEdit(p) { setForm({ name: p.name, title: p.title || '', credentials: p.credentials || '', avatar_emoji: p.avatar_emoji || '👨‍⚕️', bio: p.bio || '' }); setModal({ mode: 'edit', id: p.id }); setError(''); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal.mode === 'add') {
        await adminCreateProfessor(form);
      } else {
        await adminUpdateProfessor(modal.id, form);
      }
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This will also delete all their topics and questions.`)) return;
    try {
      await adminDeleteProfessor(id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professors</h1>
          <p className="text-gray-500 text-sm mt-0.5">{professors.length} total</p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Add Professor
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {professors.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">👨‍⚕️</div>
            <p>No professors yet. Add one to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Professor</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Title</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden lg:table-cell">Credentials</th>
                <th className="px-5 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {professors.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.avatar_emoji}</span>
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{p.title || '—'}</td>
                  <td className="px-5 py-3 text-gray-400 hidden lg:table-cell text-xs">{p.credentials || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-2 py-1 rounded hover:bg-indigo-50 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal.mode === 'add' ? 'Add Professor' : 'Edit Professor'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input required {...field('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Emoji</label>
                  <input {...field('avatar_emoji')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="👨‍⚕️" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input {...field('title')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Prof. of Cardiology" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credentials</label>
                  <input {...field('credentials')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="MBBS, MD, FRCP" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea {...field('bio')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Short biography…" />
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
