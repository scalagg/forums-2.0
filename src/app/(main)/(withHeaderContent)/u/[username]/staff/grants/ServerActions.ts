'use server'

import Rank from "@/libs/types/entities/Rank";
import Grant from "@/libs/types/entities/Grant";
import { GetActiveRanks, GetRank, getGrants, getRankColor, getRankFromName } from "@/services/controller/GrantService";
import { getUsernameFromUuid, getUuid } from "@/services/forum/account/AccountService";


export async function getPlayerGrantsInfo(username: string) {
  'use server'

  const uuid = await getUuid(username);
  let grantsResult = await getGrants(uuid);
  let grants: Grant[] = Array.isArray(grantsResult[0]) ? grantsResult[0] : [];
  console.log("Fetched grants raw:", grantsResult);
  console.log("Parsed grants:", grants);

  const uuidToName: { [key: string]: string } = {};
  const rankIdToRank: { [key: string]: Rank } = {};
  const rankIdToColor: { [key: string]: string } = {};
  const uuidToRank: { [key: string]: Rank } = {};

  const CONSOLE = "00000000-0000-0000-0000-000000000000";
  uuidToName[CONSOLE] = "Server/Console";
  uuidToRank[CONSOLE] = {_id: "console"} as Rank;
  rankIdToRank[uuidToRank[CONSOLE]._id] = uuidToRank[CONSOLE];
  rankIdToColor[uuidToRank[CONSOLE]._id] = "teal";

  const updateRankCache = async (rankId: string) => {
    if (!rankIdToRank[rankId]) {
      const rankRes = await GetRank(rankId);
      console.log("GetRank for", rankId, "returned", rankRes);
      if (rankRes[0]) {
        rankIdToRank[rankId] = rankRes[0];
        rankIdToColor[rankId] = await getRankColor(rankId);
      }
    }
  }

  const getUserHighestRank = async (uuid: string) => {
    const ranksResult = await GetActiveRanks(uuid);
    const ranks: Rank[] = Array.isArray(ranksResult[0]) ? ranksResult[0] : [];
    const rank = ranks.reduce((acc, crr) =>
      crr.priority > acc.priority ? crr : acc,
      { priority: -1 } as Rank)
    return rank.priority != -1 ? rank : null;
  }

  // Log each grant's rankId before updating cache
  await Promise.all(grants.map(grant => {
    console.log("Grant rankId:", grant.rankId);
    return updateRankCache(grant.rankId);
  }));

  for (let grant of grants) {
    if (grant.addedBy && !uuidToName[grant.addedBy])
      uuidToName[grant.addedBy] = (await getUsernameFromUuid(grant.addedBy))!;
    if (grant.removedBy && !uuidToName[grant.removedBy])
      uuidToName[grant.removedBy] = (await getUsernameFromUuid(grant.removedBy))!;

    const issuerRank = grant.addedBy ? await getUserHighestRank(grant.addedBy) : null;
    const removerRank = grant.removedBy ? await getUserHighestRank(grant.removedBy) : null;
    if (issuerRank) {
      await updateRankCache(issuerRank._id);
      uuidToRank[grant.addedBy!] = issuerRank;
    }
    if (removerRank) {
      await updateRankCache(removerRank._id);
      uuidToRank[grant.removedBy!] = removerRank;
    }
  }

  const targetRank = await getUserHighestRank(uuid);
  if (targetRank) {
    await updateRankCache(targetRank._id);
    uuidToRank[uuid] = targetRank;
  }

  grants.sort((a, b) => Number(b.addedAt) - Number(a.addedAt));
  grants = grants.filter(g => rankIdToRank[g.rankId]);
  console.log("Filtered grants:", grants);
  console.log("rankIdToRank:", rankIdToRank);

  return {
    uuid: uuid,
    uuidToName: uuidToName,
    rankIdToRank: rankIdToRank,
    rankIdToColor: rankIdToColor,
    uuidToRank: uuidToRank,
    grants: grants,
  }
}

