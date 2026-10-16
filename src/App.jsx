import { useEffect, useRef, useState } from 'react';
import {
  Activity, ArrowDown, ArrowUp, AudioLines, Check, ChevronDown, CircleHelp,
  Command, FileText, Menu, Mic, MoreHorizontal, Plus, Search, ShieldCheck,
  Sparkles, SquarePen, X
} from 'lucide-react';

const starterPrompts = [
  { icon: Search, title: 'Find a case', detail: 'Search records by case ID or keyword' },
  { icon: FileText, title: 'Summarize a report', detail: 'Turn a long report into key points' },
  { icon: Activity, title: 'Analyze a pattern', detail: 'Explore trends across incidents' },
];

const demoReply = (message) => {
  const q = message.toLowerCase();
  if (q.includes('case') || q.includes('fir')) return 'I can help organize case information. In the connected version, I would search authorized records and return matching case IDs, dates, status, and assigned station.\n\nFor this demo, no police database is connected yet, so no real records have been queried.';
  if (q.includes('report') || q.includes('summar')) return 'Here’s a useful report structure:\n\n• **Overview:** what happened and when\n• **Key details:** people, location, and evidence\n• **Timeline:** events in chronological order\n• **Open items:** information that still needs verification\n\nPaste a report here and I can help summarize the text you provide.';
  if (q.includes('pattern') || q.includes('trend') || q.includes('analy')) return 'A good first analysis would compare incident counts over time, location, and category. I’d check for missing values and inconsistent labels before drawing conclusions, then show the trend with a chart.\n\nThis demo is not connected to live records or operational data.';
  return `I’m Aloka, your AI workspace assistant. I received: “${message}”\n\nThis interface is running in demo mode. To connect your real assistant, set VITE_API_URL in .env and update the request handler in src/App.jsx to match your FastAPI endpoint.`;
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeThread, setActiveThread] = useState('New conversation');
  const [copied, setCopied] = useState(-1);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [messages, busy]);

  const sendMessage = async (raw = input) => {
    const text = raw.trim();
    if (!text || busy) return;
    setMessages((old) => [...old, { role: 'user', content: text }]);
    setInput('');
    setBusy(true);
    setActiveThread(text.length > 28 ? `${text.slice(0, 28)}…` : text);
    try {
      const base = import.meta.env.VITE_API_URL;
      if (base) {
        const response = await fetch(`${base.replace(/\/$/, '')}/chat`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const data = await response.json();
        setMessages((old) => [...old, { role: 'assistant', content: data.response ?? data.answer ?? data.message ?? 'The API responded, but no response text field was found.' }]);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 850));
        setMessages((old) => [...old, { role: 'assistant', content: demoReply(text) }]);
      }
    } catch (error) {
      setMessages((old) => [...old, { role: 'assistant', content: `I couldn’t reach the API. Check VITE_API_URL and the endpoint in src/App.jsx.\n\nDetails: ${error.message}`, error: true }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const newChat = () => {
    setMessages([]); setInput(''); setActiveThread('New conversation'); setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const copyMessage = async (content, index) => {
    try { await navigator.clipboard.writeText(content); setCopied(index); setTimeout(() => setCopied(-1), 1300); } catch { /* clipboard may be unavailable in insecure contexts */ }
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="grain" />
      {sidebarOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><span /><span /><span /><span /></div>
          <div className="brand-copy"><strong>aloka</strong><span>INTELLIGENCE</span></div>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={17}/></button>
        </div>
        <button className="new-chat-button" onClick={newChat}><SquarePen size={16}/><span>New conversation</span><span className="shortcut">⌘ K</span></button>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-item active"><Activity size={16}/><span>Assistant</span><span className="live-dot"/></button>
        <button className="nav-item" onClick={() => sendMessage('Help me search case records')}><Search size={16}/><span>Case search</span></button>
        <button className="nav-item" onClick={() => sendMessage('Help me summarize a report')}><FileText size={16}/><span>Report summaries</span></button>
        <div className="side-label recent-label">RECENT</div>
        <button className="thread-item" onClick={() => { setMessages([]); setActiveThread('New conversation'); }}><span className="thread-dot"/> {activeThread}</button>
        <div className="sidebar-bottom">
          <div className="secure-card"><div className="secure-icon"><ShieldCheck size={16}/></div><div><strong>Private workspace</strong><span>Demo environment</span></div><span className="secure-status"/></div>
          <button className="profile-row"><div className="avatar">S</div><div className="profile-copy"><strong>Workspace user</strong><span>Personal workspace</span></div><MoreHorizontal size={18} className="muted-icon"/></button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={18}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>Assistant</strong></div></div>
          <div className="topbar-right"><div className="model-picker"><span className="model-spark"><Sparkles size={13}/></span><span>Aloka Core</span><ChevronDown size={14}/></div><button className="icon-button" aria-label="More options" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={19}/></button>{menuOpen && <div className="top-menu"><button onClick={() => { newChat(); setMenuOpen(false); }}>Start a new chat</button><button onClick={() => { setMenuOpen(false); alert('Demo interface · no data is stored by this sample UI.'); }}>About this demo</button></div>}</div>
        </header>

        <section className={`conversation ${messages.length ? 'has-messages' : 'is-empty'}`}>
          {messages.length === 0 ? (
            <div className="welcome-stage">
              <div className="orb-wrap" aria-hidden="true"><div className="orb-halo halo-a"/><div className="orb-halo halo-b"/><div className="orb-ring ring-a"/><div className="orb-ring ring-b"/><div className="orb-core"><div className="orb-shine"/><div className="orb-slit"/></div><div className="orb-particle particle-a"/><div className="orb-particle particle-b"/><div className="orb-particle particle-c"/></div>
              <div className="eyebrow"><span className="eyebrow-dot"/> YOUR INTELLIGENCE WORKSPACE</div>
              <h1>Good afternoon.<br/><span>What are we solving?</span></h1>
              <p className="welcome-subtitle">Think clearly. Find the signal. Move forward.</p>
              <div className="suggestion-grid">{starterPrompts.map(({ icon: Icon, title, detail }) => <button className="suggestion-card" key={title} onClick={() => sendMessage(title === 'Find a case' ? 'Help me find a case' : title === 'Summarize a report' ? 'Help me summarize a report' : 'Help me analyze incident patterns')}><span className="suggestion-icon"><Icon size={17}/></span><span className="suggestion-text"><strong>{title}</strong><small>{detail}</small></span><ArrowUp size={15} className="suggestion-arrow"/></button>)}</div>
            </div>
          ) : (
            <div className="message-list">
              <div className="conversation-date"><span/> TODAY <span/></div>
              {messages.map((message, index) => <article className={`message-row ${message.role} ${message.error ? 'message-error' : ''}`} key={`${index}-${message.role}`}>
                {message.role === 'assistant' ? <div className="mini-brand"><div className="brand-mark tiny"><span/><span/><span/><span/></div></div> : <div className="user-avatar">S</div>}
                <div className="message-content"><div className="message-meta"><strong>{message.role === 'assistant' ? 'Aloka' : 'You'}</strong><span>{message.role === 'assistant' ? 'AI ASSISTANT' : 'JUST NOW'}</span></div><div className="message-text">{message.content.split('\n').map((line, i) => <p key={i}>{line || <>&nbsp;</>}</p>)}</div>{message.role === 'assistant' && <div className="message-actions"><button onClick={() => copyMessage(message.content, index)}>{copied === index ? <Check size={13}/> : <Command size={13}/>} {copied === index ? 'Copied' : 'Copy'}</button><button onClick={() => sendMessage(`Please expand on this answer: ${message.content.slice(0, 180)}`)}><Sparkles size={13}/> Explore further</button></div>}</div>
              </article>)}
              {busy && <div className="message-row assistant"><div className="mini-brand"><div className="brand-mark tiny"><span/><span/><span/><span/></div></div><div className="typing-card"><span/><span/><span/><small>Thinking through it</small></div></div>}
              <div ref={endRef}/>
            </div>
          )}
        </section>

        <footer className="composer-area">
          <form className="composer" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <button type="button" className="composer-plus" aria-label="Add attachment" title="Attachments are a UI placeholder"><Plus size={18}/></button>
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask Aloka anything…" rows={1} aria-label="Message Aloka" />
            <div className="composer-tools"><button type="button" className="icon-button voice-button" aria-label="Voice input is not connected" title="Voice input is not connected"><AudioLines size={17}/></button><button type="submit" className={`send-button ${input.trim() ? 'send-ready' : ''}`} disabled={!input.trim() || busy} aria-label="Send message">{busy ? <span className="send-spinner"/> : <ArrowUp size={18}/>}</button></div>
          </form>
          <div className="composer-caption"><span><ShieldCheck size={12}/> Private by design</span><span>AI can make mistakes. Verify important information.</span></div>
        </footer>
      </main>
    </div>
  );
}
