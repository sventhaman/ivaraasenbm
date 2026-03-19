import { useState, useEffect, useRef } from 'react';

export default function GenerateModal({ onConfirm, onCancel }) {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim()) onConfirm(prompt.trim());
    }
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.25)' }}>
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-md" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div className="px-5 py-3" style={{ background: '#2B579A' }}>
          <h2 className="text-white text-sm font-medium">Generer tekst</h2>
        </div>

        <div className="px-5 py-4">
          <label className="block text-xs text-gray-500 mb-1.5">
            Hva vil du at teksten skal handle om?
          </label>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="F.eks. «fortsett historien», «skriv en avslutning», «legg til et avsnitt om…»"
            rows={3}
            className="w-full text-sm border rounded px-3 py-2 outline-none resize-none"
            style={{ borderColor: '#c0c0c0', lineHeight: '1.5' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2B579A'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#c0c0c0'; }}
          />
          <p className="text-xs text-gray-400 mt-1">Enter for å bekrefte, Esc for å avbryte</p>
        </div>

        <div className="px-5 pb-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded transition-colors"
            style={{ color: '#555' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; }}
          >
            Avbryt
          </button>
          <button
            onClick={() => { if (prompt.trim()) onConfirm(prompt.trim()); }}
            disabled={!prompt.trim()}
            className="px-4 py-1.5 text-sm text-white rounded transition-colors"
            style={{ background: prompt.trim() ? '#2B579A' : '#9aadca' }}
          >
            Generer
          </button>
        </div>
      </div>
    </div>
  );
}
