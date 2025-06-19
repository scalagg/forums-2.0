import HTTPClient from "@/libs/HTTPClient";
import Grant from "@/libs/types/entities/Grant";
import Rank from "@/libs/types/entities/Rank";

/**
* Asynchronous endpoint to retrieve a single rank by its UUID.
*
* @param id The UUID of the rank to be retrieved.
* @return Rank or not found status if not available.
*/
// In the API: @GetMapping("/rank/{id}")
export const GetRank = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) =>
  await client.GetAsync<Rank>(`/rank/${uuid}`);

export const getRankColor = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)): Promise<string> =>
  (await client.GetAsync<any>(`/rank/color/${uuid}`))[0]?.color || "#FFFFFF";

export const getGrants = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
  if (!uuid) {
    if (typeof window !== 'undefined') {
      console.warn('getGrants called with empty uuid!');
      console.trace();
    }
    return [[], 400, 'UUID is required'];
  }
  return await client.GetAsync<Grant[]>(`/grant/profile/${uuid}`);
};

// Fetch all grants for a player
export const GetGrants = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
  if (!uuid) {
    if (typeof window !== 'undefined') {
      console.warn('GetGrants called with empty uuid!');
      console.trace();
    }
    return { success: false, data: null, error: 'UUID is required' };
  }
  return await client.GetAsync<Grant[]>(`/grant/profile/${uuid}`);
};

// Helper to get only active ranks (not removed/expired)
export const GetActiveRanks = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
  const result = await GetGrants(uuid, client);
  
  // Handle both array and object result formats
  let grants: Grant[] = [];
  
  if (Array.isArray(result) && result[0] && Array.isArray(result[0])) {
    grants = result[0] as Grant[];
  } else if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
    grants = result.data as Grant[];
  }
  
  // Filter active grants
  const activeGrants = grants.filter((grant: Grant) => 
    (grant as any).active === 'true' || (grant as any).permanent === 'true'
  );
  
  return { success: true, data: activeGrants, error: null };
};

export const getHighestRank = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
  const activeRanks = await GetActiveRanks(uuid, client);
  if (!activeRanks.success || !activeRanks.data || !activeRanks.data.length) return undefined;
  
  // Get the first active rank and fetch its details
  const highestGrant = activeRanks.data[0];
  const [rank] = await client.GetAsync<Rank>(`/rank/${highestGrant.rankId}`);
  return rank;
};

export const getRankFromName = async (name: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) =>
  await client.GetAsync<Rank>(`/rank/name/${name}`);