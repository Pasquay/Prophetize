import React from 'react';

type ConflictRecord = {
  id: number;
  title: string;
  status: string;
  created_at?: string;
};

type Props = {
  rows: ConflictRecord[];
  selectedId: number | null;
  onSelect: (row: ConflictRecord) => void;
};

export const ConflictQueuePage = ({ rows, selectedId, onSelect }: Props) => {
  return (
    <div className="card">
      <h3>Active Conflicts</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4}>No conflicts currently need review.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.title}</td>
                <td>{row.status}</td>
                <td>{row.created_at ? new Date(row.created_at).toLocaleString() : '--'}</td>
                <td>
                  <button className="btn" onClick={() => onSelect(row)}>
                    {selectedId === row.id ? 'Selected' : 'Select'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
