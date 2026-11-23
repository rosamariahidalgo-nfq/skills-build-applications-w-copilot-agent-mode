import { CapabilityCard } from './CapabilityCard.js';

type Activity = {
  type: string;
  minutes?: number;
  points?: number;
};

export default function Activities() {
  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      responseKey="activities"
      emptyText="No activities found."
      renderItem={(activity) => (
        <span>{activity.type}{activity.minutes !== undefined ? ` - ${activity.minutes} minutes` : ''}{activity.points !== undefined ? ` - ${activity.points} points` : ''}</span>
      )}
    />
  );
}
