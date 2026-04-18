import React, { useState } from 'react';

type Props = {
  conflictId: number | null;
  onSubmit: (conflictId: number, payload: { outcome: 'uphold' | 'dismiss'; outcome_note: string; evidence_url?: string }) => void;
};

export const ConflictOutcomeForm = ({ conflictId, onSubmit }: Props) => {
  const [outcome, setOutcome] = useState<'uphold' | 'dismiss'>('uphold');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  return (
    <div className="card">
      <h3>Record Conflict Outcome</h3>
      <div className="grid">
        <label>
          Outcome
          <select value={outcome} onChange={(event) => setOutcome(event.target.value as 'uphold' | 'dismiss')}>
            <option value="uphold">Uphold conflict</option>
            <option value="dismiss">Dismiss conflict</option>
          </select>
        </label>

        <label>
          Outcome note
          <textarea value={outcomeNote} onChange={(event) => setOutcomeNote(event.target.value)} />
        </label>

        <label>
          Evidence URL (optional)
          <input value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} />
        </label>

        <button
          className="btn"
          disabled={!conflictId || !outcomeNote.trim()}
          onClick={() => {
            if (!conflictId) {
              return;
            }

            onSubmit(conflictId, {
              outcome,
              outcome_note: outcomeNote,
              evidence_url: evidenceUrl || undefined,
            });
          }}
        >
          Save outcome
        </button>
      </div>
    </div>
  );
};
