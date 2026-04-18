import React, { useEffect, useState } from 'react';
import { AdminShell } from './components/layout/admin-shell';
import { PendingApprovalTable } from './components/queues/pending-approval-table';
import { DueResolutionTable } from './components/queues/due-resolution-table';
import { ConflictQueuePage } from './pages/conflicts/conflict-queue-page';
import { ConflictDetailDrawer } from './components/conflicts/conflict-detail-drawer';
import { ConflictOutcomeForm } from './components/conflicts/conflict-outcome-form';
import { OperationsOverviewPage } from './pages/analytics/operations-overview-page';
import { ConflictOutcomesPage } from './pages/analytics/conflict-outcomes-page';
import { apiGet, apiPost } from './lib/http';

type MarketRow = {
  id: number;
  title: string;
  category: string;
  created_at?: string;
  end_date?: string;
};

type ConflictRow = {
  id: number;
  title: string;
  status: string;
  created_at?: string;
};

type QueueResponse = {
  data: MarketRow[];
};

type ConflictQueueResponse = {
  data: ConflictRow[];
};

type OperationsAnalyticsResponse = {
  data: {
    pending_count: number;
    due_resolution_count: number;
    resolved_last_24h: number;
    throughput: Array<{ label: string; value: number }>;
  };
};

type ConflictAnalyticsResponse = {
  data: {
    open_conflicts: number;
    closed_conflicts: number;
    outcomes: Array<{ label: string; value: number }>;
  };
};

const EMPTY_OPS_METRICS: OperationsAnalyticsResponse['data'] = {
  pending_count: 0,
  due_resolution_count: 0,
  resolved_last_24h: 0,
  throughput: [],
};

const EMPTY_CONFLICT_METRICS: ConflictAnalyticsResponse['data'] = {
  open_conflicts: 0,
  closed_conflicts: 0,
  outcomes: [],
};

const App = () => {
  const [pending, setPending] = useState<MarketRow[]>([]);
  const [due, setDue] = useState<MarketRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<ConflictRow[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ConflictRow | null>(null);
  const [opsMetrics, setOpsMetrics] = useState<OperationsAnalyticsResponse['data']>(EMPTY_OPS_METRICS);
  const [conflictMetrics, setConflictMetrics] = useState<ConflictAnalyticsResponse['data' ]>(EMPTY_CONFLICT_METRICS);

  const loadQueues = async () => {
    try {
      setError(null);
      const [pendingRes, dueRes] = await Promise.all([
        apiGet<QueueResponse>('/admin/markets/pending'),
        apiGet<QueueResponse>('/admin/markets/due-resolution'),
      ]);
      const conflictsRes = await apiGet<ConflictQueueResponse>('/admin/conflicts');
      const operationsRes = await apiGet<OperationsAnalyticsResponse>('/admin/analytics/operations');
      const conflictAnalyticsRes = await apiGet<ConflictAnalyticsResponse>('/admin/analytics/conflicts');

      setPending(pendingRes.data || []);
      setDue(dueRes.data || []);
      setConflicts(conflictsRes.data || []);
      setOpsMetrics(operationsRes.data || EMPTY_OPS_METRICS);
      setConflictMetrics(conflictAnalyticsRes.data || EMPTY_CONFLICT_METRICS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queues');
    }
  };

  useEffect(() => {
    void loadQueues();
  }, []);

  const review = async (marketId: number, action: 'approve' | 'reject') => {
    try {
      await apiPost(`/admin/markets/${marketId}/review`, { action });
      await loadQueues();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
    }
  };

  const resolve = async (
    marketId: number,
    payload: { resolved_option_id: number; resolution_evidence_url: string; resolution_note: string }
  ) => {
    try {
      await apiPost(`/admin/markets/${marketId}/resolve`, payload);
      await loadQueues();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resolve failed');
    }
  };

  const saveConflictOutcome = async (
    conflictId: number,
    payload: { outcome: 'uphold' | 'dismiss'; outcome_note: string; evidence_url?: string }
  ) => {
    try {
      await apiPost(`/admin/conflicts/${conflictId}/outcome`, payload);
      await loadQueues();
      setSelectedConflict(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conflict update failed');
    }
  };

  return (
    <AdminShell>
      <div className="grid">
        {error ? <div className="card">Error: {error}</div> : null}
        <PendingApprovalTable rows={pending} onApprove={(id) => void review(id, 'approve')} onReject={(id) => void review(id, 'reject')} />
        <DueResolutionTable rows={due} onResolve={(id, payload) => void resolve(id, payload)} />
        <ConflictQueuePage
          rows={conflicts}
          selectedId={selectedConflict?.id ?? null}
          onSelect={(row) => setSelectedConflict(row)}
        />
        <ConflictDetailDrawer selected={selectedConflict} />
        <ConflictOutcomeForm
          conflictId={selectedConflict?.id ?? null}
          onSubmit={(id, payload) => void saveConflictOutcome(id, payload)}
        />
        <OperationsOverviewPage metrics={opsMetrics} />
        <ConflictOutcomesPage metrics={conflictMetrics} />
      </div>
    </AdminShell>
  );
};

export default App;
