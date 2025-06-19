import { Forum } from '@/types/api';
import ForumComponent from './Forum';
import Link from 'next/link';

interface CategoryProps {
  name: string;
  forums: Forum[];
}

export default function Category({ name, forums }: CategoryProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">{name}</h2>
      <div className="flex flex-col gap-2">
        {forums.map(f => (
          <Link key={f.id} href={`/forums/${f.id}`}>
            <ForumComponent
              name={f.name}
              description={f.description}
              threadCount={f.threadCount}
              replyCount={f.replyCount}
              lastThread={f.lastThread}
              locked={f.locked}
              permission={f.permission}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}