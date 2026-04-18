import React from 'react';

type ConflictRecord = {
  id: number;
  title: string;
  status: string;
  created_at?: string;
};

type Props = {
  selected: ConflictRecord | null;
};

export const ConflictDetailDrawer = ({ selected }: Props) => {
  return (
    <div className="card">
      <h3>Conflict Detail</h3>
      {!selected ? (
        <p>Select a conflict from the queue to inspect details.</p>
      ) : (
        <div>
          <p>
            <strong>{selected.title}</strong>
          </p>
          <p>Status: {selected.status}</p>
          <p>Created: {selected.created_at ? new Date(selected.created_at).toLocaleString() : '--'}</p>
        </div>
      )}
    </div>
  );
};
