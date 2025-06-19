import HomeHeader from './HomeHeader'
import DiscordWidget from '@/components/DiscordWidget/component'
import NewsWidget from '@/components/NewsWidget/component'
import MCServerWidget from '@/components/Minecraft/MCServerWidget/component'
import getSession from '@/libs/session/getSession';
import { getHighestRank } from '@/services/controller/GrantService';
import { GetRank } from '@/services/controller/GrantService';
import { getEntry } from '@/services/forum/websiteData/WebsiteDataService';
import Bullet from './Bullet';
import ClipboardTooltip from '@/components/ClipboardTooltip/ClipboardTooltip';
import { getThread } from '@/services/forum/thread/ThreadService';
import Thread from '@/libs/types/entities/Thread';
import { existsSync } from 'fs';
import { marked } from "marked"
import DOMPurify from 'isomorphic-dompurify';
import HTTPClient from '@/libs/HTTPClient';

export default async function Page() {
  const client = new HTTPClient(process.env.API_URL!);
  const session = await getSession();
  const rank = await getHighestRank(session.uuid);
  const isStaff = rank?.staff || false;
  const headline = await getEntry("headline", client) || "";
  const headlineColor = await getEntry("headlineColor", client) || "green"

  const mainHightlightId = await getEntry("highlightThreadMain", client)
  let mainHighlight;

  if (!mainHightlightId) {
    mainHighlight = undefined;
  } else {
    const result = await getThread(client, mainHightlightId);
    mainHighlight = result.success ? result.data : undefined;
    if (mainHighlight) {
      const bodyMarkdownUNSAFE = marked.parse(mainHighlight?.body || "") as string;
      const bodyMarkdown = DOMPurify.sanitize(bodyMarkdownUNSAFE);
      mainHighlight.body = bodyMarkdown;
    }
  }

  const highlights: Thread[] = [];

  for (let i = 0; ; i++) {
    const id = await getEntry(`highlightThread${i}`, client);
    if (!id) break;
    if (id == "None") continue;

    const result = await getThread(client, id);
    const thread = result.success ? result.data : undefined;
    if (thread) {
      const bodyMarkdownUNSAFE = marked.parse(thread.body) as string;
      const bodyMarkdown = DOMPurify.sanitize(bodyMarkdownUNSAFE);
      thread.body = bodyMarkdown;
      highlights.push(thread);
    }
  }

  return (
    <div className="home-h flex-none flex flex-col items-center">
      <HomeHeader isStaff={isStaff} />

      <div className="w-screen max-w-screen-xl px-4 sm:px-6 py-6 flex flex-col">
        <div className="flex flex-wrap md:flex-nowrap gap-6 mb-6">
          <div className="home-border inline-flex gap-2 items-center justify-center rounded-lg bg-base-300 min-w-[350px] min-h-full flex-[3_0_min-content] py-2 px-4">
            <Bullet color={headlineColor} />
            <h6 className="mb-0.5 uppercase font-bold tracking-wider">{headline}</h6>
          </div>
          <ClipboardTooltip toCopy="scala.gg">
            <MCServerWidget className="flex-[1_0_min-content]" />
          </ClipboardTooltip>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col flex-[1_0_min-content] w-full news-container">
            {mainHighlight
              ? <NewsWidget className="main" src={`/img/thread/${mainHighlight.id}.jpeg`} useFallback={!existsSync(`${process.cwd()}/public/img/thread/${mainHighlight.id}.jpeg`)} title={mainHighlight.title} href={`/forums/${mainHighlight.forum}/${mainHighlight.id}`}
                body={mainHighlight.body.length > 100
                  ? mainHighlight.body.substring(0, 100) + "..."
                  : mainHighlight.body} />
              : <></>}
            <hr className="my-6 mx-auto" />
            <div className="flex flex-row w-fit gap-4">
              {highlights.map((h, i) =>
                <NewsWidget key={i} src={`/img/thread/${h.id}.jpeg`} title={h.title} useFallback={!existsSync(`${process.cwd()}/public/img/thread/${h.id}.jpeg`)} href={`/forums/${h.forum}/${h.id}`}
                  body={h.body.length > 100
                    ? h.body.substring(0, 100) + "..."
                    : h.body} />
              )}
            </div>
          </div>

          <DiscordWidget className="flex flex-col flex-[1_0_min-content]" guildId="999774017223409714" />
        </div>
      </div>
    </div>
  );
}


interface FeaturedProps {
  title: string;
  body: string;
  price: number;
  className?: string;
}
const Featured = (props: FeaturedProps) => {
  const { title, body, price, className } = props;
  return (
    <div className={`flex flex-col ${className || ''}`}>
      <div className="flex rounded-xl justify-between bg-base-200 hover:bg-base-300 cursor-pointer gap-4 p-4">
        <div className="flex flex-col gap-2">
          <small className="uppercase">{title}</small>
          <h5 className="font-bold title">{body}</h5>
          <p className="body">${price}</p>
        </div>

        <div className="flex justify-center items-center flex-[0_0_min-content]">
          {body}
        </div>
      </div>
    </div>
  );
}
