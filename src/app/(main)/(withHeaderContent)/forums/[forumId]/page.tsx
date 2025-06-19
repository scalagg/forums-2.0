import Table from '@/components/Table/Table';
import ThreadComponent from './Thread';
import { getThreadsByForum, getThread } from '@/services/forum/thread/ThreadService';
import { getForum } from '@/services/forum/forum/ForumService';
import { isResultError } from '@/libs/Utils';
import { getThreadShortId } from '../Utils';
import Navigation from "@/app/(main)/(withHeaderContent)/forums/(components)/Navigation";
import HTTPClient from '@/libs/HTTPClient';
import { Thread } from '@/types/api';

interface Params {
  params: {
    forumId: string;
  }
}

// Thread sorter function for API Thread type
const threadSorter = (a: Thread, b: Thread) => {
  const dateA = new Date(a.createdAt).getTime();
  const dateB = new Date(b.createdAt).getTime();
  return dateB - dateA;
};

export default async function Page({ params: { forumId } }: Params) {
  const result0 = await getThreadsByForum(new HTTPClient(process.env.API_URL!), { forumId });
  if (!result0.success) {
    console.error("Error while fetching threads from Id: " + result0.error);
  }
  const threads = result0.data || [];
  
  console.log("Threads from API:", threads.map(t => ({ 
    _id: t._id, 
    id: t.id, 
    title: t.title,
    forum: t.forum 
  })));
  
  // Only fetch replies for threads that have valid IDs (not timestamps)
  for (let t = 0; t < (threads?.length ?? 0); t++) {
    const thread = threads![t];
    const threadId = thread.id || thread._id;
    
    // Skip if the thread ID looks like a timestamp (more than 10 digits)
    if (threadId && threadId.length > 10 && /^\d+$/.test(threadId)) {
      console.warn("Skipping thread with timestamp-like ID:", threadId);
      continue;
    }
    
    if (threadId) {
      const result = await getThread(new HTTPClient(process.env.API_URL!), threadId);
    if (!result.success) {
      console.error("Error while fetching thread replies: " + result.error);
    }
    threads![t].replies = result.data?.replies ?? [];
    }
  }

  const forum = await getForum(new HTTPClient(process.env.API_URL!), forumId);
  if (!forum) {
    console.error("Forum not found");
    return <div>Forum not found</div>;
  }
  const forumDisplayName = forum.name;
  const header = [
    <small key={0} className="flex justify-start text-start smaller tracking-wider uppercase">{forumDisplayName}</small>,
    <small key={1} className="flex justify-center text-center smaller tracking-wider uppercase">Replies</small>,
    <small key={2} className="flex justify-end text-end smaller tracking-wider uppercase">Latest reply</small>
  ];
  const locked = forum.locked;
  return (
    <Navigation>
      <div
        className="flex flex-col overflow-y-scroll overflow-x-hidden gap-4 rounded-lg min-h-[579px] h-[579px] w-full categories">
        <Table headerContent={header}>
          {locked
            ? <span className="text-lg text-red-500 px-3">This Forum is Locked</span>
            : <></>}
          {!threads || !threads.length ?
            <span className="col-span-full text-center my-4">{isResultError(result0) ?
              <h4>Error while fetching threads for forum.</h4> :
              <small>0 threads in this forum. Be the first!</small>}</span> :
            threads.sort(threadSorter).map((t, index) => {
              console.log("Creating ThreadComponent with thread:", { 
                _id: t._id, 
                id: t.id,
                title: t.title, 
                forum: t.forum 
              });
              
              // Check if we have a valid thread ID
              const threadId = t.id || t._id;
              if (!threadId) {
                console.error("Thread has no valid ID:", t);
                return null;
              }
              
              // Skip threads with timestamp-like IDs
              if (threadId.length > 10 && /^\d+$/.test(threadId)) {
                console.warn("Skipping thread with timestamp-like ID:", threadId);
                return null;
              }
              
              return (
                <ThreadComponent key={`${threadId}-${index}`} id={threadId}
                                 authorId={t.author} title={t.title} createdAt={t.createdAt} replies={t.replies}
                                 forumId={t.forum}/>
              );
            }).filter(Boolean)
          }
        </Table>
      </div>
    </Navigation>
  );
} 