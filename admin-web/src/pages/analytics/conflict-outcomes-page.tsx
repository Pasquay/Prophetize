import React from 'react';
import { OutcomeBreakdownChart } from '../../components/analytics/outcome-breakdown-chart';

type Props = {
  metrics: {
    open_conflicts: number;
    closed_conflicts: number;
    outcomes: Array<{ label: string; value: number }>;
  };
};

export const ConflictOutcomesPage = ({ metrics }: Props) => {
  return (
    <div className="grid">
      <div className="card">
        <h3>Conflict Health</h3>
        <p>Open conflicts: {metrics.open_conflicts}</p>
        <p>Closed conflicts: {metrics.closed_conflicts}</p>
      </div>
      <OutcomeBreakdownChart slices={metrics.outcomes} />
    </div>
  );
};
