import { useEffect, useState } from 'react';
import {
  adminGetTopics,
  adminGetQuestions,
  adminCreateQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion,
  adminGetImages,
  adminCreateImage,
  adminDeleteImage,
} from '../../lib/api.js';

const EMPTY_Q = { topic_id: '', question_text: '', difficulty: 'easy', answer_html: '', display_order: 0 };
const DIFF_LABELS = { easy: '🟢 Easy', med: '🟡 Medium', hot: '🔴 Hot' };

export default function QuestionsManager() {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filterTopic, setFilterTopic] = useState('');
  const [modal, setModal] = useState(null); // { mode, id?, data? }
  const [form, setForm] = useState(EMPTY_Q);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Images sub-panel
  const [imagesModal, setImagesModal] = useState(null); // { questionId, questionText }
  const [images, setImages] = useState([]);
  const [imageForm, setImageForm] = useState({ image_url: '', caption: '' });
  const [imgSaving, setImgSaving] = useState(false);

  async function load() {
    adminGetQuestions(filterTopic || null).then(setQuestions).catch((e) => setError(e.message));
  }

  useEffect(() => { adminGetTopics().then(setTopics); }, []);
  useEffect(() => { load(); }, [filterTopic]);

  function openAdd() { setForm({ ...EMPTY_Q, topic_id: filterTopic || (topics[0]?.id ?? '') }); setModal({ mode: 'add' }); setError(''); }
  function openEdit(q) {
    setForm({ topic_id: q.topic_id, question_text: q.question_text, difficulty: q.difficulty, answer_html: q.answer_html || '', display_order: q.display_order ?? 0 });
    setModal({ mode: 'edit', id: q.id });
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal.mode === 'add') await adminCreateQuestion(form);
      else await adminUpdateQuestion(modal.id, form);
      await load();
      setModal(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, text) {
    if (!confirm(`Delete this question?\n"${text.slice(0, 80)}…"`)) return;
    try { await adminDeleteQuestion(id); await load(); } catch (err) { alert(err.message); }
  }

  // Images
  async function openImages(q) {
    setImagesModal({ questionId: q.id, questionText: q.question_text });
    const imgs = await adminGetImages(q.id);
    setImages(imgs);
    setImageForm({ image_url: '', caption: '' });
  }

  async function handleAddImage(e) {
    e.preventDefault();
    setImgSaving(true);
    try {
      const img = await adminCreateImage(imagesModal.questionId, imageForm);
      setImages((prev) => [...prev, img]);
      setImageForm({ image_url: '', caption: '' });
    } catch (err) {
      alert(err.message);
    } finally {
      setImgSaving(false);
    }
  }

  async function handleDeleteImage(imgId) {
    try {
      await adminDeleteImage(imagesModal.questionId, imgId);
      setImages((prev) => prev.filter((i) => i.id !== imgId));
    } catch (err) { alert(err.message); }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-500 text-sm mt-0.5">{questions.length} total</p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Question
        </button>
      </div>

      <div className="mb-4">
        <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">All Topics</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {questions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">❓</div>
            <p>No questions yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Question</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Topic</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Difficulty</th>
                <th className="px-5 py-3 w-36" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="text-gray-900 font-medium line-clamp-2">{q.question_text}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell text-xs">{q.topic_name}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs">{DIFF_LABELS[q.difficulty]}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openImages(q)} title="Manage images" className="text-gray-500 hover:text-gray-700 font-medium text-xs px-2 py-1 rounded hover:bg-gray-100">🖼️</button>
                      <button onClick={() => openEdit(q)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-2 py-1 rounded hover:bg-indigo-50">Edit</button>
                      <button onClick={() => handleDelete(q.id, q.question_text)} className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded hover:bg-red-50">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Question Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal.mode === 'add' ? 'Add Question' : 'Edit Question'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                <select required value={form.topic_id} onChange={(e) => setForm((f) => ({ ...f, topic_id: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select topic…</option>
                  {topics.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <textarea required {...field('question_text')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="easy">Easy</option>
                    <option value="med">Medium</option>
                    <option value="hot">Hot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input type="number" min="0" value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: parseInt(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer <span className="text-gray-400 font-normal">(HTML)</span>
                </label>
                <textarea {...field('answer_html')} rows={8} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" placeholder="<p>Enter answer HTML…</p>" />
                <p className="text-xs text-gray-400 mt-1">Supports HTML tags: &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;h4&gt;, etc.</p>
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

      {/* Images Modal */}
      {imagesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">Manage Images</h2>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{imagesModal.questionText}</p>
              </div>
              <button onClick={() => setImagesModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              {/* Add image form */}
              <form onSubmit={handleAddImage} className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                  <input required value={imageForm.image_url} onChange={(e) => setImageForm((f) => ({ ...f, image_url: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://…" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                  <input value={imageForm.caption} onChange={(e) => setImageForm((f) => ({ ...f, caption: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional caption…" />
                </div>
                <button type="submit" disabled={imgSaving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  {imgSaving ? 'Adding…' : '+ Add Image'}
                </button>
              </form>

              {/* Image list */}
              {images.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No images yet.</p>
              ) : (
                <div className="space-y-3">
                  {images.map((img) => (
                    <div key={img.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
                      <img src={img.image_url} alt={img.caption || ''} className="w-16 h-12 object-cover rounded" onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48"><rect width="64" height="48" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10">err</text></svg>'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">{img.image_url}</p>
                        {img.caption && <p className="text-xs text-gray-400 mt-0.5">{img.caption}</p>}
                      </div>
                      <button onClick={() => handleDeleteImage(img.id)} className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 flex-shrink-0">Del</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
