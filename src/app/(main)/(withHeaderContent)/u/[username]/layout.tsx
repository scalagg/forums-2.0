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
import { redirect } from "next/navigation";
import { FaDiscord, FaTwitter, FaYoutube, FaTelegram, FaTwitch, FaGithub } from "react-icons/fa6";

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

  // Debug output for troubleshooting
  const currPath = new URL(headers().get('x-url')!).pathname;
  const username = currPath?.split('/')[2];
  console.log('username param:', username);
  const uuid = await getUuid(username);
  console.log('uuid from getUuid:', uuid);
  const [profile, profileStatus, profileError] = await GetProfileFromUuid(uuid);
  console.log('profile:', profile);
  console.log('profileStatus:', profileStatus);
  console.log('profileError:', profileError);

  // If the profile is not found, show not found message
  if (!profile) {
    return <>
      <HeaderContext setTo={["User", "User not found"]} />
      <h1 className="mt-4 text-xxl font-bold text-white">User not found</h1>
    </>;
  }

  // If the username is a UUID, redirect to the real username if needed
  if (username && username.match(/^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/)) {
    const realUsername = profile.name;
    if (realUsername && realUsername !== username) {
      redirect(`/u/${realUsername}`);
      return null;
    }
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
  let userStatus = server ? "online" : "offline";

  const firstConnectionRaw = profile.metadata?.["first-connection"];
  const lastConnectionRaw = profile.metadata?.["last-connection"];

  const firstConnection = typeof firstConnectionRaw === 'object' && firstConnectionRaw !== null && 'value' in (firstConnectionRaw as any)
    ? (firstConnectionRaw as any).value
    : firstConnectionRaw;
  const lastConnection = typeof lastConnectionRaw === 'object' && lastConnectionRaw !== null && 'value' in (lastConnectionRaw as any)
    ? (lastConnectionRaw as any).value
    : lastConnectionRaw;

  const dateJoined = firstConnection
    ? new Date(Number(firstConnection)).toLocaleDateString()
    : "N/A";

  const lastSeenOn = lastConnection
    ? new Date(Number(lastConnection)).toLocaleDateString()
    : "N/A";

  let punishments = (await getPunishments(uuid))[0] || [];

  if (punishments.find(p => p.punishmentType == "BLACKLIST" && p.active))
    userStatus = "blacklisted"
  else if (punishments.find(p => p.punishmentType == "BAN" && p.active))
    userStatus = "banned"

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
  }[userStatus] ?? { f: "#000000", b: "#696969" };

  let friends: { uuid: string, name: string }[] = [];

  if (uuid) {
    const res0 = await GetFriends(uuid);
    if (!Array.isArray(res0)) {
      console.error("Could not fetch user friends: HTTP", res0);
    } else {
      for (const acc of res0) {
        // Determine the 'other' friend in the friendship
        let friendUuid = acc.uuidA === uuid ? acc.uuidB : acc.uuidA;
        let friendName = acc.nameA === profile.name ? acc.nameB : acc.nameA;
        friends.push({
          uuid: friendUuid,
          name: friendName,
        });
      }
    }
  }

  const friendNum = friends.length;

  // Helper functions for social icons and colors
  function getSocialIconComponent(type: string) {
    switch (type) {
      case "twitter": return <FaTwitter className="w-5 h-5 inline-block" />;
      case "discord": return <FaDiscord className="w-5 h-5 inline-block" />;
      case "youtube": return <FaYoutube className="w-5 h-5 inline-block" />;
      case "telegram": return <FaTelegram className="w-5 h-5 inline-block" />;
      case "twitch": return <FaTwitch className="w-5 h-5 inline-block" />;
      case "github": return <FaGithub className="w-5 h-5 inline-block" />;
      default: return <i className="fas fa-link" />;
    }
  }
  function getSocialColor(type: string) {
    switch (type) {
      case "twitter": return "#1da1f2";
      case "discord": return "#7289da";
      case "youtube": return "#ff0000";
      case "telegram": return "#0088cc";
      case "twitch": return "#9146ff";
      case "github": return "#333333";
      default: return "#888";
    }
  }
  function getSocialUrl(type: string, value: string) {
    switch (type) {
      case "twitter": return `https://twitter.com/${value}`;
      case "youtube": return `https://youtube.com/${value}`;
      case "telegram": return `https://t.me/${value}`;
      case "twitch": return `https://twitch.tv/${value}`;
      case "github": return `https://github.com/${value}`;
      case "discord": return null; // Discord doesn't have a direct profile URL
      default: return null;
    }
  }

  // Fetch social connections separately
  const [connections, connectionsStatus, connectionsError] = await GetPublicConnections(uuid);
  const socialConnections = connections || {};

  // Extract socials from socialConnections
  const knownSocials = ["Twitter", "Discord", "GitHub", "YouTube", "Telegram", "Twitch"];
  const socialList = Object.entries(socialConnections)
    .filter(([type, value]) => 
      knownSocials.includes(type) && 
      value && 
      typeof value === 'string' && 
      value.trim() !== "" && 
      type !== "null" // Filter out the null key
    )
    .map(([type, value]) => ({
      type: type.toLowerCase(),
      value: value as string,
      url: getSocialUrl(type.toLowerCase(), value as string)
    }));

  // Socials card style rendering
  const socialsCard = (
    <div className="flex flex-col text-center rounded-lg overflow-hidden bg-base-200 py-1 px-4 whitespace-nowrap mt-2">
      <small className="uppercase font-bold smaller mb-1">Social Media</small>
      <div className="flex flex-col justify-between gap-2 text-left p-1 relative">
        {socialList.map((social, idx) => {
          if (social.type === "discord") {
            return (
              <div key={idx} className="flex items-center gap-2 text-gray-300">
                {getSocialIconComponent(social.type)} <span>{social.value}</span>
              </div>
            );
          } else {
            return (
              <a
                key={idx}
                target="_blank"
                rel="noopener noreferrer"
                href={social.url || "#"}
                className="flex items-center gap-2 hover:underline"
                style={{ color: getSocialColor(social.type) }}
              >
                {getSocialIconComponent(social.type)} <span>{social.type.charAt(0).toUpperCase() + social.type.slice(1)}</span>
              </a>
            );
          }
        })}
      </div>
    </div>
  );

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
                className="uppercase text-center w-full text-gray-100 tracking-wider font-extrabold">{userStatus}</small>
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
          {socialList.length > 0 && socialsCard}
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
