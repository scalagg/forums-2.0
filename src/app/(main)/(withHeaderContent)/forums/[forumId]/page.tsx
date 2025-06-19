import Table from '@/components/Table/Table';
import ThreadComponent from './Thread';
import { getThreadsByForum, getThread } from '@/services/forum/thread/ThreadService';
import { getForum } from '@/services/forum/forum/ForumService';
import { isResultError } from '@/libs/Utils';
import { getThreadShortId, threadSorter } from '../Utils';
import Navigation from "@/app/(main)/(withHeaderContent)/forums/(components)/Navigation";
import HTTPClient from '@/libs/HTTPClient';

interface Params {
  params: {
    forumId: string;
  }
}
export default async function Page({ params: { forumId } }: Params) {
  const result0 = await getThreadsByForum(new HTTPClient(process.env.API_URL!), { forumId });
  if (!result0.success) {
    console.error("Error while fetching threads from Id: " + result0.error);
  }
  const threads = result0.data || [];
  
  for (let t = 0; t < (threads?.length ?? 0); t++) {
    const result = await getThread(new HTTPClient(process.env.API_URL!), threads![t]._id);
    if (!result.success) {
      console.error("Error while fetching thread replies: " + result.error);
    }
    threads![t].replies = result.data?.replies ?? [];
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
            threads.sort(threadSorter).map(t =>
              <ThreadComponent key={t._id} id={getThreadShortId(t._id)!}
                               authorId={t.author} title={t.title} createdAt={t.createdAt} replies={t.replies}
                               forumId={t.forum}/>
            )}
        </Table>
      </div>
    </Navigation>
  );
} 