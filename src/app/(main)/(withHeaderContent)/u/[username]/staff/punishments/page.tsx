'use client'

import Punishment from "@/libs/types/entities/Punishment";
import { useEffect, useState } from "react";
import { getPunishmentsInfo } from "./ServerActions";

interface Params {
  params: {
    username: string
  }
}

export default function Page(params: Params) {
  const { username } = params.params;

  const [activeType, setActiveType] = useState<string>("ALL");
  const [punishments, setPunishments] = useState<any[]>([]);
  const [uuidToName, setUuidToName] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    getPunishmentsInfo(username).then(res => {
      const { uuidToName, punishments } = res;
      setUuidToName(uuidToName);
      setPunishments(punishments);
    });
  }, [username]);

  const getFiltered = (type: string) => (
    type == "ALL"
      ? punishments
      : punishments.filter(p => p.category == type));

  const TYPE_COLOR: { [key: string]: string } = Object.freeze({
    ALL: "rgb(243 244 246)",
    MUTE: "rgb(249 115 22)",
    BAN: "rgb(185 28 28)",
    BLACKLIST: "rgb(99 25 25)",
  });

  const TYPES = Object.freeze(["ALL", "MUTE", "BAN", "BLACKLIST"]);

  const bold = (msg: string) => <span className="font-bold">{msg}</span>

  return <div className="flex flex-wrap gap-2 w-full">
    <div className="flex flex-col gap-2 mx-4 w-fit">
      {TYPES.map((type, i) =>
        <button
          key={i}
          className={`btn p-2 min-w-[200px] bg-base-300 hover:bg-base-100 border-2 ${activeType == type ? 'active' : ''}`}
          style={{ borderColor: TYPE_COLOR[type] }}
          onClick={() => setActiveType(type)}>
          {type[0] + type.slice(1).toLowerCase() + (type != "ALL" ? "s" : "")}: {getFiltered(type).length}
        </button>
      )}
    </div>
    <div className="flex flex-col gap-2 overflow-y-scroll max-h-[400px] w-full lg:w-fit lg:min-w-[750px] px-2">
      {getFiltered(activeType).map((p, i) =>
        <div key={i} className="p-3 rounded-lg bg-base-300 border-base-100 max-w-[720px]">
          <span className={`font-bold text-xl`} style={{ color: TYPE_COLOR[p.category] }}>
            {p.category}
          </span>
          <div className="mt-2 flex flex-row flex-wrap gap-3">
            <div className="">
              <div>
                {bold("Reason:")} {p.addedReason || <span className="text-red-600">Unknown</span>}
              </div>
              <div>
                {bold("Issued By:")} {uuidToName[p.addedBy] || <span className="text-red-600">Unknown</span>}
              </div>
              <div>
                {bold("Issued At:")} {p.addedAt ? new Date(Number(p.addedAt)).toLocaleString() : <span className="text-red-600">Unknown</span>}
              </div>
              <div>
                {bold("Issued On:")} {p.addedOn || <span className="text-red-600">Unknown</span>}
              </div>
              <div>
                {bold("Duration:")} {p.duration === 9223372036854775807 ? <span className="text-emerald-300">Permanent</span> : p.duration ? `${Math.round(p.duration / 1000 / 60 / 60 / 24)} days` : <span className="text-red-600">Unknown</span>}
              </div>
              <div>
                {bold("Expire Date:")} {p.expireDate || <span className="text-red-600">Unknown</span>}
              </div>
            </div>
            <div className="">
              <div>
                {bold("Removed Reason:")} {p.removedReason || <span className="text-gray-400">-</span>}
              </div>
              <div>
                {bold("Removed By:")} {uuidToName[p.removedBy] || <span className="text-gray-400">-</span>}
              </div>
              <div>
                {bold("Removed At:")} {p.removedAt ? new Date(Number(p.removedAt)).toLocaleString() : <span className="text-gray-400">-</span>}
              </div>
              <div>
                {bold("Removed On:")} {p.removedOn || <span className="text-gray-400">-</span>}
              </div>
            </div>
          </div>
          <div className="mt-2">
            {bold("Punishment ID:")} {p.uuid}
          </div>
          <div>
            {bold("Target:")} {p.target}
          </div>
          <div>
            {bold("Target IP:")} {p.targetCurrentIp || <span className="text-gray-400">-</span>}
          </div>
        </div>
      )}
    </div>
  </div>
}
