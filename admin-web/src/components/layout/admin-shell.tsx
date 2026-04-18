import React from 'react';

type Props = {
  children: React.ReactNode;
};

export const AdminShell = ({ children }: Props) => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Prophetize Admin</h2>
        <p>
          <span className="badge">Operations First</span>
        </p>
        <nav>
          <div>Markets Queue</div>
          <div>Due Resolution</div>
          <div>Conflicts</div>
          <div>Analytics (Wave 2)</div>
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
};
