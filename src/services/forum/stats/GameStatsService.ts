import HTTPClient from "@/libs/HTTPClient";

export interface LeaderboardEntry {
  uuid: string;
  value: string;
  webColor: string;
  resolvedName: string;
}

export interface LeaderboardModel {
  name: string;
  entries: Record<string, LeaderboardEntry[]>;
}

export const getPracticeLeaderboard = async (client: HTTPClient = new HTTPClient(process.env.API_URL!)) =>
  await client.GetAsync<LeaderboardModel>("/leaderboard/Practice");
