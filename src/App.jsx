import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { callOllama } from './ollama.js';
import Toolbar from './Toolbar.jsx';
import DiffView from './DiffView.jsx';
import GenerateModal from './GenerateModal.jsx';

const DEFAULT_FONT = 'Georgia, serif';

export default function App() {
  const [font, setFont] = useState(DEFAULT_FONT);
  const [variant, setVariant] = useState('bokmal');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);
  const [diffState, setDiffState] = useState(null);
  const [lastAiChange, setLastAiChange] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Begynn å skrive her…' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    editorProps: { attributes: { class: 'tiptap', spellcheck: 'true' } },
  });

  const handleFontChange = useCallback(newFont => {
    setFont(newFont);
    if (editor) editor.view.dom.style.fontFamily = newFont;
  }, [editor]);

  const handleVariantChange = useCallback(newVariant => {
    setVariant(newVariant);
    if (editor) editor.view.dom.setAttribute('lang', newVariant === 'bokmal' ? 'nb' : 'nn');
  }, [editor]);

  const runAction = useCallback(async (actionId, extraPrompt) => {
    if (!editor || loading) return;
    setError(null);

    const { from, to, empty } = editor.state.selection;
    const isGenerate = actionId === 'generate';

    // Generate always uses full doc as context and appends at end
    const fullDocText = editor.getText({ blockSeparator: '\n\n' });
    const docEnd = editor.state.doc.content.size - 1;

    let inputText;
    let selFrom, selTo;

    if (isGenerate) {
      inputText = fullDocText;
      selFrom = docEnd;
      selTo = docEnd;
    } else if (!empty) {
      inputText = editor.state.doc.textBetween(from, to, '\n');
      selFrom = from; selTo = to;
    } else {
      inputText = fullDocText;
      selFrom = 1; selTo = docEnd;
    }

    if (!isGenerate && !inputText.trim()) {
      setError('Ingen tekst å behandle. Skriv noe eller velg tekst.');
      return;
    }

    setLoading(true);
    setLoadingAction(actionId);

    try {
      const revised = await callOllama(actionId, inputText, extraPrompt);
      setDiffState({
        original: isGenerate ? '' : inputText,
        revised: revised.trim(),
        from: selFrom,
        to: selTo,
        isGenerate,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  }, [editor, loading]);

  const handleAction = useCallback(actionId => {
    if (actionId === 'generate') {
      setShowGenerateModal(true);
    } else {
      runAction(actionId);
    }
  }, [runAction]);

  const handleGenerateConfirm = useCallback(prompt => {
    setShowGenerateModal(false);
    runAction('generate', prompt);
  }, [runAction]);

  const handleAcceptDiff = useCallback(() => {
    if (!diffState || !editor) return;
    const { original, revised, from, to, isGenerate } = diffState;

    if (isGenerate) {
      editor.chain().focus().insertContentAt(to, '\n\n' + revised).run();
      setLastAiChange({ type: 'generate', at: to, length: revised.length + 2 });
    } else {
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, revised).run();
      setLastAiChange({ type: 'replace', from, to, original, revised });
    }
    setDiffState(null);
  }, [diffState, editor]);

  const handleUndo = useCallback(() => {
    if (!lastAiChange || !editor) return;
    const { type, from, original, revised, at, length } = lastAiChange;
    if (type === 'replace') {
      editor.chain().focus().deleteRange({ from, to: from + revised.length }).insertContentAt(from, original).run();
    } else if (type === 'generate') {
      editor.chain().focus().deleteRange({ from: at, to: at + length }).run();
    }
    setLastAiChange(null);
  }, [lastAiChange, editor]);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#b0b0b0' }}>
      <Toolbar
        loading={loading}
        loadingAction={loadingAction}
        font={font}
        onFontChange={handleFontChange}
        variant={variant}
        onVariantChange={handleVariantChange}
        onAction={handleAction}
        canUndo={!!lastAiChange}
        onUndo={handleUndo}
        editor={editor}
      />

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center justify-between">
          <span className="text-sm text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xl leading-none ml-4">×</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto" style={{ background: '#c8c8c8', padding: '32px 0' }}>
        <div
          className="mx-auto bg-white"
          style={{
            maxWidth: '794px',
            minHeight: '1122px',
            padding: '96px 96px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)',
            fontFamily: font,
          }}
        >
          <EditorContent editor={editor} style={{ fontFamily: font }} />
        </div>
      </div>

      {editor && (
        <div
          className="text-xs text-right px-6 py-1 select-none flex items-center justify-between"
          style={{ background: '#2B579A', color: 'rgba(255,255,255,0.85)', borderTop: '1px solid #1e4080', height: 24 }}
        >
          <span style={{ opacity: 0.7 }}>Side 1 av 1</span>
          <span>{countWords(editor.getText())} ord</span>
        </div>
      )}

      {showGenerateModal && (
        <GenerateModal
          onConfirm={handleGenerateConfirm}
          onCancel={() => setShowGenerateModal(false)}
        />
      )}

      {diffState && (
        <DiffView
          original={diffState.original}
          revised={diffState.revised}
          isGenerate={diffState.isGenerate}
          onAccept={handleAcceptDiff}
          onReject={() => setDiffState(null)}
        />
      )}
    </div>
  );
}

function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
