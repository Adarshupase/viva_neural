import { useEffect, useState } from 'react';
import {
  adminGetProfessors,
  adminGetTopics,
  adminCreateTopic,
  adminUpdateTopic,
  adminDeleteTopic,
} from '../../lib/api.js';

const EMPTY = { name: '', icon: '📚', professor_id: '', is_published: false, display_order: 0 };

export default function TopicsManager() {
  const [topics, setTopics] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [filterProf, setFilterProf] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    adminGetTopics(filterProf || null).then(setTopics).catch((e) => setError(e.message));
  }

  useEffect(() => { adminGetProfessors().then(setProfessors); }, []);
  useEffect(() => { load(); }, [filterProf]);

  function openAdd() { setForm({ ...EMPTY, professor_id: filterProf || (professors[0]?.id ?? '') }); setModal({ mode: 'add' }); setError(''); }
  function openEdit(t) { setForm({ name: t.name, icon: t.icon || '📚', professor_id: t.professor_id, is_published: t.is_published, display_order: t.display_order ?? 0 }); setModal({ mode: 'edit', id: t.id }); setError(''); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal.mode === 'add') await adminCreateTopic(form);
      else await adminUpdateTopic(modal.id, form);
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? All questions inside will also be deleted.`)) return;
    try { await adminDeleteTopic(id); await load(); } catch (err) { alert(err.message); }
  }

  async function togglePublish(t) {
    try { await adminUpdateTopic(t.id, { ...t, is_published: !t.is_published }); await load(); } catch (err) { alert(err.message); }
  }

  const field = (key, type = 'text') => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: type === 'number' ? parseInt(e.target.value) : e.target.value })),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
          <p className="text-gray-500 text-sm mt-0.5">{topics.length} total</p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Add Topic
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterProf}
          onChange={(e) => setFilterProf(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Professors</option>
          {professors.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {topics.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">📚</div>
            <p>No topics yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Topic</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Professor</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="px-5 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topics.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{t.icon}</span>
                      <span className="font-medium text-gray-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{t.professor_name}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => togglePublish(t)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
                        t.is_published
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {t.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(t)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-2 py-1 rounded hover:bg-indigo-50">Edit</button>
                      <button onClick={() => handleDelete(t.id, t.name)} className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded hover:bg-red-50">Delete</button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal.mode === 'add' ? 'Add Topic' : 'Edit Topic'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor *</label>
                <select required value={form.professor_id} onChange={(e) => setForm((f) => ({ ...f, professor_id: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select professor…</option>
                  {professors.map((p) => <option key={p.id} value={p.id}>{p.avatar_emoji} {p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name *</label>
                  <input required {...field('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input {...field('icon')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input type="number" min="0" {...field('display_order', 'number')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Published</span>
                  </label>
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium">
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
