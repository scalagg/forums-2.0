import '../styles.css'
import TableEntry from '@/components/Table/TableEntry';
import HashLink from '@/components/HashLink';
import Thread from '@/libs/types/entities/Thread';
import Rank from '@/libs/types/entities/Rank';
import ThreadInfo from './ThreadInfo';
import Link from 'next/link';
import { Thread } from '@/types/api';
import { toLocaleString, stringToDate } from '@/libs/Utils';
import { getThreadShortId } from '../Utils';

export interface ActivityData {
  thread: {
    id: string;
    title: string;
  };
  author: {
    username: string;
    rank: string;
  };
  time: string;
}

export interface ForumData {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryName: string;
  threadAmount: number;
  lastThread?: Thread;
  lastThreadAuthor?: {username: string, rank?: Rank};
}

interface ForumProps {
  name: string;
  description: string;
  threadCount: number;
  replyCount: number;
  lastThread?: Thread;
  locked: boolean;
  permission?: string;
}

export default function Forum({ 
  name, 
  description, 
  threadCount, 
  replyCount, 
  lastThread,
  locked,
  permission 
}: ForumProps) {
  return (
    <div className="flex flex-col p-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-neutral-400">{description}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex gap-4 text-sm text-neutral-400">
            <span>{threadCount} threads</span>
            <span>{replyCount} replies</span>
          </div>
          {locked && (
            <span className="text-sm text-red-500">Locked</span>
          )}
          {permission && (
            <span className="text-sm text-yellow-500">Requires permission</span>
          )}
        </div>
      </div>
      {lastThread && (
        <div className="mt-2 text-sm text-neutral-400">
          <span>Latest: </span>
          <a href={`/forums/${lastThread.forum}/${getThreadShortId(lastThread._id)}`} className="text-blue-400 hover:underline">
            {lastThread.title}
          </a>
          <span className="ml-2">
            {toLocaleString(stringToDate(lastThread.createdAt))}
          </span>
        </div>
      )}
    </div>
  );
}
