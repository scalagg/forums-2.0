import HeaderContext from "@/components/HeaderContext";
import { ServerMCHead } from "@/components/Minecraft/Server";
import { getStaffList } from "@/services/forum/account/AccountService";
import { getHexFromMinecraft } from "@/libs/utils/color";
import Link from "next/link";
import React from "react";

export default async function Staff() {
  // Fetch the grouped staff list
  const [staffRanks, status, error] = await getStaffList();
  if (!staffRanks) return <div>Error loading staff</div>;

  const headerContent: [string, string] = ["Staff", `Running the show!`];
  return <>
    <HeaderContext setTo={headerContent} />

    {staffRanks.map((rank, j) => (
      <div key={j} className="flex flex-col">
        <h2 style={{ color: getHexFromMinecraft(rank.color) }} className="text-center">{rank.displayName || rank.name}</h2>
        <div className="mb-6 window flex flex-row flex-wrap h-min w-screen max-w-full bg-base-300 rounded-xl p-2 gap-2">
          {rank.members.map((member, i) => (
            <div key={i} className="flex-[1_0_32%] flex flex-col justify-center items-center rounded-lg overflow-hidden bg-base-100 py-4">
              <Link href={`/u/${member.name}`}>
                <div className="w-[45px] h-[49px] relative">
                  <ServerMCHead shadowColor={getHexFromMinecraft(rank.color)} className="scale-[.675] absolute left-[-11px] top-[-12px]" username={member.name} />
                </div>
              </Link>
              <Link href={`/u/${member.name}`}>
                <span className="text-center inline-flex flex-col">
                  <h5 className="font-bold">{member.name}</h5>
                  <small style={{ color: getHexFromMinecraft(rank.color) }} className="smaller font-bold uppercase tracking-wider">{rank.displayName || rank.name}</small>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    ))}
  </>;
}
