'use server'

import { getUsernameFromUuid, getUuid } from "@/services/forum/account/AccountService"
import { getPunishments } from "@/services/forum/punishment/PunishmentService";
import Punishment from "@/libs/types/entities/Punishment";

export async function getPunishmentsInfo(username: string) {
  const uuid = (await getUuid(username));

  const punishments: Punishment[] = (await getPunishments(uuid))[0] || [];

  const uuidToName: { [key: string]: string } = {};
  uuidToName["00000000-0000-0000-0000-000000000000"] = "Server/Console"

  for (let p of punishments) {
    if (p.addedBy && !uuidToName[p.addedBy])
      uuidToName[p.addedBy] = (await getUsernameFromUuid(p.addedBy))!;
    if (p.removedBy && !uuidToName[p.removedBy])
      uuidToName[p.removedBy] = (await getUsernameFromUuid(p.removedBy))!;
  }

  punishments.sort((a, b) => Number(b.addedAt) - Number(a.addedAt));

  return {
    uuid: uuid,
    uuidToName: uuidToName,
    punishments: punishments,
  }
}
