'use server'

import { isResultError } from "@/libs/Utils";
import getSession from "@/libs/session/getSession";
import { getHighestRank } from "@/services/controller/GrantService";
import { canUseForum } from "@/services/forum/account/AccountService";
import { DeleteThread, EditThread, getThread } from "@/services/forum/thread/ThreadService";
import HTTPClient from "@/libs/HTTPClient";

export async function deleteThreadSoft(threadId: string): Promise<string | undefined> {
  'use server'
  
  const client = new HTTPClient(process.env.API_URL!);
  const result = await getThread(client, threadId);
  const thread = result.success ? result.data : undefined;
  if (!thread) return "Invalid Thread"

  const session = await getSession();
  if (!session) return "Not logged in";
  const rank = await getHighestRank(session.uuid);
  const isStaff = rank?.staff || false;

  if (!isStaff && (thread.author != session.uuid || !(await canUseForum(session.uuid)))) return "Permission denied";

  thread.body = "The original message was deleted"
  const editResult = await EditThread(client, thread);

  if (!editResult.success) {
    return editResult.error || "Failed to edit thread";
  }
}


