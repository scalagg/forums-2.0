import './styles.css'
import ThreadInfo from './(components)/ThreadInfo';
import { awaitAll, isResultError, stringToDate, toLocaleString } from '@/libs/Utils';
import { getAuthorInfo, getThreadShortId, threadSorter } from './Utils';
import { ForumCategory } from '@/types/api';
import CategoryController from '@/services/controller/CategoryController';
import Category from './(components)/Category';
import AsideInfo from './(components)/AsideInfo';
import { Thread } from '@/types/api';
import ThreadController from '@/services/controller/ThreadController';
import Navigation from "@/app/(main)/(withHeaderContent)/forums/(components)/Navigation";
import Link from 'next/link';
import SideOptions, { SideOption } from './(components)/SideOptions';
import getSession from '@/libs/session/getSession';
import { getHighestRank } from '@/services/controller/GrantService';
import HTTPClient from '@/libs/HTTPClient';

interface UserParams {}

export default async function Page({ }: UserParams) {
  const client = new HTTPClient(process.env.API_URL!);
  const categoryController = new CategoryController(client);
  const threadController = new ThreadController(client);

  const [categories, error] = await categoryController.getAllCategories();
  if (error) {
    console.error("Error fetching categories:", error);
  }
  categories?.sort((a, b) => b.weight - a.weight);

  const session = await getSession();
  const rank = await getHighestRank(session.uuid);
  const isStaff = rank?.staff || false;

  const getRankColor = (r?: string) => ({ // TODO: Properly get rank color
    Owner: "#9F000C",
    Developer: "#ff4141"
  }[r ?? '']) ?? "#ffffff";

  const latestThreads = await awaitAll(
    categories
      ?.flatMap(c => c.forums.map(f => f.lastThread))
      .filter(t => !!t)
      .sort(threadSorter)
      .map(async t => {
        const [thread, threadError] = await threadController.getThread(t!._id);
        if (threadError) {
          console.error("Error fetching thread:", threadError);
          return undefined;
        }
        return {
          thread: thread!,
          item: <ThreadInfo 
            id={getThreadShortId(thread!._id)} 
            forumId={thread!.forum} 
            title={thread!.title} 
            threadAuthor={await getAuthorInfo(thread!.author)} 
            createdAt={thread!.createdAt} 
          />,
        };
      })
  );

  const latestReplies: { thread: Thread, item: JSX.Element }[] = (
    await awaitAll(
      latestThreads
        .filter(t => t !== undefined)
        .map(t => t!.thread)
        .map(async t => {
          const [thread, threadError] = await threadController.getThread(t._id);
          if (threadError) {
            console.error("Error fetching thread:", threadError);
            return undefined;
          }
          return { reply: thread!.replies.sort(threadSorter)[0], parent: t };
        })
        .map(async (r) => {
          const res = await r;
          if (!res?.reply) return;
          const author = await getAuthorInfo(res.reply.author);
          const authorName = author!.username;
          const threadUrl = `/forums/${res.reply.forum}/${getThreadShortId(res.parent._id)}`;
          return {
            thread: res.reply,
            item: (
              <small key={res.reply._id} className="flex flex-col items-end text-end">
                <span className="inline-flex gap-1 flex-nowrap whitespace-nowrap">
                  <Link href={`/u/${authorName}`} style={{ color: getRankColor(author!.rank?.name) }}>{authorName}</Link> replied to
                  <Link href={threadUrl} className="flex flex-col text-neutral">"{res.parent.title}"</Link>
                </span>
                <Link href={threadUrl} className="flex flex-col">
                  <small className="smaller">{toLocaleString(stringToDate(res.reply.createdAt))}</small>
                </Link>
              </small>
            ),
          };
        })
    )).filter(t => !!t) as any;

  const aside = [
    {
      title: 'Latest Threads',
      content: latestThreads.filter(t => t !== undefined),
    },
    {
      title: 'Latest Replies',
      content: latestReplies,
    },
  ];

  let sideOptions: SideOption[] = [];

  if (isStaff) {
    sideOptions.push(
      {
        name: "[ADM] Create Category",
        color: "green",
        disabled: false,
        href: "/forums/createCategory"
      },
      {
        name: "[ADM] Delete Category",
        color: "red",
        disabled: false,
        href: "/forums/deleteCategory"
      },
      {
        name: "[ADM] Create Forum",
        color: "green",
        disabled: false,
        href: "/forums/createForum"
      },
      {
        name: "[ADM] Delete Forum",
        color: "red",
        disabled: false,
        href: "/forums/deleteForum"
      },
      {
        name: "[ADM] Lock Forum",
        color: "red",
        disabled: false,
        href: "/forums/lockForum"
      },
      {
        name: "[ADM] Unlock Forum",
        color: "red",
        disabled: false,
        href: "/forums/unlockForum"
      }
    );
  }

  return (
    <div className="flex flex-row flex-wrap justify-center w-[80%]">
      <Navigation>
        <div className="flex flex-wrap-reverse h-full w-full gap-4">
          <div className="flex flex-col overflow-y-scroll overflow-x-hidden gap-3 rounded-lg min-h-[522px] h-[522px] w-full categories content">
            {!categories || !categories.length ? (
              <span className="col-span-full w-full max-w-[996px] text-center my-4">
                {error ? <h4>Error while fetching categories.</h4> : <small>0 categories in this forum.</small>}
              </span>
            ) : (
              categories.map(c => <Category key={c.id} name={c.name} forums={c.forums} />)
            )}
          </div>
          <aside className="aside-container gap-3 w-full self-end">
            {aside.map((a, i) => <AsideInfo key={i} title={a.title} content={a.content} />)}
          </aside>
        </div>
      </Navigation>
      <SideOptions options={sideOptions} />
    </div>
  );
}
