import { diffWords } from './diff.js';

export default function DiffView({ original, revised, isGenerate, onAccept, onReject }) {
  const parts = isGenerate ? null : diffWords(original, revised);
  const hasChanges = isGenerate || (parts && parts.some(p => p.type !== 'same'));

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-8" style={{ background: 'rgba(0,0,0,0.25)' }}>
      <div className="bg-white rounded-xl max-w-2xl w-full flex flex-col overflow-hidden" style={{ maxHeight: '80vh', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
            {isGenerate ? 'Generert tekst' : 'Foreslåtte endringer'}
          </h2>
          {!isGenerate && (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300 inline-block" />
                Lagt til
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block" />
                Fjernet
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 text-[15px] leading-relaxed font-serif text-gray-800">
          {!hasChanges && (
            <p className="text-gray-400 italic">Ingen synlige endringer.</p>
          )}

          {isGenerate && (
            <p className="whitespace-pre-wrap text-gray-800">{revised}</p>
          )}

          {!isGenerate && parts && hasChanges && (
            <p className="whitespace-pre-wrap">
              {parts.map((part, i) => {
                if (part.type === 'same') {
                  return <span key={i}>{part.text}</span>;
                }
                if (part.type === 'added') {
                  return (
                    <span key={i} className="bg-green-100 text-green-800 rounded-sm px-0.5">
                      {part.text}
                    </span>
                  );
                }
                if (part.type === 'removed') {
                  return (
                    <span key={i} className="bg-red-50 text-red-600 line-through rounded-sm px-0.5 opacity-80">
                      {part.text}
                    </span>
                  );
                }
                return null;
              })}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onReject}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Forkast
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isGenerate ? 'Sett inn tekst' : 'Bruk endringer'}
          </button>
        </div>
      </div>
    </div>
  );
}
