import { useState, useRef, useEffect } from 'react';

const FONTS = [
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Palatino', value: '"Palatino Linotype", Palatino, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'System', value: 'system-ui, sans-serif' },
];

const AI_ACTIONS = [
  {
    id: 'grammar',
    tooltip: 'Rett grammatikk\nRetter grammatikk, tegnsetting og stavefeil',
    icon: <IconGrammar />,
  },
  {
    id: 'generate',
    tooltip: 'Generer tekst\nFortsetter eller utvider teksten',
    icon: <IconGenerate />,
  },
  {
    id: 'bokmalToNynorsk',
    tooltip: 'Bokmål → Nynorsk\nOversetter valgt tekst til nynorsk',
    icon: <IconBMNN />,
  },
  {
    id: 'nynorskToBokmal',
    tooltip: 'Nynorsk → Bokmål\nOversetter valgt tekst til bokmål',
    icon: <IconNNBM />,
  },
  {
    id: 'style',
    tooltip: 'Forbedre stil\nGjør teksten klarere og mer engasjerende',
    icon: <IconStyle />,
  },
];

// Tooltip that uses fixed positioning to avoid clipping
function Tooltip({ text, children }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  function show() {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={() => setPos(null)}>
      {children}
      {pos && (
        <div
          className="pointer-events-none z-[9999]"
          style={{ position: 'fixed', left: pos.x, top: pos.y, transform: 'translateX(-50%)' }}
        >
          <div className="bg-gray-800 text-white text-xs rounded px-2.5 py-1.5 shadow-lg whitespace-pre text-center leading-snug max-w-[180px]">
            {text}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Toolbar({ loading, loadingAction, font, onFontChange, variant, onVariantChange, onAction, canUndo, onUndo, editor }) {
  return (
    <div className="select-none">
      {/* Word-style title bar */}
      <div className="flex items-center px-4 h-9" style={{ background: '#2B579A' }}>
        <span className="text-white text-sm font-medium tracking-wide opacity-90">Ivar Aasen BM</span>
      </div>

      {/* Ribbon toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b flex-wrap" style={{ background: '#f0f0f0', borderColor: '#d0d0d0' }}>

        {/* Font selector */}
        <select
          value={font}
          onChange={e => onFontChange(e.target.value)}
          className="text-xs border rounded px-1.5 py-1 cursor-pointer outline-none mr-1"
          style={{ borderColor: '#c0c0c0', background: 'white', color: '#333', fontFamily: font }}
        >
          {FONTS.map(f => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </select>

        {/* Bold / Italic */}
        {editor && (
          <>
            <Tooltip text="Fet (⌘B)">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className="w-7 h-7 flex items-center justify-center rounded text-sm font-bold transition-colors"
                style={editor.isActive('bold')
                  ? { background: '#d0d8e8', color: '#1a3a6a' }
                  : { color: '#444' }}
                onMouseEnter={e => { if (!editor.isActive('bold')) e.currentTarget.style.background = '#e0e0e0'; }}
                onMouseLeave={e => { if (!editor.isActive('bold')) e.currentTarget.style.background = ''; }}
              >B</button>
            </Tooltip>
            <Tooltip text="Kursiv (⌘I)">
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className="w-7 h-7 flex items-center justify-center rounded text-sm italic transition-colors"
                style={editor.isActive('italic')
                  ? { background: '#d0d8e8', color: '#1a3a6a' }
                  : { color: '#444' }}
                onMouseEnter={e => { if (!editor.isActive('italic')) e.currentTarget.style.background = '#e0e0e0'; }}
                onMouseLeave={e => { if (!editor.isActive('italic')) e.currentTarget.style.background = ''; }}
              >I</button>
            </Tooltip>
          </>
        )}

        <Divider />

        {/* Language toggle */}
        <div className="flex rounded overflow-hidden border text-xs" style={{ borderColor: '#c0c0c0' }}>
          <button
            onClick={() => onVariantChange('bokmal')}
            className="px-2.5 py-1 transition-colors"
            style={variant === 'bokmal'
              ? { background: '#2B579A', color: 'white' }
              : { background: 'white', color: '#444' }}
          >BM</button>
          <button
            onClick={() => onVariantChange('nynorsk')}
            className="px-2.5 py-1 transition-colors border-l"
            style={variant === 'nynorsk'
              ? { background: '#2B579A', color: 'white', borderColor: '#c0c0c0' }
              : { background: 'white', color: '#444', borderColor: '#c0c0c0' }}
          >NN</button>
        </div>

        <Divider />

        {/* AI action icon buttons */}
        {AI_ACTIONS.map(action => (
          <Tooltip key={action.id} text={action.tooltip}>
            <button
              onClick={() => onAction(action.id)}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded transition-colors"
              style={{ color: loading && loadingAction === action.id ? '#aaa' : '#333' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e0e0e0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; }}
            >
              {loading && loadingAction === action.id
                ? <LoadingDots />
                : action.icon}
            </button>
          </Tooltip>
        ))}

        {/* Undo */}
        {canUndo && (
          <>
            <Divider />
            <Tooltip text="Angre siste AI-endring">
              <button
                onClick={onUndo}
                className="w-8 h-8 flex items-center justify-center rounded transition-colors"
                style={{ color: '#2B579A' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e0e0e0'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                </svg>
              </button>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 mx-1" style={{ background: '#c8c8c8' }} />;
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1 h-1 rounded-full animate-bounce" style={{ background: '#999', animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

// Icons
function IconGrammar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M4 12h10M4 17h7" />
      <path d="M19 14l-3 5M16 14l3 5" />
      <circle cx="17.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconGenerate() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 17l1 3 1-3" strokeWidth="1.5" />
      <path d="M19 17l1 3 1-3" strokeWidth="1.5" />
    </svg>
  );
}

function IconBMNN() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <text x="1" y="11" fontSize="7.5" fontWeight="700" fill="currentColor" fontFamily="system-ui">BM</text>
      <text x="1" y="21" fontSize="7.5" fill="currentColor" fontFamily="system-ui" opacity="0.6">NN</text>
      <path d="M17 4v16M14 17l3 3 3-3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconNNBM() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <text x="1" y="11" fontSize="7.5" fill="currentColor" fontFamily="system-ui" opacity="0.6">NN</text>
      <text x="1" y="21" fontSize="7.5" fontWeight="700" fill="currentColor" fontFamily="system-ui">BM</text>
      <path d="M17 20V4M14 7l3-3 3 3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconStyle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      <circle cx="8.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
