import React from 'react';
import { KpiGrid } from '../../components/analytics/kpi-grid';
import { QueueThroughputChart } from '../../components/analytics/queue-throughput-chart';

type Props = {
  metrics: {
    pending_count: number;
    due_resolution_count: number;
    resolved_last_24h: number;
    throughput: Array<{ label: string; value: number }>;
  };
};

export const OperationsOverviewPage = ({ metrics }: Props) => {
  return (
    <div className="grid">
      <KpiGrid
        items={[
          { label: 'Pending approvals', value: String(metrics.pending_count) },
          { label: 'Due resolutions', value: String(metrics.due_resolution_count) },
          { label: 'Resolved last 24h', value: String(metrics.resolved_last_24h) },
        ]}
      />
      <QueueThroughputChart title="Moderation Throughput" points={metrics.throughput} />
    </div>
  );
};
