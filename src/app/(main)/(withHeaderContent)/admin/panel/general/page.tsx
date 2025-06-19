import { getAllEntries } from "@/services/forum/websiteData/WebsiteDataService"
import DataForm from "./DataForm";
import { getForum } from "@/services/forum/forum/ForumService";
import { getThreadsByForum } from "@/services/forum/thread/ThreadService";
import { Thread } from "@/types/api";
import HTTPClient from "@/libs/HTTPClient";

export default async function Page() {
  const client = new HTTPClient(process.env.API_URL!);
  
  const websiteData = await getAllEntries(client);
  const dataMap = websiteData.reduce<{[key:string]: string}>((acc,crr) => {
    acc[crr._id] = crr.value; return acc;}, {});

  const announcementsForum = await getForum(client, "Announcements");

  let threads: Thread[] = [];

  if (announcementsForum) {
    const result = await getThreadsByForum(client, { forumId: announcementsForum.id });
    if (result.success && result.data) {
      threads = result.data;
    }
  }

  return <div className="flex flex-col gap-3 py-2 px-3">
    <div className="rounded-lg p-2 w-full bg-base-200">
      <h2 className="text-center font-bolder">Website Data</h2>
      <DataForm dataMap={dataMap} announcements={threads} />
    </div>
  </div>
}