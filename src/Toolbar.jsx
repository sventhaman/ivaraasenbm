import { useState, useRef } from 'react';

const FONTS = [
  { label: 'Calibri', value: 'Calibri, "Gill Sans", sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Palatino', value: '"Palatino Linotype", Palatino, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
];

const FONT_SIZES = ['8','9','10','11','12','14','16','18','20','22','24','26','28','36','48','72'];
const TABS = ['Fil', 'Hjem', 'Sett inn', 'Utforming', 'Oppsett', 'Referanser', 'Gjennomgå', 'Vis'];

function Tip({ text, children }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  function show() {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ x: r.left + r.width / 2, y: r.bottom + 6 });
  }
  return (
    <span ref={ref} style={{ display: 'inline-flex' }} onMouseEnter={show} onMouseLeave={() => setPos(null)}>
      {children}
      {pos && (
        <div style={{ position: 'fixed', left: pos.x, top: pos.y, transform: 'translateX(-50%)', zIndex: 9999, pointerEvents: 'none' }}>
          <div style={{ background: '#1a1a1a', color: '#fff', fontSize: 11, borderRadius: 3, padding: '5px 9px', whiteSpace: 'pre', boxShadow: '0 2px 8px rgba(0,0,0,0.35)', lineHeight: 1.4 }}>
            {text}
          </div>
        </div>
      )}
    </span>
  );
}

function Btn({ onClick, active, disabled, children, w = 26, h = 26, title }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: w, height: h,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: active ? '1px solid #b8cfe4' : hov ? '1px solid #c8c8c8' : '1px solid transparent',
        borderRadius: 2,
        background: active ? '#ddeeff' : hov ? '#e5e5e5' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? '#ccc' : '#1f1f1f',
        padding: 0,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div style={{ width: 1, height: 44, background: '#e4e4e4', margin: '0 6px', flexShrink: 0 }} />;
}

function Group({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingRight: 8, marginRight: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, paddingBottom: 2 }}>
        {children}
      </div>
      <div style={{ textAlign: 'center', fontSize: 9, color: '#999', paddingTop: 2, letterSpacing: '0.2px' }}>
        {label}
      </div>
    </div>
  );
}

function BigBtn({ icon, label, onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        width: 44, height: 52, gap: 3,
        border: hov ? '1px solid #c8c8c8' : '1px solid transparent',
        borderRadius: 3,
        background: hov ? '#e8e8e8' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? '#ccc' : '#1f1f1f',
        padding: '4px 2px',
        flexShrink: 0,
      }}
    >
      <div style={{ color: disabled ? '#ccc' : '#2B579A' }}>{icon}</div>
      <span style={{ fontSize: 9, lineHeight: 1.1, textAlign: 'center', color: disabled ? '#ccc' : '#1f1f1f' }}>{label}</span>
    </button>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#888', display: 'inline-block', animation: 'pulse 1s infinite', animationDelay: `${i*0.2}s` }} />
      ))}
    </span>
  );
}

export default function Toolbar({ loading, loadingAction, font, onFontChange, variant, onVariantChange, onAction, canUndo, onUndo, editor }) {
  const [fontSize, setFontSize] = useState('12');
  const [activeTab, setActiveTab] = useState('Hjem');

  function applyFontSize(s) {
    setFontSize(s);
    if (editor) editor.view.dom.style.fontSize = s + 'px';
  }

  const isActive = (f) => editor?.isActive(f) ?? false;
  const chain = () => editor?.chain().focus();

  return (
    <div style={{ userSelect: 'none', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>

      {/* Title bar */}
      <div style={{ background: '#2B579A', height: 32, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6 }}>
        <div style={{ display: 'flex', gap: 4, marginRight: 8 }}>
          {/* Quick access toolbar icons */}
          {[
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>,
          ].map((icon, i) => (
            <button key={i} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 3, borderRadius: 2, opacity: 0.85 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{icon}</button>
          ))}
        </div>
        <span style={{ flex: 1, textAlign: 'center', color: 'white', fontSize: 12, fontWeight: 400 }}>
          Dokument1 — Ivar Aasen BM
        </span>
        {/* Window controls */}
        <div style={{ display: 'flex', gap: 0 }}>
          {['—', '□', '×'].map((s, i) => (
            <button key={i} style={{ width: 46, height: 32, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: i === 2 ? 14 : 12, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = i === 2 ? '#c42b1c' : 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#f5f5f5', display: 'flex', alignItems: 'flex-end', paddingLeft: 0, borderBottom: '1px solid #e8e8e8' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 16px 6px',
              fontSize: 12,
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #2B579A' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab ? '#2B579A' : '#555',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'Segoe UI, system-ui, sans-serif',
              letterSpacing: '0.1px',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Ribbon */}
      <div style={{ background: '#fafafa', borderBottom: '1px solid #e8e8e8', padding: '4px 8px 0', display: 'flex', alignItems: 'flex-start', minHeight: 70, overflowX: 'auto' }}>

        {/* Clipboard */}
        <Group label="Utklippstavle">
          <BigBtn icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>} label="Lim inn" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Btn w={60} h={18} title="Klipp ut">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="20" r="2"/><circle cx="18" cy="20" r="2"/><path d="M5.45 5.11L2 3l13.96 7.86L12 17.44 5.45 5.11z"/><path d="M19.79 8.93L8.04 15.14 12 22l3.18-5.82 4.61-7.25z"/><line x1="2" y1="3" x2="22" y2="3"/></svg>
              <span style={{ fontSize: 10, marginLeft: 3 }}>Klipp ut</span>
            </Btn>
            <Btn w={60} h={18} title="Kopier">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span style={{ fontSize: 10, marginLeft: 3 }}>Kopier</span>
            </Btn>
            <Btn w={60} h={18} title="Kopier formatering">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m10 0h3a2 2 0 0 0 2-2v-3"/></svg>
              <span style={{ fontSize: 10, marginLeft: 3 }}>Format</span>
            </Btn>
          </div>
        </Group>
        <Sep />

        {/* Font */}
        <Group label="Skrift">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <select value={font} onChange={e => onFontChange(e.target.value)}
                style={{ width: 120, height: 22, fontSize: 11, border: '1px solid #c8c8c8', borderRadius: 2, padding: '0 4px', background: 'white', fontFamily: font, color: '#1f1f1f', outline: 'none' }}>
                {FONTS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
              </select>
              <select value={fontSize} onChange={e => applyFontSize(e.target.value)}
                style={{ width: 40, height: 22, fontSize: 11, border: '1px solid #c8c8c8', borderRadius: 2, padding: '0 2px', background: 'white', color: '#1f1f1f', outline: 'none' }}>
                {FONT_SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
              <Btn w={22} h={22} title="Øk skriftstørrelse">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M5.12 14l2.88-7.68L10.88 14H5.12zM4 3L0 14h2l1-2.5h6L10 14h2L8 3H4zm14 0v10.17l-2.59-2.58L14 12l4 4 4-4-1.41-1.41L18 13.17V3h-2z"/></svg>
              </Btn>
              <Btn w={22} h={22} title="Reduser skriftstørrelse">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M5.12 14l2.88-7.68L10.88 14H5.12zM4 3L0 14h2l1-2.5h6L10 14h2L8 3H4zm14 17.17l2.59-2.58L22 19l-4 4-4-4 1.41-1.41L18 20.17V10h2v10.17z"/></svg>
              </Btn>
            </div>
            <div style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tip text="Fet (⌘B)">
                <Btn onClick={() => chain()?.toggleBold().run()} active={isActive('bold')} w={24} h={24}>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'serif' }}>F</span>
                </Btn>
              </Tip>
              <Tip text="Kursiv (⌘I)">
                <Btn onClick={() => chain()?.toggleItalic().run()} active={isActive('italic')} w={24} h={24}>
                  <span style={{ fontSize: 13, fontStyle: 'italic', fontFamily: 'serif' }}>K</span>
                </Btn>
              </Tip>
              <Tip text="Understrek (⌘U)">
                <Btn w={24} h={24}>
                  <span style={{ fontSize: 12, textDecoration: 'underline', fontFamily: 'serif' }}>U</span>
                </Btn>
              </Tip>
              <Tip text="Gjennomstrek">
                <Btn onClick={() => chain()?.toggleStrike().run()} active={isActive('strike')} w={24} h={24}>
                  <span style={{ fontSize: 12, textDecoration: 'line-through', fontFamily: 'serif' }}>S</span>
                </Btn>
              </Tip>
              <Btn w={24} h={24} title="Utheving">
                <span style={{ fontSize: 10, fontWeight: 700, color: '#ffb900', textShadow: '0 0 0 #333', letterSpacing: -0.5 }}>ab</span>
              </Btn>
              <Btn w={24} h={24} title="Skriftfarge">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'serif', lineHeight: 1 }}>A</span>
                  <div style={{ width: 14, height: 3, background: '#c00000', borderRadius: 1, marginTop: 1 }} />
                </div>
              </Btn>
              <div style={{ width: 1, height: 18, background: '#d8d8d8', margin: '0 2px' }} />
              <Btn w={22} h={22} title="Fjern formatering">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </Btn>
            </div>
          </div>
        </Group>
        <Sep />

        {/* Paragraph */}
        <Group label="Avsnitt">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', gap: 1 }}>
              <Tip text="Punktliste">
                <Btn onClick={() => chain()?.toggleBulletList().run()} active={isActive('bulletList')} w={24} h={24}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </Btn>
              </Tip>
              <Tip text="Numrert liste">
                <Btn onClick={() => chain()?.toggleOrderedList().run()} active={isActive('orderedList')} w={24} h={24}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                </Btn>
              </Tip>
              <Btn w={24} h={24} title="Reduser innrykk"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="11 17 6 12 11 7"/><line x1="21" y1="7" x2="6" y2="7"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="21" y1="17" x2="6" y2="17"/></svg></Btn>
              <Btn w={24} h={24} title="Øk innrykk"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7"/><line x1="3" y1="7" x2="18" y2="7"/><line x1="3" y1="12" x2="12" y2="12"/><line x1="3" y1="17" x2="18" y2="17"/></svg></Btn>
              <Btn w={24} h={24} title="Linjeavstand">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/><polyline points="3 8 3 4"/><polyline points="3 20 3 16"/></svg>
              </Btn>
              <Btn w={24} h={24} title="Sorter"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/></svg></Btn>
            </div>
            <div style={{ display: 'flex', gap: 1 }}>
              <Tip text="Venstrejuster">
                <Btn onClick={() => chain()?.setTextAlign('left').run()} active={isActive({ textAlign: 'left' })} w={24} h={24}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                </Btn>
              </Tip>
              <Tip text="Midtstill">
                <Btn onClick={() => chain()?.setTextAlign('center').run()} active={isActive({ textAlign: 'center' })} w={24} h={24}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
                </Btn>
              </Tip>
              <Tip text="Høyrejuster">
                <Btn onClick={() => chain()?.setTextAlign('right').run()} active={isActive({ textAlign: 'right' })} w={24} h={24}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
                </Btn>
              </Tip>
              <Tip text="Juster">
                <Btn onClick={() => chain()?.setTextAlign('justify').run()} active={isActive({ textAlign: 'justify' })} w={24} h={24}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
                </Btn>
              </Tip>
              <div style={{ width: 1, height: 18, background: '#d8d8d8', margin: '0 2px' }} />
              <Btn w={24} h={24} title="Skyggelegging"><div style={{ width: 14, height: 10, background: '#ffd966', border: '1px solid #ccc', borderRadius: 1 }} /></Btn>
              <Btn w={24} h={24} title="Ramme">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              </Btn>
            </div>
          </div>
        </Group>
        <Sep />

        {/* Styles */}
        <Group label="Stiler">
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[
              { label: 'Normal', style: { fontSize: 11 } },
              { label: 'Overskrift 1', style: { fontSize: 11, fontWeight: 700, color: '#2B579A' } },
              { label: 'Overskrift 2', style: { fontSize: 11, fontWeight: 700, color: '#2B579A', opacity: 0.8 } },
              { label: 'Tittel', style: { fontSize: 11, fontWeight: 700 } },
            ].map(s => (
              <button key={s.label}
                style={{
                  padding: '4px 8px',
                  border: '1px solid transparent',
                  borderRadius: 2,
                  background: 'transparent',
                  cursor: 'pointer',
                  ...s.style,
                  height: 48,
                }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid #c8c8c8'; e.currentTarget.style.background = '#f0f0f0'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = 'transparent'; }}
              >{s.label}</button>
            ))}
            <Btn w={20} h={48} title="Flere stiler">
              <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><path d="M5 0L0 5h4v4h2V5h4L5 0zM0 10h10v2H0z"/></svg>
            </Btn>
          </div>
        </Group>
        <Sep />

        {/* Language */}
        <Group label="Målform">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 52, paddingBottom: 4 }}>
            <div style={{ border: '1px solid #c0c0c0', borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
              {[['BM', 'bokmal'], ['NN', 'nynorsk']].map(([label, val]) => (
                <button key={val} onClick={() => onVariantChange(val)}
                  style={{
                    padding: '4px 12px', fontSize: 11, fontWeight: variant === val ? 600 : 400,
                    background: variant === val ? '#2B579A' : 'white',
                    color: variant === val ? 'white' : '#444',
                    border: 'none', borderRight: val === 'bokmal' ? '1px solid #c0c0c0' : 'none',
                    cursor: 'pointer',
                  }}
                >{label}</button>
              ))}
            </div>
          </div>
        </Group>
        <Sep />

        {/* AI Tools — styled as a ribbon group */}
        <Group label="AI-assistent">
          <div style={{ display: 'flex', gap: 1, height: 52, alignItems: 'center' }}>
            {[
              { id: 'grammar', label: 'Grammatikk', tooltip: 'Rett grammatikk\nRetter stavefeil og tegnsetting', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h10M4 17h7"/><path d="M19 14l-3 5M16 14l3 5"/><circle cx="17.5" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg> },
              { id: 'generate', label: 'Generer', tooltip: 'Generer tekst\nFortsetter teksten din', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 17l1 3 1-3" strokeWidth="1.5"/><path d="M19 17l1 3 1-3" strokeWidth="1.5"/></svg> },
              { id: 'bokmalToNynorsk', label: 'BM→NN', tooltip: 'Oversett til nynorsk', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round"><text x="1" y="10" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="system-ui">BM</text><text x="1" y="20" fontSize="7" fill="currentColor" fontFamily="system-ui" opacity="0.5">NN</text><path d="M17 4v16M14 17l3 3 3-3" stroke="currentColor" strokeWidth="1.8"/></svg> },
              { id: 'nynorskToBokmal', label: 'NN→BM', tooltip: 'Oversett til bokmål', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round"><text x="1" y="10" fontSize="7" fill="currentColor" fontFamily="system-ui" opacity="0.5">NN</text><text x="1" y="20" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="system-ui">BM</text><path d="M17 20V4M14 7l3-3 3 3" stroke="currentColor" strokeWidth="1.8"/></svg> },
              { id: 'style', label: 'Stil', tooltip: 'Forbedre stil\nGjør teksten klarere', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/><circle cx="8.5" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="11.5" r="1" fill="currentColor" stroke="none"/></svg> },
            ].map(action => (
              <Tip key={action.id} text={action.tooltip}>
                <BigBtn
                  icon={loading && loadingAction === action.id ? <LoadingDots /> : action.icon}
                  label=""
                  onClick={() => onAction(action.id)}
                  disabled={loading}
                />
              </Tip>
            ))}
            {canUndo && (
              <Tip text="Angre siste AI-endring">
                <BigBtn icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>} label="" onClick={onUndo} />
              </Tip>
            )}
          </div>
        </Group>

      </div>
    </div>
  );
}
