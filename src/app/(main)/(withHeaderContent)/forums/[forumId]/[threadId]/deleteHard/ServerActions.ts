'use server'

import { isResultError } from "@/libs/Utils";
import getSession from "@/libs/session/getSession";
import { getHighestRank } from "@/services/controller/GrantService";
import { canUseForum } from "@/services/forum/account/AccountService";
import { DeleteThread, EditThread, getThread } from "@/services/forum/thread/ThreadService";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import HTTPClient from "@/libs/HTTPClient";

export async function deleteThreadHard(threadId: string): Promise<string | undefined> {
  'use server'
  
  const session = await getSession();
  if (!session) return "Not logged in";
  const rank = await getHighestRank(session.uuid);
  const isStaff = rank?.staff || false;

  if (!isStaff && !(await canUseForum(session.uuid))) return "Permission denied";

  const client = new HTTPClient(process.env.API_URL!);
  const result = await DeleteThread(client, threadId);

  if (!result.success) {
    return result.error || "Failed to delete thread";
  }
}


