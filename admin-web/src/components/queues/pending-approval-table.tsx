import React from 'react';

type PendingMarket = {
  id: number;
  title: string;
  category: string;
  created_at?: string;
};

type Props = {
  rows: PendingMarket[];
  onApprove: (marketId: number) => void;
  onReject: (marketId: number) => void;
};

export const PendingApprovalTable = ({ rows, onApprove, onReject }: Props) => {
  return (
    <div className="card">
      <h3>Pending Approvals</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Market</th>
            <th>Category</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4}>No pending approvals.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.title}</td>
                <td>{row.category}</td>
                <td>{row.created_at ? new Date(row.created_at).toLocaleString() : '--'}</td>
                <td>
                  <button className="btn" onClick={() => onApprove(row.id)}>
                    Approve
                  </button>{' '}
                  <button className="btn" onClick={() => onReject(row.id)}>
                    Reject
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
