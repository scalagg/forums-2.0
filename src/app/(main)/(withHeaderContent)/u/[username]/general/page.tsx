import { getPracticeLeaderboard } from "@/services/forum/stats/GameStatsService";
import { getUuid } from "@/services/forum/account/AccountService";
import StatsWidget from "./StatsWidget";

interface PageProps {
  params: { username: string };
}

export default async function PracticeLeaderboardPage({ params }: PageProps) {
  const username = params.username;
  const uuid = await getUuid(username);

  if (!uuid) return <div>Error: No UUID provided</div>;

  const [profile, status, error] = await getPracticeLeaderboard(uuid);
  if (!profile) return <div>Error loading practice stats</div>;

  const globalStats = profile.globalStatistics || {};
  const rankedStats = profile.rankedStatistics || {};

  // Prepare entries for the widget
  const globalEntries = Object.entries(globalStats).map(
    ([key, value]) => `${key}: ${value}`
  );
  const rankedEntries = Object.entries(rankedStats).map(
    ([kit, stats]) => `${kit}: ELO ${stats.elo ?? 'N/A'}`
  );

  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="text-2xl font-bold text-center">Practice Stats</h1>
      <div className="flex flex-wrap gap-8 justify-center">
        <StatsWidget
          title="Global Stats"
          entries={globalEntries}
          backgroundImage="/img/practice-bg.webp"
        />
        <StatsWidget
          title="Ranked Stats (ELO)"
          entries={rankedEntries}
          backgroundImage="/img/practice-bg.webp"
        />
      </div>
    </div>
  );
}
