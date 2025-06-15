'use server';

import HTTPClient from "@/libs/HTTPClient";
import { Ticket, TicketStatus } from "@/types/api";

export default class TicketService {
  private readonly client: HTTPClient;
  private readonly baseEndpoint = "/forum/ticket";

  constructor(client: HTTPClient) {
    this.client = client;
  }

  // Ticket Management
  async getTicket(id: string): Promise<Ticket | null> {
    const [ticket] = await this.client.GetAsync<Ticket>(`${this.baseEndpoint}/${id}`);
    return ticket;
  }

  async getPlayerTickets(uuid: string, page: number = 1): Promise<Ticket[]> {
    const [tickets] = await this.client.GetAsync<Ticket[]>(`${this.baseEndpoint}/player/${uuid}?page=${page}`);
    return tickets || [];
  }

  async getStaffTickets(page: number = 1): Promise<Ticket[]> {
    const [tickets] = await this.client.GetAsync<Ticket[]>(`${this.baseEndpoint}/s/all?page=${page}`);
    return tickets || [];
  }

  async getStaffApplications(page: number = 1): Promise<Ticket[]> {
    const [applications] = await this.client.GetAsync<Ticket[]>(`${this.baseEndpoint}/s/all/applications?page=${page}`);
    return applications || [];
  }

  async getPlayerApplications(uuid: string, page: number = 1): Promise<Ticket[]> {
    const [applications] = await this.client.GetAsync<Ticket[]>(`${this.baseEndpoint}/player/${uuid}/applications?page=${page}`);
    return applications || [];
  }

  // Ticket Actions
  async createTicket(ticket: {
    title: string;
    body: string;
    category: string;
    author: string;
  }): Promise<Ticket | null> {
    const [newTicket] = await this.client.PostAsync<Ticket>(this.baseEndpoint, ticket);
    return newTicket;
  }

  async replyToTicket(ticketId: string, reply: {
    body: string;
    author: string;
  }): Promise<Ticket | null> {
    const [updatedTicket] = await this.client.PostAsync<Ticket>(`${this.baseEndpoint}/${ticketId}/reply`, reply);
    return updatedTicket;
  }

  async updateTicket(ticketId: string, updates: {
    status?: TicketStatus;
    category?: string;
    title?: string;
  }): Promise<Ticket | null> {
    const [updatedTicket] = await this.client.PutAsync<Ticket>(`${this.baseEndpoint}/${ticketId}`, updates);
    return updatedTicket;
  }

  async archiveTicket(ticketId: string): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/${ticketId}/archive`);
    return status === 200;
  }

  async unarchiveTicket(ticketId: string): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/${ticketId}/unarchive`);
    return status === 200;
  }

  async deleteTicket(ticketId: string): Promise<boolean> {
    const [, status] = await this.client.DeleteAsync(`${this.baseEndpoint}/${ticketId}`);
    return status === 200;
  }

  // Legacy Methods (Kept for backward compatibility)
  // TODO: Remove these once we fully migrate to the new API
  /*
  async getTicket(id: string): Promise<Ticket | null> {
    const [ticket] = await this.client.GetAsync<Ticket>(`/forum/ticket/${id}`);
    return ticket;
  }

  async getPlayerTickets(uuid: string, page: number = 1): Promise<Ticket[]> {
    const [tickets] = await this.client.GetAsync<Ticket[]>(`/forum/ticket/player/${uuid}?page=${page}`);
    return tickets || [];
  }

  async getStaffTickets(): Promise<Ticket[]> {
    const [tickets] = await this.client.GetAsync<Ticket[]>(`/forum/ticket/admin`);
    return tickets || [];
  }

  async createTicket(ticket: Partial<Ticket>): Promise<Ticket | null> {
    const [newTicket] = await this.client.PostAsync<Ticket>(`/forum/ticket`, ticket);
    return newTicket;
  }

  async replyToTicket(parentId: string, ticket: Partial<Ticket>): Promise<Ticket | null> {
    const [newReply] = await this.client.PostAsync<Ticket>(`/forum/ticket/${parentId}/reply`, ticket);
    return newReply;
  }

  async updateTicket(ticket: Ticket): Promise<Ticket | null> {
    const [updatedTicket] = await this.client.PutAsync<Ticket>(`/forum/ticket/${ticket._id}`, ticket);
    return updatedTicket;
  }

  async archiveTicket(id: string): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`/forum/ticket/${id}/archive`);
    return status === 200;
  }

  async unarchiveTicket(id: string): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`/forum/ticket/${id}/unarchive`);
    return status === 200;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const [, status] = await this.client.DeleteAsync(`/forum/ticket/${id}`);
    return status === 200;
  }
  */
}


