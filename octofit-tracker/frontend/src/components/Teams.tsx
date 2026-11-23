import { CapabilityCard } from './CapabilityCard.js';

type Team = {
  name: string;
  mascot?: string;
  members?: string[];
};

export default function Teams() {
  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      responseKey="teams"
      emptyText="No teams found."
      renderItem={(team) => (
        <span>{team.name}{team.members?.length ? ` - ${team.members.join(', ')}` : ''}</span>
      )}
    />
  );
}
