'use server'

import { redirect } from "next/navigation";
import { EditThread, getThread } from "@/services/forum/thread/ThreadService";
import HTTPClient from "@/libs/HTTPClient";

export async function unlockThread(threadId: string) {
  'use server'
  const client = new HTTPClient(process.env.API_URL!);
  const result = await getThread(client, threadId);
  const thread = result.success ? result.data : undefined;

  if (!thread) {
    return "Thread not found";
  }

  const editResult = await EditThread(client, {
    ...thread,
    locked: false
  });

  if (!editResult.success) {
    return editResult.error || "Failed to unlock thread";
  }

  redirect(`/forums/${thread.forum}/${thread.id}`);
}


