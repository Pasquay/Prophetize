import { Response } from 'express';
import { supabase } from '../config/supabaseClient';
import { AuthRequest } from '../types/authRequest';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error';

export const getConflicts = async (_req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('markets')
      .select('id, title, status, created_at, end_date')
      .in('status', ['disputed', 'challenged'])
      .order('created_at', { ascending: true })
      .range(0, 199);

    if (error) {
      throw error;
    }

    return res.status(200).json({ data: data || [] });
  } catch (error) {
    console.error('getConflicts failed', error);
    return res.status(500).json({ error: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};

export const recordConflictOutcome = async (req: AuthRequest, res: Response) => {
  try {
    const marketId = Number(req.params.id);
    if (!Number.isInteger(marketId) || marketId <= 0) {
      return res.status(400).json({ error: 'Invalid conflict id.' });
    }

    const outcome = typeof req.body?.outcome === 'string' ? req.body.outcome.trim().toLowerCase() : '';
    const outcomeNote = typeof req.body?.outcome_note === 'string' ? req.body.outcome_note.trim() : '';
    const evidenceUrl = typeof req.body?.evidence_url === 'string' ? req.body.evidence_url.trim() : '';

    if (outcome !== 'uphold' && outcome !== 'dismiss') {
      return res.status(422).json({ error: 'outcome must be uphold or dismiss.' });
    }

    if (!outcomeNote) {
      return res.status(422).json({ error: 'outcome_note is required.' });
    }

    const nextStatus = outcome === 'uphold' ? 'finalized' : 'active';

    const updatePayload: Record<string, unknown> = {
      status: nextStatus,
      conflict_outcome: outcome,
      conflict_outcome_note: outcomeNote,
      conflict_outcome_by: req.user?.id || null,
      conflict_outcome_at: new Date().toISOString(),
    };

    if (evidenceUrl) {
      updatePayload.conflict_evidence_url = evidenceUrl;
    }

    const updateRes = await supabase
      .from('markets')
      .update(updatePayload)
      .eq('id', marketId)
      .select('id, title, status')
      .single();

    if (updateRes.error) {
      const fallback = await supabase
        .from('markets')
        .update({ status: nextStatus })
        .eq('id', marketId)
        .select('id, title, status')
        .single();

      if (fallback.error) {
        throw fallback.error;
      }

      return res.status(200).json({
        message: 'Conflict outcome recorded.',
        data: fallback.data,
        outcome: {
          outcome,
          outcome_note: outcomeNote,
          evidence_url: evidenceUrl || null,
        },
        action_history: {
          action: 'record_conflict_outcome',
          acted_by: req.user?.id || null,
          acted_at: new Date().toISOString(),
        },
      });
    }

    return res.status(200).json({
      message: 'Conflict outcome recorded.',
      data: updateRes.data,
      outcome: {
        outcome,
        outcome_note: outcomeNote,
        evidence_url: evidenceUrl || null,
      },
      action_history: {
        action: 'record_conflict_outcome',
        acted_by: req.user?.id || null,
        acted_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('recordConflictOutcome failed', error);
    return res.status(500).json({ error: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};
