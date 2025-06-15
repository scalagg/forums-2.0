import { toLocaleString, stringToDate } from '@/libs/Utils';
import { getThreadShortId } from '../Utils';
import Link from 'next/link';

interface ThreadInfoProps {
  id: string;
  forumId: string;
  title: string;
  threadAuthor: {
    username: string;
    rank?: {
      name: string;
      color: string;
    };
  };
  createdAt: string;
}

export default function ThreadInfo({ 
  id, 
  forumId, 
  title, 
  threadAuthor, 
  createdAt 
}: ThreadInfoProps) {
  return (
    <div className="flex flex-col items-end text-end">
      <Link href={`/forums/${forumId}/${id}`} className="text-blue-400 hover:underline">
        {title}
      </Link>
      <div className="flex gap-2 text-sm text-neutral-400">
        <span>by</span>
        <Link 
          href={`/u/${threadAuthor.username}`} 
          style={{ color: threadAuthor.rank?.color ?? '#ffffff' }}
        >
          {threadAuthor.username}
        </Link>
        <span>•</span>
        <span>{toLocaleString(stringToDate(createdAt))}</span>
      </div>
    </div>
  );
}
