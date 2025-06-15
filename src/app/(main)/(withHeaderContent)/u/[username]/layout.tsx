import './styles.css'
import { ServerMCBust, ServerMCHead } from '@/components/Minecraft/Server';
import Link from 'next/link';
import React from "react";
import NavLink from "@/components/NavLink/component";
import { headers } from 'next/headers';
import HeaderContext from '@/components/HeaderContext';
import { GetFriends, getCurrentServer, getUsernameFromUuid, getUuid } from '@/services/forum/account/AccountService';
import { isResultError } from '@/libs/Utils';
import { GetActiveRanks, GetRank, getRankColor, getRankFromName } from '@/services/controller/GrantService';
import { GetProfileFromUuid, GetPublicConnections } from '@/services/controller/ProfileService';
import { getPunishments } from '@/services/forum/punishment/PunishmentService';
import SocialConnections from './SocialConnections';
import getSession from '@/libs/session/getSession';
import Rank from '@/libs/types/entities/Rank';

interface UserParams {
  children: React.ReactNode;
}
export default async function Layout({ children: children }: UserParams) {
  const session = await getSession();
  // Get session ranks from grants
  const sessionGrants = await GetActiveRanks(session.uuid);
  const sessionRanks: Rank[] = [];
  for (const grant of sessionGrants) {
    const [rank] = await GetRank(grant.rankId);
    if (rank) sessionRanks.push(rank);
  }
  const sessionIsStaff = sessionRanks.some(rank => rank.staff);

  const currPath = new URL(headers().get('x-url')!).pathname;
  const username = currPath?.split('/')[2];
  const uuid = await getUuid(username);

  const profile = (await GetProfileFromUuid(uuid))[0]!;

  if (!profile) {
    return <>
      <HeaderContext setTo={["User", "User not found"]} />
      <h1 className="mt-4 text-xxl font-bold text-white">User not found</h1>
    </>
  }

  // Get user ranks from grants
  const userGrants = await GetActiveRanks(uuid);
  const userRanks: Rank[] = [];
  for (const grant of userGrants) {
    const [rank] = await GetRank(grant.rankId);
    if (rank) userRanks.push(rank);
  }
  const highestRank = userRanks.reduce((r, h) => r?.priority > h?.priority ? r : h, { priority: -1 } as Rank);
  const rankColor = highestRank && highestRank._id ? (await getRankColor(highestRank._id)) : "#FFFFFF";

  const server = await getCurrentServer(uuid);
  let status = server ? "online" : "offline";
  let dateJoined;
  let lastSeenOn;


  // TODO: Find a way to get sessions from mongo or something
  if (!Array.isArray(profile.logins) || profile.logins.length === 0) {
    dateJoined = "N/A";
    lastSeenOn = "N/A";
  } else {
    const dateJoinedMillis = profile.logins.reduce((acc, crr) => crr.time < acc ? crr.time : acc, Date.now());
    const lastSeenOnMillis = profile.logins.reduce((acc, crr) => crr.time > acc ? crr.time : acc, Date.now());

    // i know its cursed but it doesnt work otherwise
    dateJoined = new Date(dateJoinedMillis / 1000 * 1000).toDateString();
    lastSeenOn = new Date(lastSeenOnMillis / 1000 * 1000).toDateString();
  }

  let punishments = (await getPunishments(uuid))[0] || [];

  if (punishments.find(p => p.punishmentType == "BLACKLIST" && p.active))
    status = "blacklisted"
  else if (punishments.find(p => p.punishmentType == "BAN" && p.active))
    status = "banned"

  const statusColor: { f: string, b: string } = {
    online: {
      b: "#12651E",
      f: "#AFAFAF",
    },
    offline: {
      b: "#AA222E",
      f: "#AFAFAF",
    },
    banned: {
      b: "#CA1212",
      f: "#000000",
    },
    blacklisted: {
      b: "#120000",
      f: "#FF4A4A",
    }
  }[status] ?? { f: "#000000", b: "#696969" };

  let friends: { uuid: string, name: string }[] = [];

  if (uuid) {
    const res0 = await GetFriends(uuid);
    const isError = isResultError(res0);
    if (isError)
      console.error("Could not fetch user friends: HTTP " + res0[1]);
    else {
      for (const acc of res0[0]!) {
        friends.push({
          uuid: acc.uuid,
          name: (await getUsernameFromUuid(acc.uuid))!,
        });
      }
    }
  }

  const friendNum = friends.length;

  // Helper functions for social icons and colors
  function getSocialIcon(type: string) {
    switch (type) {
      case "twitter": return "fab fa-twitter";
      case "discord": return "fab fa-discord";
      case "youtube": return "fab fa-youtube";
      case "instagram": return "fab fa-instagram";
      default: return "fas fa-link";
    }
  }
  function getSocialColor(type: string) {
    switch (type) {
      case "twitter": return "#1da1f2";
      case "discord": return "#7289da";
      case "youtube": return "#ff0000";
      case "instagram": return "#e1306c";
      default: return "#888";
    }
  }
  function getSocialUrl(type: string, value: string) {
    switch (type) {
      case "twitter": return `https://twitter.com/${value}`;
      case "youtube": return `https://youtube.com/${value}`;
      case "instagram": return `https://instagram.com/${value}`;
      default: return null;
    }
  }

  // Extract socials from the profile's AccountProfile.social field
  const knownSocials = ["twitter", "discord", "github", "youtube", "instagram"];
  const socialObj = (profile as any)?.profile?.social || {};
  const socialList = Object.entries(socialObj)
    .filter(([type, value]) => knownSocials.includes(type) && value && typeof value === 'string' && value.trim() !== "")
    .map(([type, value]) => ({
      type,
      value: value as string,
      url: getSocialUrl(type, value as string)
    }));

  const headerContent: [string, string] = ["User", `Checkout ${username}'s amazing profile!`];
  return <>
    <HeaderContext setTo={headerContent} />
    <div className="sect flex w-full h-full justify-center items-center">
      <div className="window flex h-fit w-fit inner p-2 gap-4 bg-base-300 rounded-xl">
        <div className="grid-container mb-auto h-min w-full gap-4">
          <div
            className="row-span-3 flex flex-col justify-between items-center gap-4 rounded-lg overflow-hidden bg-base-200">
            <div style={{ backgroundColor: statusColor.b }}
              className="flex w-full py-2 rounded-t-lg border-[1px] border-gray-400">
              <small
                style={{ color: statusColor.f }}
                className="uppercase text-center w-full text-gray-100 tracking-wider font-extrabold">{status}</small>
            </div>
            <ServerMCBust className="mx-12" username={username} shadowColor={rankColor} />
            <span className="text-center inline-flex flex-col">
              <h5 className="font-bold">{username ?? "Unknown"}</h5>
              <small style={{ color: rankColor }} className="smaller font-bold uppercase tracking-wider">{highestRank.name}</small>
            </span>
            <div style={{ backgroundColor: statusColor.b, color: statusColor.f }}
              className="flex w-full py-2 rounded-b-lg border-[1px] border-gray-400">
              <small
                style={{ color: statusColor.f }}
                className="uppercase text-center w-full tracking-wider font-bold">{server}</small>
            </div>
          </div>
          <div className="flex flex-col text-center rounded-lg overflow-hidden bg-base-200 py-2 px-4 whitespace-nowrap">
            <small>First joined on <b>{dateJoined}</b></small>
            <small>Last seen on <b>{lastSeenOn}</b></small>
          </div>
          {socialList.length > 0 && (
            <div className="flex flex-row gap-2">
              {socialList.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.value}
                  style={{ color: getSocialColor(social.type) }}
                >
                  <i className={getSocialIcon(social.type)} />
                </a>
              ))}
            </div>
          )}
          <div className="flex flex-col text-center rounded-lg overflow-hidden bg-base-200 p-2 py-1 whitespace-nowrap">
            <small
              className="uppercase font-bold smaller mb-2 mt-1">{friendNum} {"friend" + (friendNum === 1 ? '' : 's')}</small>
            <div className="flex flex-row flex-wrap gap-y-1 gap-x-2 justify-center">
              {friends.slice(0, 6).map((f, i) =>
                <Link key={i} href={`/u/${f.name}`} className="w-[45px] h-[49px] relative">
                  <ServerMCHead shadowColor="green" className="scale-[.675] absolute left-[-11px] top-[-12px]"
                    uuid={f.uuid}
                    username={f.name} />
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col h-min w-screen max-w-full gap-4 content">
          <div className="flex flex-wrap w-full gap-4">
            <NavLink className="btn bg-base-200 hover:bg-base-100 py-2 px-4 min-h-fit h-fit flex-1"
              href={`/u/${username ? username + '/general' : ''}`}>
              General
            </NavLink>
            {/*<NavLink className="btn bg-base-200 hover:bg-base-100 py-2 px-4 min-h-fit h-fit flex-1"
              href={`/u/${username ? username + '/statistics' : ''}`}>
              Statistics
            </NavLink>
            <NavLink className="btn bg-base-200 hover:bg-base-100 py-2 px-4 min-h-fit h-fit flex-1"
              href={`/u/${username ? username + '/forums' : ''}`}>
              Forums
            </NavLink>*/}
            {sessionIsStaff
              ? <NavLink className="btn bg-base-200 hover:bg-base-100 py-2 px-4 min-h-fit h-fit flex-1"
                href={`/u/${username ? username + '/staff' : ''}`}>
                Staff View
              </NavLink>
              : <></>}
          </div>
          <div
            className="overflow-y-scroll overflow-x-hidden min-h-[492px] h-[492px] w-full max-w-full p-4 bg-base-200 rounded-lg inner-content">
            {React.Children.map(children, child =>
              React.isValidElement(child) ? React.cloneElement(child, {} as any) : child
            )}
          </div>
        </div>
      </div>
    </div>
  </>;
}
