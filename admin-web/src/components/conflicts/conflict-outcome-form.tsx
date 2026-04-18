import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';

type Props = {
  conflictId: number | null;
  onSubmit: (conflictId: number, payload: { outcome: 'uphold' | 'dismiss'; outcome_note: string; evidence_url?: string }) => void;
};

export const ConflictOutcomeForm = ({ conflictId, onSubmit }: Props) => {
  const [outcome, setOutcome] = useState<'uphold' | 'dismiss'>('uphold');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Conflict Outcome</CardTitle>
      </CardHeader>
      <CardContent className="grid">
      <div className="grid">
        <label>
          Outcome
          <Select value={outcome} onChange={(event) => setOutcome(event.target.value as 'uphold' | 'dismiss')}>
            <option value="uphold">Uphold conflict</option>
            <option value="dismiss">Dismiss conflict</option>
          </Select>
        </label>

        <label>
          Outcome note
          <Textarea value={outcomeNote} onChange={(event) => setOutcomeNote(event.target.value)} />
        </label>

        <label>
          Evidence URL (optional)
          <Input value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} />
        </label>

        <Button
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
        </Button>
      </div>
      </CardContent>
    </Card>
  );
};
