'use server';

import HTTPClient from "@/libs/HTTPClient";
import getSession from "@/libs/session/getSession";
import { Account, AccountSettings, AccountProfile } from "@/libs/types/entities/Account";
import { SessionData } from "@/libs/session/iron";
import { getPunishments } from "../punishment/PunishmentService";
import { UUID } from '@/libs/types/UUID';

// Variables
const baseEndpoint = "/forum/account";
const interceptSession =
  (method: any): (body: any) => Promise<[SessionData | null, number, string | null]> =>
    async (body: any) => {
      const result = await method(body);
      if (!result[0]) return result;

      const session = await getSession();
      session.username = result[0].username;
      session.uuid = result[0].uuid;
      session.email = result[0].email;
      session.isLoggedIn = true;
      await session.save();

      return [{
        ...result[0],
        isLoggedIn: session.isLoggedIn
      }, result[1], result[2]];
    };

// Define Result type since it's not available
interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Raw API response types with MongoDB fields
interface RawAccount {
    _id: string;
    uuid: string;
    username: string;
    email: string;
    password: string;
    createdAt: number;
    lastLoginAt: number;
    lastSeenAt: number;
    role: string;
    permissions: string[];
    settings: {
        theme: string;
        notifications: boolean;
        emailNotifications: boolean;
        privacy: {
            showEmail: boolean;
            showLocation: boolean;
            showWebsite: boolean;
            showSocial: boolean;
        };
    };
    profile: {
        avatar: string;
        banner: string;
        bio: string;
        location: string;
        website: string;
        social: {
            discord: string;
            twitter: string;
            github: string;
        };
    };
    stats: {
        posts: number;
        threads: number;
        reputation: number;
        thanks: number;
    };
}

/**
 * Endpoint for retrieving forum threads associated with a player.
 *
 * @param uuid The UUID of the player.
 * @return ResponseEntity containing a JSON array of forum threads.
 */
// In the API: @GetMapping(path = "/forum/account/threads/{uuid}")
// TODO

/**
 * Endpoint for retrieving Account data from Email.
 *
 * @param email The Email of the player.
 * @param client
 * @return ResponseEntity containing the user's Account data.
 */
// In the API: @GetMapping(path = "/forum/account/threads/{uuid}")
export const GetAccountFromEmail = async (email: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) =>
  await client.GetAsync<Account>(`${baseEndpoint}/email/${email}`);

/**
 * Endpoint for updating account settings.
 *
 * @return ResponseEntity containing the updated account information.
 * @param data
 * @param client
 */
// In the API: @PutMapping(path = "/forum/account/setting/{uuid}")
export const UpdateAccountSettings = async (
  data: { uuid?: string, body: any },
  client: HTTPClient = new HTTPClient(process.env.API_URL!)
) => await client.PutAsync<Account>(`${baseEndpoint}/setting/${data.uuid}`, data.body);

/**
 * Endpoint for forgot password.
 *
 * @param email The email of the player.
 * @param client
 * @return ResponseEntity containing the updated account information or an error message.
 */
// In the API: @PostMapping(path = "/forum/account/forgotPassword/{email}")
export const ForgotPassword = async (email: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) =>
  await client.PostAsync(`${baseEndpoint}/forgotPassword/${email}`);

/**
 * Endpoint for updating account password.
 *
 * @return ResponseEntity containing the updated account information or an error message.
 * @param data
 * @param client
 */
// In the API: @PutMapping(path = "/forum/account/password/{uuid}")
export const UpdateAccountPassword = async (
  data: { uuid?: string, body: { password: string, currentPassword: string } },
  client: HTTPClient = new HTTPClient(process.env.API_URL!)
) => await client.PutAsync<Account>(`${baseEndpoint}/password/${data.uuid}`, data.body);

export const UpdateAccountEmail = async (
  data: { uuid?: string, body: { password: string, email: string } },
  client: HTTPClient = new HTTPClient(process.env.API_URL!)
) => await client.PutAsync<Account>(`${baseEndpoint}/email/${data.uuid}`, data.body);

/**
 * Endpoint for completing the registration process by setting the account password.
 *
 * @param body The JSON object containing the password and token.
 * @return ResponseEntity indicating the result of the registration completion.
 */
export const Register = interceptSession(async (
  data: { token: string, password: string },
  client: HTTPClient = new HTTPClient(process.env.API_URL!)
): Promise<[SessionData | null, number, string | null]> =>
  await client.PostAsync(`${baseEndpoint}/register`, data)
);

/**
 * Endpoint for completing the registration process by setting the account password.
 *
 * @param body The JSON object containing the password and token.
 * @return ResponseEntity indicating the result of the registration completion.
 */
export const Reset = interceptSession(async (
  data: { token: string, newPassword: string },
  client: HTTPClient = new HTTPClient(process.env.API_URL!)
): Promise<[SessionData | null, number, string | null]> =>
  await client.PutAsync(`${baseEndpoint}/resetPassword`, data)
);

/**
 * Endpoint for handling login requests.
 *
 * @param username The username or email for login.
 * @return ResponseEntity containing the account information for successful logins.
 */
// In the API: @GetMapping(path = "/forum/account/login/{username}")
export const Login = interceptSession(async (
  data: { username: string, password: string },
  client: HTTPClient = new HTTPClient(process.env.API_URL!)
): Promise<[SessionData | null, number, string | null]> =>
  await client.GetAsync(`${baseEndpoint}/login/${data.username}?` + new URLSearchParams({ password: data.password }))
);


/**
  * Endpoint for retrieving a list of the user's friends
  * @param uuid The user's UUID
  * @return An array of the friends' accounts
  */
export const GetFriends = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) =>
  await client.GetAsync<Account[]>(`${baseEndpoint}/friends/${uuid}`);


/**
  * Endpoint for retrieving all staff users
  *
  * @return An array of objects containing player and rank uuids
  */
export async function getStaffUsers(
    client: HTTPClient
): Promise<Result<{ playerUuid: string; rankUuid: string }[]>> {
    try {
        const [data, status, error] = await client.GetAsync<{ playerUuid: string; rankUuid: string }[]>("/staff");
        if (error) {
            return {
                success: false,
                error: `Failed to fetch staff users: ${error}`
            };
        }
        return {
            success: true,
            data: data || []
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch staff users'
        };
    }
}


export const getAccountFromUuid = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) =>
  await client.GetAsync<Account>(`/forum/account/uuid/${uuid}`);


/**
  * Gets player uuid from username from mojang api or playerdb api
  * @param username The user name
  * @return the uuid or null
  */
export const getUuid = async (username: string) => {
  let uuid = null;

  // Mojang API disabled because it was returing trimmed UUIDs

  try {
    uuid = await fetch(`https://playerdb.co/api/player/minecraft/${username}`)
      .then(res => res?.json())
      .then(res => res?.data?.player?.id);
  } catch { /* Do nothing */ }

  return uuid;
}

export const getUsernameFromUuid = async (uuid: string): Promise<string | null> => {
  let username = null;
  try {
    username = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
      .then(res => res?.json())
      .then(res => res?.name);
  } catch { /* Do nothing */ }

  if (!username) {
    try {
      uuid = await fetch(`https://playerdb.co/api/player/minecraft/${uuid}`)
        .then(res => res?.json())
        .then(res => res?.data?.username);
    } catch { /* Do nothing */ }
  }

  return username;
}

export const getCurrentServer = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)): Promise<string | undefined> =>
  await client.GetAsync<any>(`/profile/server/${uuid}`).then(res => res[0]?.displayName);


export const canUseForum = async (uuid: string) => {
  const account = (await getAccountFromUuid(uuid))[0];
  if (!account)
    return false;

  const punishments = (await getPunishments(uuid))[0] || [];
  if (punishments.filter(p => p.active).find(p =>
    p.punishmentType == "BLACKLIST"
    || p.punishmentType == "MUTE"
    || p.punishmentType == "BAN"))
    return false;

  console.log(punishments);

  return true;
}

// Helper function to create an Account instance
function createAccountInstance(data: RawAccount): Account {
    return {
        id: data._id,
        uuid: data.uuid as UUID,
        username: data.username,
        email: data.email,
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt,
        lastSeenAt: data.lastSeenAt,
        role: data.role,
        permissions: data.permissions,
        settings: data.settings,
        profile: data.profile,
        stats: data.stats,
        // Add any helper methods here
        getRoleColor(): string {
            switch (this.role.toLowerCase()) {
                case 'admin':
                    return '#ff0000';
                case 'moderator':
                    return '#00ff00';
                case 'vip':
                    return '#0000ff';
                default:
                    return '#808080';
            }
        },
        hasPermission(permission: string): boolean {
            return this.permissions.includes(permission);
        },
        getReputationColor(): string {
            if (this.stats.reputation >= 1000) return '#ff0000';
            if (this.stats.reputation >= 500) return '#ffa500';
            if (this.stats.reputation >= 100) return '#ffff00';
            return '#808080';
        }
    };
}

// Authentication Methods
export async function register(
    client: HTTPClient,
    params: {
        username: string;
        email: string;
        password: string;
    }
): Promise<Result<{ token: string }>> {
    try {
        const [data, status, error] = await client.PostAsync<{ token: string }>(`${baseEndpoint}/register`, params);
        if (error) {
            return {
                success: false,
                error: `Failed to register: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to register: No data returned'
            };
        }
        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to register'
        };
    }
}

export async function confirmRegistration(
    client: HTTPClient,
    token: string
): Promise<Result<Account>> {
    try {
        const [data, status, error] = await client.PostAsync<RawAccount>(`${baseEndpoint}/register/${token}`);
        if (error) {
            return {
                success: false,
                error: `Failed to confirm registration: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to confirm registration: No data returned'
            };
        }
        return {
            success: true,
            data: createAccountInstance(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to confirm registration'
        };
    }
}

export async function login(
    client: HTTPClient,
    params: {
        username: string;
        password: string;
    }
): Promise<Result<Account>> {
    try {
        const [data, status, error] = await client.GetAsync<RawAccount>(`${baseEndpoint}/login/${params.username}?password=${encodeURIComponent(params.password)}`);
        if (error) {
            return {
                success: false,
                error: `Failed to login: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to login: No data returned'
            };
        }
        return {
            success: true,
            data: createAccountInstance(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to login'
        };
    }
}

// Password Management
export async function sendPasswordReset(
    client: HTTPClient,
    email: string
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PostAsync(`${baseEndpoint}/sendResetPassword`, { email });
        if (error) {
            return {
                success: false,
                error: `Failed to send password reset: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send password reset'
        };
    }
}

export async function resetPassword(
    client: HTTPClient,
    params: {
        token: string;
        password: string;
    }
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PostAsync(`${baseEndpoint}/resetPassword/${params.token}`, { password: params.password });
        if (error) {
            return {
                success: false,
                error: `Failed to reset password: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reset password'
        };
    }
}

export async function changePassword(
    client: HTTPClient,
    params: {
        uuid: string;
        currentPassword: string;
        newPassword: string;
    }
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PutAsync(`${baseEndpoint}/password/${params.uuid}`, {
            currentPassword: params.currentPassword,
            newPassword: params.newPassword
        });
        if (error) {
            return {
                success: false,
                error: `Failed to change password: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to change password'
        };
    }
}

// Account Management
export async function getAccount(
    client: HTTPClient,
    uuid: string
): Promise<Result<Account>> {
    try {
        const [data, status, error] = await client.GetAsync<RawAccount>(`${baseEndpoint}/uuid/${uuid}`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch account: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to fetch account: No data returned'
            };
        }
        return {
            success: true,
            data: createAccountInstance(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch account'
        };
    }
}

export async function getAccountByEmail(
    client: HTTPClient,
    email: string
): Promise<Result<Account>> {
    try {
        const [data, status, error] = await client.GetAsync<RawAccount>(`${baseEndpoint}/email/${email}`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch account: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to fetch account: No data returned'
            };
        }
        return {
            success: true,
            data: createAccountInstance(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch account'
        };
    }
}

export async function updateSettings(
    client: HTTPClient,
    params: {
        uuid: string;
        settings: Partial<AccountSettings>;
    }
): Promise<Result<Account>> {
    try {
        const [data, status, error] = await client.PutAsync<RawAccount>(`${baseEndpoint}/settings/${params.uuid}`, params.settings);
        if (error) {
            return {
                success: false,
                error: `Failed to update settings: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to update settings: No data returned'
            };
        }
        return {
            success: true,
            data: createAccountInstance(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update settings'
        };
    }
}

export async function updateEmail(
    client: HTTPClient,
    params: {
        uuid: string;
        email: string;
        password: string;
    }
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PutAsync(`${baseEndpoint}/email/${params.uuid}`, {
            email: params.email,
            password: params.password
        });
        if (error) {
            return {
                success: false,
                error: `Failed to update email: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update email'
        };
    }
}

// Staff Methods
export async function getStaffList(client: HTTPClient = new HTTPClient(process.env.API_URL!)) {
  return await client.GetAsync<StaffRank[]>(`/staffList`);
}

// Types for staff list
export interface StaffRankMember {
  name: string;
  uuid: string;
}
export interface StaffRank {
  uuid: string;
  name: string;
  displayName: string | null;
  weight: number;
  color: string;
  members: StaffRankMember[];
}
