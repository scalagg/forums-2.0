'use server';

import HTTPClient from "@/libs/HTTPClient";
import { Forum } from "@/types/api";

const baseEndpoint = "/forum/forum";

// Active API Methods
export async function getForum(client: HTTPClient, id: string): Promise<Forum | null> {
  try {
    console.log("Fetching forum:", id);
    const [forum, status, error] = await client.GetAsync<Forum>(`${baseEndpoint}/${id}`);
    console.log("Forum API response:", { forum, status, error });
    
    if (error) {
      console.error("Error fetching forum:", error);
      return null;
    }
    
    if (!forum) {
      console.error("No forum data returned for ID:", id);
      return null;
    }
    
    console.log("Successfully fetched forum:", forum.name);
    return forum;
  } catch (error) {
    console.error("Exception fetching forum:", error);
    return null;
  }
}

export async function createForum(
  client: HTTPClient,
  forumData: { id: string; name: string; description: string; category: string }
): Promise<Forum | null> {
  try {
    console.log("Creating forum:", forumData);
    const [newForum, status, error] = await client.PostAsync<Forum>(`${baseEndpoint}`, forumData);
    console.log("Create forum response:", { newForum, status, error });
    
    if (error) {
      console.error("Error creating forum:", error);
      return null;
    }
    
    return newForum;
  } catch (error) {
    console.error("Exception creating forum:", error);
    return null;
  }
}

export async function updateForum(
  client: HTTPClient,
  id: string,
  forum: { name?: string; description?: string; category?: string }
): Promise<Forum | null> {
  try {
    console.log("Updating forum:", id, forum);
    const [updatedForum, status, error] = await client.PutAsync<Forum>(`${baseEndpoint}/${id}`, forum);
    console.log("Update forum response:", { updatedForum, status, error });
    
    if (error) {
      console.error("Error updating forum:", error);
      return null;
    }
    
    return updatedForum;
  } catch (error) {
    console.error("Exception updating forum:", error);
    return null;
  }
}

export async function deleteForum(client: HTTPClient, id: string): Promise<boolean> {
  try {
    console.log("Deleting forum:", id);
    const [_, status, error] = await client.DeleteAsync(`${baseEndpoint}/${id}`);
    console.log("Delete forum response:", { status, error });
    
    if (error) {
      console.error("Error deleting forum:", error);
      return false;
    }
    
    return status === 200;
  } catch (error) {
    console.error("Exception deleting forum:", error);
    return false;
  }
} 