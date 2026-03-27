import { useEffect, useState } from 'react';
import { adminGetProfessors, adminGetAIConfig, adminUpdateAIConfig, adminTestAIConfig } from '../../lib/api.js';

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

const TEMPLATE_VARS = ['{{topic_name}}', '{{question_text}}', '{{answer_html}}', '{{user_message}}'];

export default function AIConfigEditor() {
  const [professors, setProfessors] = useState([]);
  const [selectedProf, setSelectedProf] = useState('');
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminGetProfessors().then((profs) => {
      setProfessors(profs);
      if (profs.length > 0) setSelectedProf(String(profs[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedProf) return;
    setConfig(null);
    setTestResult('');
    setError('');
    adminGetAIConfig(selectedProf).then(setConfig).catch((e) => setError(e.message));
  }, [selectedProf]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await adminUpdateAIConfig(selectedProf, config);
      setConfig(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult('');
    setError('');
    try {
      const { response } = await adminTestAIConfig(selectedProf, config);
      setTestResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  }

  const field = (key) => ({
    value: config?.[key] ?? '',
    onChange: (e) => setConfig((c) => ({ ...c, [key]: e.target.value })),
  });

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Config</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure the AI professor persona per professor</p>
      </div>

      {professors.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
          Create at least one professor before configuring AI.
        </div>
      ) : (
        <>
          {/* Professor selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
            <select
              value={selectedProf}
              onChange={(e) => setSelectedProf(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {professors.map((p) => <option key={p.id} value={p.id}>{p.avatar_emoji} {p.name}</option>)}
            </select>
          </div>

          {!config ? (
            <div className="text-gray-400 animate-pulse">Loading…</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select value={config.model || 'llama-3.3-70b-versatile'} onChange={(e) => setConfig((c) => ({ ...c, model: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {GROQ_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">All models are free via Groq</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                  <input type="number" min="100" max="4000" value={config.max_tokens || 1000} onChange={(e) => setConfig((c) => ({ ...c, max_tokens: parseInt(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                <textarea {...field('system_prompt')} rows={6} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" placeholder="You are a medical professor…" />
                <p className="text-xs text-gray-400 mt-1">Describes the AI's persona and teaching style</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Prompt Template</label>
                <textarea {...field('user_prompt_template')} rows={6} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y" placeholder="Topic: {{topic_name}}…" />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {TEMPLATE_VARS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, user_prompt_template: (c.user_prompt_template || '') + v }))}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Click variables above to insert them into the template</p>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Config'}
                </button>
                <button type="button" onClick={handleTest} disabled={testing || saving} className="border border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {testing ? 'Testing…' : '▶ Test'}
                </button>
              </div>

              {/* Test result */}
              {testResult && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Test Response:</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {testResult}
                  </div>
                </div>
              )}
            </form>
          )}
        </>
      )}
    </div>
  );
}
