'use server'

import { isResultError } from "@/libs/Utils";
import getSession from "@/libs/session/getSession";
import { getHighestRank } from "@/services/controller/GrantService";
import { DeleteThread, EditThread, getThread } from "@/services/forum/thread/ThreadService";
import HTTPClient from "@/libs/HTTPClient";

export async function lockThread(threadId: string): Promise<string | undefined> {
  'use server'

  const client = new HTTPClient(process.env.API_URL!);
  const result = await getThread(client, threadId);
  const thread = result.success ? result.data : undefined;
  if (!thread) return "Thread not found"
  
  const session = await getSession();
  if (!session) return "Not logged in";
  const rank = await getHighestRank(session.uuid);
  const isStaff = rank?.staff || false;

  if (!isStaff) return "Permission denied";

  thread.locked = true;
  const editResult = await EditThread(client, thread);

  if (!editResult.success) {
    return editResult.error || "Failed to edit thread";
  }
}


