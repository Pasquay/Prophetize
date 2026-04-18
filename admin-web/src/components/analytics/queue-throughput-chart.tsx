import React from 'react';

type Point = {
  label: string;
  value: number;
};

type Props = {
  title: string;
  points: Point[];
};

export const QueueThroughputChart = ({ title, points }: Props) => {
  const max = Math.max(1, ...points.map((point) => point.value));

  return (
    <div className="card">
      <h3>{title}</h3>
      {points.length === 0 ? (
        <p>No data yet.</p>
      ) : (
        <div className="grid">
          {points.map((point) => (
            <div key={point.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>{point.label}</span>
                <span>{point.value}</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: 999, overflow: 'hidden', height: 8 }}>
                <div style={{ width: `${(point.value / max) * 100}%`, height: 8, background: '#0ea5e9' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
