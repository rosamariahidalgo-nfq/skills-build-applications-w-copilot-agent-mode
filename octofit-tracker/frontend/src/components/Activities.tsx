import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Activity = {
  type: string;
  minutes?: number;
  points?: number;
};

export default function Activities() {
  const [items, setItems] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((response) => {
        if (active) setItems(response.activities ?? []);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load data');
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      emptyText="No activities found."
      items={items}
      error={error}
      renderItem={(activity) => (
        <span>{activity.type}{activity.minutes !== undefined ? ` - ${activity.minutes} minutes` : ''}{activity.points !== undefined ? ` - ${activity.points} points` : ''}</span>
      )}
    />
  );
}
