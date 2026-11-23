import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      responseKey="leaderboard"
      emptyText="No leaderboard rankings found."
      renderItem={(entry) => (
        <span>{entry.rank}. {entry.teamName} - {entry.totalPoints} points</span>
      )}
    />
  );
}
