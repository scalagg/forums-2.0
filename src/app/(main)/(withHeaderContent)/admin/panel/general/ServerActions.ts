'use server'

import WebEntry from "@/libs/types/entities/WebEntry"
import { updateEntry } from "@/services/forum/websiteData/WebsiteDataService"
import HTTPClient from "@/libs/HTTPClient";

export async function updateDataAction(entries: WebEntry[]): Promise<string | undefined> {
  'use server'

  const client = new HTTPClient(process.env.API_URL!);

  for (let entry of entries) {
    const res = await updateEntry(entry, client);
    if (!res)
      return `Error updating entry: ${entry._id}`;
  }
}