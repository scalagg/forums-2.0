import './styles.css'
import { ServerMCBust, ServerMCHead } from "@/components/Minecraft/Server";
import { DeleteThread, EditThread, getThread, getThreadsByForum } from '@/services/forum/thread/ThreadService';
import { isResultError, stringToDate, toLocaleString } from "@/libs/Utils";
import HashLink from '@/components/HashLink';
import getSession from '@/libs/session/getSession';
import { getAuthorInfo, getThreadShortId } from '../../Utils'
import ReplyForm from './ReplyForm';
import Replies from './Replies';
import React, { PropsWithChildren, ReactNode } from "react";
import Navigation from "@/app/(main)/(withHeaderContent)/forums/(components)/Navigation";
import Link from 'next/link';
import SideOptions, { SideOption } from '../../(components)/SideOptions';
import { getHighestRank } from '@/services/controller/GrantService';
import { getForum } from '@/services/forum/forum/ForumService';
import { redirect } from 'next/navigation';
import { canUseForum } from '@/services/forum/account/AccountService';
import { marked } from "marked"
import DOMPurify from 'isomorphic-dompurify';
import HTTPClient from '@/libs/HTTPClient';

interface Props {
  params: {
    forumId: string;
    threadId: string;
  },
}
export default async function Page(props: Props) {
  const { forumId, threadId } = props.params;
  const client = new HTTPClient(process.env.API_URL!);

  console.log("Thread page params:", { forumId, threadId });

  // Handle undefined or invalid threadId
  if (!threadId || threadId === 'undefined') {
    console.error("Invalid threadId:", threadId);
    return (
      <div className="flex flex-col gap-4 p-8 rounded-lg h-fit w-screen max-w-[996px] items-center">
        <h4>Invalid thread ID. Please check the URL.</h4>
      </div>
    );
  }

  // Handle short ID by fetching all threads and finding the matching one
  let fullThreadId = threadId;
  if (threadId && threadId !== 'undefined') {
    // First try to get the thread directly (in case it's already a full ID)
    const directResult = await getThread(client, threadId);
    if (!directResult.success) {
      // If that fails, fetch all threads from the forum and find the one with matching short ID
      console.log("Direct thread fetch failed, trying to find by short ID");
      const threadsResult = await getThreadsByForum(client, { forumId });
      if (threadsResult.success && threadsResult.data) {
        console.log("Available threads:", threadsResult.data.map(t => ({ id: t.id, shortId: getThreadShortId(t.id) })));
        const matchingThread = threadsResult.data.find(t => getThreadShortId(t.id) === threadId);
        if (matchingThread) {
          fullThreadId = matchingThread.id;
          console.log("Found thread with short ID:", { shortId: threadId, fullId: fullThreadId });
        } else {
          console.error("No thread found with short ID:", threadId);
          console.log("Available short IDs:", threadsResult.data.map(t => getThreadShortId(t.id)));
        }
      }
    }
  }

  const result = await getThread(client, fullThreadId);
  console.log("Thread fetch result:", { success: result.success, error: result.error, thread: result.data });
  
  if (!result.success) {
    console.error("Error fetching thread:", result.error);
  }
  const thread = result.data;

  if (!thread) return <>
    <div className="flex flex-col gap-4 p-8 rounded-lg h-fit w-screen max-w-[996px] items-center">
      <h4>{!result.success && result.error !== "Thread not found" ? "An Error has occurred while fetching this thread." : "This thread was not found. Perhaps it got deleted?"}</h4>
    </div>
  </>;

  console.log("Thread data:", { 
    id: thread.id, 
    _id: thread._id, 
    title: thread.title,
    forum: thread.forum 
  });

  const authorPromise = getAuthorInfo(thread.author);

  const session = await getSession();
  const currentUser = await getAuthorInfo(session?.uuid);

  const author = await authorPromise;

  const lastEdited = stringToDate(thread.updatedAt); // Use updatedAt instead of lastEditedAt
  const createdAt = stringToDate(thread.createdAt);
  const replies = thread.replies;

  const getRankColor = (r?: string) => ({ // TODO: Properly get rank color
    OWNER: "#9F000C",
    DEVELOPER: "#ff4141"
  }[r ?? '']) ?? "#ffffff";

  const forum = await getForum(client, forumId);
  if (!forum) {
    console.error("Forum not found");
    return <div>Forum not found</div>;
  }

  const bodyMarkdownUNSAFE = marked.parse(thread.body) as string;
  const bodyMarkdown = DOMPurify.sanitize(bodyMarkdownUNSAFE);
  

  const locked = thread.locked || forum?.locked
  const blocked = !(await canUseForum(session.uuid))

  const sideOptions: SideOption[] = [];

  if (author?.username == currentUser?.username && !locked && !blocked) {
    sideOptions.push({
      name: "Delete Thread Post",
      color: "red",
      disabled: false,
      href: `/forums/${forumId}/${thread.id || thread._id}/deleteSoft`
    });
  }

  if (currentUser?.rank?.staff) {
    sideOptions.push({
      name: "[ADM] Delete Thread",
      color: "red",
      disabled: false,
      href: `/forums/${forumId}/${thread.id || thread._id}/deleteHard`
    })

    if (!thread.locked) {
      sideOptions.push({
        name: "[ADM] Lock Thread",
        color: "red",
        disabled: false,
        href: `/forums/${forumId}/${thread.id || thread._id}/lock`
      })
    } else if (!forum.locked) {
      sideOptions.push({
        name: "[ADM] Unlock Thread",
        color: "red",
        disabled: false,
        href: `/forums/${forumId}/${thread.id || thread._id}/unlock`
      })
    }
  }

  return <div className="flex flex-row flex-wrap justify-center w-[80%]">
    <Navigation>
      <div className="flex flex-col gap-4 p-2 rounded-lg h-fit w-screen max-w-[996px]">
        {thread.locked || forum.locked
          ? <span className="px-3 text-lg text-red-500">{forum.locked ? "This thread's forum is locked" : "This thread is locked"}</span>
          : <></>}
        <div className="flex bg-base-200 rounded-xl">
          <div className="flex flex-col items-center py-8">
            <ServerMCBust className="mx-8 mb-4" username={author?.username} />
            <span className="text-center inline-flex flex-col">
              <Link href={`/u/${author?.username}`}><h5
                className="font-bold">{author?.username ?? "Unknown"}</h5></Link>
              <small style={{ color: getRankColor(author?.rank?.name) }}
                className="smaller font-bold uppercase tracking-wider">{author?.rank?.name}</small>
            </span>
          </div>
          <div className="flex flex-col min-h-full w-full bg-base-100 p-4 rounded-r-lg">
            <h3 className="text-neutral"><b>{thread.title}</b></h3>
            <div className="flex-1 whitespace-pre-line break-normal markdown"
              dangerouslySetInnerHTML={{__html: bodyMarkdown}}>
            </div>
            <small className="smaller flex flex-col">
              <span>Last edited: {toLocaleString(lastEdited)}</span>
              <span>Posted: {toLocaleString(createdAt)}</span>
            </small>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-xl border-[1px] border-base-200">
          <div className="flex items-center py-3 px-6 w-full gap-2">
            {session?.isLoggedIn ?
              <>
                <div className="w-[39px] h-[37px] relative">
                  <ServerMCHead shadowColor={getRankColor(currentUser?.rank?.name)}
                    className="scale-[.5] absolute left-[-16px] top-[-18px]"
                    username={currentUser?.username} />
                </div>
                <ReplyForm forumId={forumId} threadId={thread.id || thread._id} locked={(thread.locked || forum.locked) && !currentUser?.rank?.staff} blocked={blocked} />
              </> :
              <h6 className="font-bold w-full">You are not logged in.</h6>
            }
          </div>

          <Replies replies={replies} threadId={thread.id || thread._id} />
        </div>
      </div>
    </Navigation>
    <SideOptions options={sideOptions} />
  </div>;
}
