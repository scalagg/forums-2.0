import HTTPClient from '@/libs/HTTPClient';
import { Account, AccountSettings } from '@/types/api';
import { Result } from '@/types/Result';

const baseEndpoint = "/forum/account";

// Authentication Methods
export async function register(
  client: HTTPClient,
  username: string, 
  email: string, 
  password: string
): Promise<Result<{ token: string }>> {
  try {
    const response = await client.post(`${baseEndpoint}/register`, {
      username,
      email,
      password
    });
    return [response.data, null];
  } catch (error) {
    return [null, error];
  }
}

export async function confirmRegistration(
  client: HTTPClient,
  token: string
): Promise<Result<Account>> {
  try {
    const response = await client.post(`${baseEndpoint}/register/${token}`);
    return [response.data, null];
  } catch (error) {
    return [null, error];
  }
}

export async function login(
  client: HTTPClient,
  username: string, 
  password: string
): Promise<Result<Account>> {
  try {
    const response = await client.get(
      `${baseEndpoint}/login/${username}?password=${encodeURIComponent(password)}`
    );
    return [response.data, null];
  } catch (error) {
    return [null, error];
  }
}

// Password Management
export async function sendPasswordReset(
  client: HTTPClient,
  email: string
): Promise<Result<void>> {
  try {
    await client.post(`${baseEndpoint}/sendResetPassword`, { email });
    return [undefined, null];
  } catch (error) {
    return [null, error];
  }
}

export async function resetPassword(
  client: HTTPClient,
  token: string, 
  newPassword: string
): Promise<Result<void>> {
  try {
    await client.post(`${baseEndpoint}/resetPassword/${token}`, { 
      password: newPassword 
    });
    return [undefined, null];
  } catch (error) {
    return [null, error];
  }
}

export async function changePassword(
  client: HTTPClient,
  uuid: string, 
  currentPassword: string, 
  newPassword: string
): Promise<Result<void>> {
  try {
    await client.put(`${baseEndpoint}/password/${uuid}`, {
      currentPassword,
      newPassword
    });
    return [undefined, null];
  } catch (error) {
    return [null, error];
  }
}

// Account Management
export async function getAccount(
  client: HTTPClient,
  uuid: string
): Promise<Result<Account>> {
  try {
    const response = await client.get(`${baseEndpoint}/uuid/${uuid}`);
    return [response.data, null];
  } catch (error) {
    return [null, error];
  }
}

export async function getAccountByEmail(
  client: HTTPClient,
  email: string
): Promise<Result<Account>> {
  try {
    const response = await client.get(`${baseEndpoint}/email/${email}`);
    return [response.data, null];
  } catch (error) {
    return [null, error];
  }
}

export async function updateSettings(
  client: HTTPClient,
  uuid: string, 
  settings: Partial<AccountSettings>
): Promise<Result<Account>> {
  try {
    const response = await client.put(`${baseEndpoint}/settings/${uuid}`, settings);
    return [response.data, null];
  } catch (error) {
    return [null, error];
  }
}

export async function updateEmail(
  client: HTTPClient,
  uuid: string, 
  newEmail: string, 
  password: string
): Promise<Result<void>> {
  try {
    await client.put(`${baseEndpoint}/email/${uuid}`, {
      email: newEmail,
      password
    });
    return [undefined, null];
  } catch (error) {
    return [null, error];
  }
}

// Staff Methods
export async function getStaffList(
  client: HTTPClient
): Promise<Result<{ playerUuid: string; rankUuid: string }[]>> {
  try {
    const response = await client.get("/staffList");
    return [response.data || [], null];
  } catch (error) {
    return [null, error];
  }
} 