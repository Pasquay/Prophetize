import React from 'react';

type KpiItem = {
  label: string;
  value: string;
};

type Props = {
  items: KpiItem[];
};

export const KpiGrid = ({ items }: Props) => {
  return (
    <div className="card">
      <h3>Operations KPIs</h3>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {items.map((item) => (
          <div key={item.label} className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
