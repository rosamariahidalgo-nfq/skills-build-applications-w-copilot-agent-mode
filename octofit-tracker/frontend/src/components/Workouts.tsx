import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = {
  title: string;
  reason?: string;
};

export default function Workouts() {
  const [items, setItems] = useState<WorkoutSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: WorkoutSuggestion[] }>('/api/workouts/suggestions/mona%40example.com')
      .then((response) => {
        if (active) setItems(response.suggestions ?? []);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load data');
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      emptyText="No workout suggestions found."
      items={items}
      error={error}
      renderItem={(suggestion) => (
        <span>{suggestion.title}{suggestion.reason ? ` - ${suggestion.reason}` : ''}</span>
      )}
    />
  );
}
