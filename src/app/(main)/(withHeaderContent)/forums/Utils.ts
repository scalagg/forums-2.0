import { GetProfileFromUuid } from '@/services/controller/ProfileService';
import { GetActiveRanks } from '@/services/controller/GrantService';
import Rank from '@/libs/types/entities/Rank';
import { isResultError, tryParseInt } from '@/libs/Utils';
import Thread from '@/libs/types/entities/Thread';
import HTTPClient from '@/libs/HTTPClient';

export const getAuthorInfo = async (authorId?: string, client?: HTTPClient) => {
  if (!authorId) return;

  const httpClient = client || new HTTPClient(process.env.API_URL!);
  const author: {username: string, rank?: Rank} = {username: '', rank: undefined};
  
  try {
    const profileResult = await GetProfileFromUuid(authorId, httpClient);
    if (Array.isArray(profileResult)) {
      if (isResultError(profileResult)) {
        console.error("Error fetching author profile: HTTP " + profileResult[1]);
        return;
      }
      author.username = profileResult[0]!.name;
    } else {
      if (!profileResult.success) {
        console.error("Error fetching author profile:", profileResult.error);
        return;
      }
      author.username = profileResult.data!.name;
    }

    const ranksResult = await GetActiveRanks(authorId, httpClient);
    if (Array.isArray(ranksResult)) {
      if (isResultError(ranksResult)) {
        console.error("Error fetching author rank: HTTP " + ranksResult[1]);
      } else if (ranksResult[0] && ranksResult[0].length > 0) {
        author.rank = ranksResult[0].sort((a, b) => a.priority - b.priority)[ranksResult[0].length - 1];
      }
    } else {
      if (ranksResult.success && ranksResult.data && ranksResult.data.length > 0) {
        const sortedRanks = ranksResult.data.sort((a, b) => a.priority - b.priority);
        author.rank = sortedRanks[sortedRanks.length - 1];
      }
    }
  } catch (error) {
    console.error("Error in getAuthorInfo:", error);
  }

  return author;
};

export const threadSorter = (a?: Thread, b?: Thread) => {
  const intA = tryParseInt(a?.createdAt);
  const intB = tryParseInt(b?.createdAt);
  return intA && intB ? intB - intA : 0;
};

export const getThreadShortId = (id?: string) => {
  const temp = id?.split('.');
  return temp?.[temp.length - 1];
}