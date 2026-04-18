import React from 'react';

type Slice = {
  label: string;
  value: number;
};

type Props = {
  slices: Slice[];
};

export const OutcomeBreakdownChart = ({ slices }: Props) => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;

  return (
    <div className="card">
      <h3>Conflict Outcome Breakdown</h3>
      {slices.length === 0 ? (
        <p>No conflict outcomes yet.</p>
      ) : (
        <div className="grid">
          {slices.map((slice) => (
            <div key={slice.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>{slice.label}</span>
                <span>{slice.value}</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: 999, overflow: 'hidden', height: 8 }}>
                <div style={{ width: `${(slice.value / total) * 100}%`, height: 8, background: '#34d399' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
