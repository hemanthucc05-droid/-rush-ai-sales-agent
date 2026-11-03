export default function Loading() {
  return (
    <main className="app-shell" aria-busy="true" aria-label="Loading RUSH workspace">
      <aside className="sidebar loading-sidebar">
        <div className="brand">RUSH <span>AI</span></div>
        <div className="loading-line loading-workspace" />
        <div className="loading-nav">
          {Array.from({ length: 6 }).map((_, index) => <div className="loading-line" key={index} />)}
        </div>
      </aside>
      <section className="main-panel">
        <header className="topbar"><div className="loading-line loading-crumb" /><div className="loading-line loading-status" /></header>
        <div className="page-content loading-content">
          <div className="loading-heading"><div className="loading-line loading-eyebrow" /><div className="loading-line loading-title" /><div className="loading-line loading-subtitle" /></div>
          <div className="loading-stats">{Array.from({ length: 4 }).map((_, index) => <div className="loading-card" key={index}><div className="loading-line loading-card-label" /><div className="loading-line loading-card-value" /><div className="loading-line loading-card-foot" /></div>)}</div>
          <div className="loading-table"><div className="loading-line loading-table-title" />{Array.from({ length: 5 }).map((_, index) => <div className="loading-row" key={index}><div className="loading-line" /><div className="loading-line" /><div className="loading-line" /><div className="loading-line" /></div>)}</div>
        </div>
      </section>
    </main>
  );
}
