import React from 'react';
import { Badge } from '../ui/badge';

type Props = {
  children: React.ReactNode;
};

export const AdminShell = ({ children }: Props) => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Prophetize Admin</h1>
        <p className="sidebar-subtitle">Moderation, conflicts, and operational analytics in one place.</p>
        <p>
          <Badge variant="muted">Operations First</Badge>
        </p>
        <nav className="sidebar-nav">
          <a href="#operations">Markets Queue</a>
          <a href="#resolutions">Due Resolution</a>
          <a href="#conflicts">Conflicts</a>
          <a href="#analytics">Analytics</a>
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
};
