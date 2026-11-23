import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = {
  title: string;
  reason?: string;
};

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona%40example.com"
      responseKey="suggestions"
      emptyText="No workout suggestions found."
      renderItem={(suggestion) => (
        <span>{suggestion.title}{suggestion.reason ? ` - ${suggestion.reason}` : ''}</span>
      )}
    />
  );
}
