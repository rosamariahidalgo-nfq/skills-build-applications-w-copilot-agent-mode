import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Team = {
  name: string;
  mascot?: string;
  members?: string[];
};

export default function Teams() {
  const [items, setItems] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then((response) => {
        if (active) setItems(response.teams ?? []);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load data');
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      emptyText="No teams found."
      items={items}
      error={error}
      renderItem={(team) => (
        <span>{team.name}{team.members?.length ? ` - ${team.members.join(', ')}` : ''}</span>
      )}
    />
  );
}
