import { getPracticeLeaderboard } from "@/services/forum/stats/GameStatsService";
import { getUuid } from "@/services/forum/account/AccountService";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-center">Practice Stats</h1>
      <div className="card bg-base-200 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Global Stats</h2>
        <ul>
          {Object.entries(globalStats).map(([key, value]) => (
            <li key={key} className="flex gap-2">
              <span className="font-bold">{key}:</span> <span>{value as any}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card bg-base-200 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Ranked Stats (ELO)</h2>
        <ul>
          {Object.entries(rankedStats).map(([kit, stats]) => (
            <li key={kit} className="flex gap-2">
              <span className="font-bold">{kit}:</span> <span>ELO: {(stats as any).elo ?? 'N/A'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
