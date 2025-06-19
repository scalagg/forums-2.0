'use server'

import { isResultError, newUuid } from "@/libs/Utils";
import getSession from "@/libs/session/getSession";
import { getHighestRank } from "@/services/controller/GrantService";
import { updateForum, getForum } from "@/services/forum/forum/ForumService";
import { HTTPClient } from "@/libs/HTTPClient";

export async function unlockForum(formData: FormData): Promise<string | undefined> {

  const session = await getSession();
  if (!session)
    return "Not logged in";
  const rank = await getHighestRank(session.uuid);
  const isStaff = rank?.staff || false;
  if (!isStaff)
    return "Permission denied";

  const id = formData.get("forumId");
  if (!id)
    return "Forum not selected"

  const forum = await getForum(new HTTPClient(process.env.API_URL!), id.toString());
  if (!forum)
    return "Forum not found"

  const res = await updateForum(
    new HTTPClient(process.env.API_URL!),
    id.toString(),
    { locked: false }
  );

  if (!res)
    return "Failed to update forum";
} 