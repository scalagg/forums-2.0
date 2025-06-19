'use server';

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

///**
// * Endpoint to retrieve a single grant by its UUID and convert it to a simplified form for the site.
// *
// * @param id The UUID of the grant to be retrieved.
// * @return ResponseEntity containing the GrantToSend or not found status if not available.
// */
//// In the API: @GetMapping("/grants/id/site/{id}")
//export const GetGrantToSend = async (id: string, client?: HTTPClient) => {
//    const uri = `/grants/id/site/${id}`;
//
//    client ??= new HTTPClient(process.env.API_URL!);
//    const response = await (await client.GetAsync(uri)).json();
//
//    return response;
//    }
//
///**
// * Endpoint to retrieve all grants for a player based on their UUID.
// *
// * @param uuid The UUID of the player for whom grants are requested.
// * @return ResponseEntity containing a list of Grants.
// */
//// In the API: @GetMapping("/grants/{uuid}")
//export const GetGrants = async (uuid: string, client?: HTTPClient) => {
//    const uri = `/grants/${uuid}`;
//
//    client ??= new HTTPClient(process.env.API_URL!);
//    const response = await (await client.GetAsync(uri)).json();
//
//    return response;
//    }
//
///**
// * Endpoint to retrieve all grants for a player and convert them to a simplified form for the site.
// *
// * @param uuid The UUID of the player for whom grants are requested.
// * @return ResponseEntity containing a list of GrantToSend objects.
// */
//// In the API: @GetMapping("/grants/site/{uuid}")
//export const GetGrantsToSend = async (uuid: string, client?: HTTPClient) => {
//    const uri = `/grants/site/${uuid}`;
//
//    client ??= new HTTPClient(process.env.API_URL!);
//    const response = await (await client.GetAsync(uri)).json();
//
//    return response;
//    }
//
///**
// * Endpoint to retrieve all active grants for a player based on their UUID.
// *
// * @param uuid The UUID of the player for whom active grants are requested.
// * @return ResponseEntity containing a list of active Grants.
// */
//// In the API: @GetMapping("/grants/active/{uuid}")
//export const GetActiveGrants = async (uuid: string, client?: HTTPClient) => {
//    const uri = `/grants/active/${uuid}`;
//
//    client ??= new HTTPClient(process.env.API_URL!);
//    const response = await (await client.GetAsync(uri)).json();
//
//    return response;
//    }
//
//
///**
// * Endpoint to retrieve all active grants for a player and convert them to a simplified form for the site.
// *
// * @param uuid The UUID of the player for whom active grants are requested.
// * @return ResponseEntity containing a list of active GrantToSend objects.
// */
//// In the API: @GetMapping("/grants/active/site/{uuid}")
//export const GetActiveGrantsToSend = async (uuid: string, client?: HTTPClient) => {
//    const uri = `/grants/active/site/${uuid}`;
//
//    client ??= new HTTPClient(process.env.API_URL!);
//    const response = await (await client.GetAsync(uri)).json();
//
//    return response;
//    }
//

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
  if (!result.success || !result.data || !Array.isArray(result.data)) {
    return { success: false, data: null, error: result.error || 'Failed to fetch grants' };
  }
  
  // Use 'active' field to filter active grants
  const activeGrants = result.data.filter((grant: Grant) => grant.active === 'true' || grant.permanent === 'true');
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

///**
// * Asynchronous endpoint to retrieve all grants issued by a player based on their UUID.
// *
// * @param uuid The UUID of the player who issued the grants.
// * @return ResponseEntity containing a list of Grants.
// */
//// In the API: @GetMapping("/grants/issuedBy/{uuid}")
//
//export const GetIssuedGrants = async (uuid: string, client?: HTTPClient) => {
//    const uri = `/grants/issuedBy/${uuid}`;
//
//    client ??= new HTTPClient(process.env.API_URL!);
//    const response = await (await client.GetAsync(uri)).json();
//
//    return response;
//    }
///**
// * Asynchronous endpoint to retrieve all grants issued by a player and convert them to a simplified form for the site.
// *
// * @param uuid The UUID of the player who issued the grants.
// * @return ResponseEntity containing a list of GrantToSend objects.
// */
//// In the API: @GetMapping("/grants/site/issuedBy/{uuid}")
//export const GetIssuedGrantsToSend = async (uuid: string, client?: HTTPClient) => {
//    const uri = `/grants/site/issuedBy/${uuid}`;
//
//    client ??= new HTTPClient(process.env.API_URL!);
//    const response = await (await client.GetAsync(uri)).json();
//
//    return response;
//    }
//
//
///**
// * Endpoint to update a grant in the database and trigger a GrantsUpdatePacket.
// *
// * @param grant The Grant object to be updated.
// * @return ResponseEntity indicating the success of the update.
// */
//// In the API: @PostMapping("/grants/update")
//export const UpdateGrant = async (formData: FormData, client?: HTTPClient) => {
//    const uri = `/grants/update`;
//
//    client ??= new HTTPClient(process.env.API_URL!);
//    const response = await (await client.PostAsync(uri, formData)).json();
//
//    return response;
//    }
