import { getPracticeLeaderboard } from "@/services/forum/stats/GameStatsService";
import Image from "next/image";
import Link from "next/link";

export default async function PracticeLeaderboardPage() {
  const [leaderboard, status, error] = await getPracticeLeaderboard();
  if (!leaderboard) return <div>Error loading leaderboard</div>;

  // Get all stat categories (e.g., ELO, etc.)
  const categories = Object.keys(leaderboard.entries);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-center">Practice Leaderboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => (
          <div key={category} className="card bg-base-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{category}</h2>
            <ul>
              {leaderboard.entries[category].map((entry, idx) => (
                <li key={entry.uuid} className="flex items-center gap-3 mb-2">
                  <span className="w-6 text-right">{idx + 1}.</span>
                  <Image
                    src={`https://skins.mcstats.com/skull/${entry.uuid}`}
                    alt={entry.resolvedName}
                    width={32}
                    height={32}
                  />
                  <Link href={`/u/${entry.resolvedName}`}>
                    <span style={{ color: entry.webColor }} className="font-bold">{entry.resolvedName}</span>
                  </Link>
                  <span className="ml-auto">{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
