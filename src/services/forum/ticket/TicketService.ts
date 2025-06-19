import { Ticket, TicketStatus } from "@/types/api";

const baseEndpoint = "/forum/ticket";

// Ticket Management
export async function getTicket(client: HTTPClient, id: string): Promise<Ticket | null> {
  const [ticket] = await client.GetAsync<Ticket>(`${baseEndpoint}/${id}`);
  return ticket;
}

export async function getPlayerTickets(client: HTTPClient, uuid: string, page: number = 1): Promise<Ticket[]> {
  const [tickets] = await client.GetAsync<Ticket[]>(`${baseEndpoint}/player/${uuid}?page=${page}`);
  return tickets || [];
}

export async function getStaffTickets(client: HTTPClient, page: number = 1): Promise<Ticket[]> {
  const [tickets] = await client.GetAsync<Ticket[]>(`${baseEndpoint}/s/all?page=${page}`);
  return tickets || [];
}

export async function getStaffApplications(client: HTTPClient, page: number = 1): Promise<Ticket[]> {
  const [applications] = await client.GetAsync<Ticket[]>(`${baseEndpoint}/s/all/applications?page=${page}`);
  return applications || [];
}

export async function getPlayerApplications(client: HTTPClient, uuid: string, page: number = 1): Promise<Ticket[]> {
  const [applications] = await client.GetAsync<Ticket[]>(`${baseEndpoint}/player/${uuid}/applications?page=${page}`);
  return applications || [];
}

// Ticket Actions
export async function createTicket(
  client: HTTPClient,
  ticket: {
    title: string;
    body: string;
    category: string;
    author: string;
  }
): Promise<Ticket | null> {
  const [newTicket] = await client.PostAsync<Ticket>(baseEndpoint, ticket);
  return newTicket;
}

export async function replyToTicket(
  client: HTTPClient,
  ticketId: string,
  reply: {
    body: string;
    author: string;
  }
): Promise<Ticket | null> {
  const [updatedTicket] = await client.PostAsync<Ticket>(`${baseEndpoint}/${ticketId}/reply`, reply);
  return updatedTicket;
}

export async function updateTicket(
  client: HTTPClient,
  ticketId: string,
  updates: {
    status?: TicketStatus;
    category?: string;
    title?: string;
  }
): Promise<Ticket | null> {
  const [updatedTicket] = await client.PutAsync<Ticket>(`${baseEndpoint}/${ticketId}`, updates);
  return updatedTicket;
}

export async function archiveTicket(client: HTTPClient, ticketId: string): Promise<boolean> {
  const [, status] = await client.PostAsync(`${baseEndpoint}/${ticketId}/archive`);
  return status === 200;
}

export async function unarchiveTicket(client: HTTPClient, ticketId: string): Promise<boolean> {
  const [, status] = await client.PostAsync(`${baseEndpoint}/${ticketId}/unarchive`);
  return status === 200;
}

export async function deleteTicket(client: HTTPClient, ticketId: string): Promise<boolean> {
  const [, status] = await client.DeleteAsync(`${baseEndpoint}/${ticketId}`);
  return status === 200;
}

// Aliases for backward compatibility
export const GetTicket = getTicket;
export const GetPlayerTickets = getPlayerTickets;
export const GetStaffTickets = getStaffTickets;
export const GetStaffApplications = getStaffApplications;
export const GetPlayerApplications = getPlayerApplications;
export const CreateTicket = createTicket;
export const ReplyToTicket = replyToTicket;
export const UpdateTicket = updateTicket;
export const ArchiveTicket = archiveTicket;
export const UnarchiveTicket = unarchiveTicket;
export const DeleteTicket = deleteTicket;
export const GetAllTickets = getStaffTickets; // Assuming this is the same as getStaffTickets 
