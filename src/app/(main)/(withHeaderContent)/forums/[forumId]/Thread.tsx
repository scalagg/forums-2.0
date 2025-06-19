import { ServerMCHead } from '@/components/Minecraft/Server';
import TableEntry from '@/components/Table/TableEntry';
import NavLink from '@/components/NavLink/component';
import { ThreadReply } from '@/types/api';
import { stringToDate, toLocaleString } from '@/libs/Utils';
import { getAuthorInfo } from '../Utils';

export interface ThreadData {
  id: string;
  authorId: string; // UUID
  title: string;
  createdAt: string;
  replies: ThreadReply[];
  forumId: string;
}

// Thread reply sorter function for API ThreadReply type
const replySorter = (a: ThreadReply, b: ThreadReply) => {
  const dateA = new Date(a.createdAt).getTime();
  const dateB = new Date(b.createdAt).getTime();
  return dateB - dateA;
};

const ThreadComponent = async (props: ThreadData) => {
  const {
    id,
    authorId,
    title,
    createdAt,
    replies,
    forumId,
  } = props;
  const thisThreadId = id;
  const authorPromise = getAuthorInfo(authorId);

  const lastReply = replies.sort(replySorter)[0];
  const lastReplyAuthor = await getAuthorInfo(lastReply?.author);
  
  const author = await authorPromise

  const getRankColor = (r?: string) => ({ // TODO: Properly get rank color
    Owner: "#9F000C",
    Developer: "#ff4141"
  }[r ?? '']) ?? "#ffffff"

  return (
    <TableEntry>
      <span className="inline-flex flex-row gap-2">
        <div className="w-[35px] h-[37px] relative">
          <ServerMCHead shadowColor={getRankColor(author?.rank?.name)} className="scale-[.5] absolute left-[-15px] top-[-13px]" username={author?.username} />
        </div>
          <span className="flex flex-col justify-center items-start text-start">
            <NavLink href={`/forums/${forumId}/${id}`} className="h-fit w-fit">
              <h6 className="text-neutral">{title}</h6>
            </NavLink>
            <small className="inline-flex gap-1">Posted by
              <NavLink href={`/u/${author?.username}`} style={{color: getRankColor(author?.rank?.name)}}>{author?.username}</NavLink>
            </small>
            <NavLink href={`/forums/${forumId}/${id}`} className="h-fit w-fit">
              <small className="smaller">{toLocaleString(stringToDate(createdAt))}</small>
            </NavLink>
          </span>
      </span>

      <small className="flex justify-center text-center">{replies.length}</small>

      <small className="flex flex-col items-end text-end">
        <NavLink href={`/u/${lastReplyAuthor?.username}`} style={{color: getRankColor(lastReplyAuthor?.rank?.name)}}>{lastReplyAuthor?.username}</NavLink>
        <small className="smaller">
          {toLocaleString(stringToDate(lastReply?.createdAt))}
        </small>
      </small>
    </TableEntry>
  );
}
export default ThreadComponent;