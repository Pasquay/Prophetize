import React, { useEffect, useState } from 'react';
import { AdminShell } from './components/layout/admin-shell';
import { ReactBitsHero } from './components/layout/reactbits-hero';
import { PendingApprovalTable } from './components/queues/pending-approval-table';
import { DueResolutionTable } from './components/queues/due-resolution-table';
import { ConflictQueuePage } from './pages/conflicts/conflict-queue-page';
import { ConflictDetailDrawer } from './components/conflicts/conflict-detail-drawer';
import { ConflictOutcomeForm } from './components/conflicts/conflict-outcome-form';
import { OperationsOverviewPage } from './pages/analytics/operations-overview-page';
import { ConflictOutcomesPage } from './pages/analytics/conflict-outcomes-page';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import {
  ApiError,
  apiGet,
  apiPost,
  getApiBaseUrl,
  getStoredAdminToken,
  setStoredAdminToken,
} from './lib/http';

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
  const [tokenInput, setTokenInput] = useState(getStoredAdminToken());
  const [pending, setPending] = useState<MarketRow[]>([]);
  const [due, setDue] = useState<MarketRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictRow[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ConflictRow | null>(null);
  const [opsMetrics, setOpsMetrics] = useState<OperationsAnalyticsResponse['data']>(EMPTY_OPS_METRICS);
  const [conflictMetrics, setConflictMetrics] = useState<ConflictAnalyticsResponse['data']>(EMPTY_CONFLICT_METRICS);

  const isAuthed = Boolean(getStoredAdminToken());

  const normalizeErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof ApiError) {
      if (err.status === 401 || err.status === 403) {
        return 'Unauthorized. Save a valid admin token to access protected admin endpoints.';
      }

      return `${err.message} (HTTP ${err.status})`;
    }

    if (err instanceof Error) {
      return err.message;
    }

    return fallback;
  };

  const loadQueues = async () => {
    const token = getStoredAdminToken();
    if (!token) {
      setError('No admin token found. Paste a token below and click Save token.');
      setPending([]);
      setDue([]);
      setConflicts([]);
      setOpsMetrics(EMPTY_OPS_METRICS);
      setConflictMetrics(EMPTY_CONFLICT_METRICS);
      return;
    }

    try {
      setIsLoading(true);
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
      setError(normalizeErrorMessage(err, 'Failed to load queues'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadQueues();
  }, []);

  const review = async (marketId: number, action: 'approve' | 'reject') => {
    try {
      setStatusNotice(null);
      await apiPost(`/admin/markets/${marketId}/review`, { action });
      setStatusNotice(`Market ${action}d.`);
      await loadQueues();
    } catch (err) {
      setError(normalizeErrorMessage(err, 'Review failed'));
    }
  };

  const resolve = async (
    marketId: number,
    payload: { resolved_option_id: number; resolution_evidence_url: string; resolution_note: string }
  ) => {
    try {
      setStatusNotice(null);
      await apiPost(`/admin/markets/${marketId}/resolve`, payload);
      setStatusNotice('Market resolved successfully.');
      await loadQueues();
    } catch (err) {
      setError(normalizeErrorMessage(err, 'Resolve failed'));
    }
  };

  const saveConflictOutcome = async (
    conflictId: number,
    payload: { outcome: 'uphold' | 'dismiss'; outcome_note: string; evidence_url?: string }
  ) => {
    try {
      setStatusNotice(null);
      await apiPost(`/admin/conflicts/${conflictId}/outcome`, payload);
      setStatusNotice('Conflict outcome saved.');
      await loadQueues();
      setSelectedConflict(null);
    } catch (err) {
      setError(normalizeErrorMessage(err, 'Conflict update failed'));
    }
  };

  const saveToken = async () => {
    setStoredAdminToken(tokenInput);
    setStatusNotice('Admin token saved. Refreshing queues...');
    await loadQueues();
  };

  const clearToken = () => {
    setStoredAdminToken('');
    setTokenInput('');
    setStatusNotice('Admin token cleared.');
    setError('No admin token found. Paste a token below and click Save token.');
    setPending([]);
    setDue([]);
    setConflicts([]);
    setOpsMetrics(EMPTY_OPS_METRICS);
    setConflictMetrics(EMPTY_CONFLICT_METRICS);
    setSelectedConflict(null);
  };

  return (
    <AdminShell>
      <div className="grid">
        <ReactBitsHero
          pendingCount={opsMetrics.pending_count}
          dueCount={opsMetrics.due_resolution_count}
          openConflicts={conflictMetrics.open_conflicts}
        />

        <Card className="toolbar">
          <CardHeader>
            <CardTitle className="toolbar-title">Admin Access</CardTitle>
            <CardDescription className="toolbar-copy">API Base: {getApiBaseUrl()}</CardDescription>
          </CardHeader>
          <CardContent className="toolbar-actions">
            <Input
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              placeholder="Paste admin bearer token"
            />
            <Button variant="default" onClick={() => void saveToken()}>
              Save token
            </Button>
            <Button variant="secondary" onClick={clearToken}>
              Clear
            </Button>
            <Button variant="ghost" onClick={() => void loadQueues()}>
              Refresh
            </Button>
          </CardContent>
        </Card>

        {statusNotice ? <div className="card card--ok">{statusNotice}</div> : null}
        {error ? <div className="card card--error">Error: {error}</div> : null}

        {isLoading ? <div className="card card--loading">Loading admin queues...</div> : null}

        {!isAuthed ? (
          <section className="card onboarding-note">
            <h3>Getting started</h3>
            <p>
              This dashboard calls protected admin endpoints. Add a valid admin bearer token above to unlock moderation
              queues and analytics.
            </p>
          </section>
        ) : null}

        <section id="operations" className="grid section-group">
          <h2 className="section-title">Operations Queue</h2>
          <PendingApprovalTable
            rows={pending}
            onApprove={(id) => void review(id, 'approve')}
            onReject={(id) => void review(id, 'reject')}
          />
        </section>

        <section id="resolutions" className="grid section-group">
          <h2 className="section-title">Due Resolution</h2>
          <DueResolutionTable rows={due} onResolve={(id, payload) => void resolve(id, payload)} />
        </section>

        <section id="conflicts" className="grid section-group">
          <h2 className="section-title">Conflict Management</h2>
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
        </section>

        <section id="analytics" className="grid section-group">
          <h2 className="section-title">Analytics</h2>
          <OperationsOverviewPage metrics={opsMetrics} />
          <ConflictOutcomesPage metrics={conflictMetrics} />
        </section>
      </div>
    </AdminShell>
  );
};

export default App;
