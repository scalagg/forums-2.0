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

export interface PracticeProfile {
  id: string;
  botDivision: string;
  botStatistics: Record<string, any>;
  customLoadouts: Record<string, any>;
  favoriteKits: string[];
  globalStatistics: Record<string, any>;
  identifier: string;
  rankedBan: any;
  rankedStatistics: Record<string, any>;
  unrankedStatistics: Record<string, any>;
}

export const getPracticeLeaderboard = async (
  uuid: string,
  client: HTTPClient = new HTTPClient(process.env.API_URL!)
) =>
  await client.GetAsync<PracticeProfile>(`/practiceprofile/identifier/${uuid}`);

export const getPracticeProfile = async (
  uuid: string,
  client: HTTPClient = new HTTPClient(process.env.API_URL!)
): Promise<[PracticeProfile | null, number, string | null]> => {
  return await client.GetAsync<PracticeProfile>(`/practiceprofile/identifier/${uuid}`);
};
