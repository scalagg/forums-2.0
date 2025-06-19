export default interface Punishment {
  uuid: string;
  addedAt: number;
  addedBy: string | null;
  addedOn: string;
  addedReason: string;
  category: string;
  duration: number;
  expireDate: string;
  removedAt: number | null;
  removedBy: string | null;
  removedOn: string | null;
  removedReason: string | null;
  target: string;
  targetCurrentIp: string | null;
  active?: boolean;
  punishmentType?: string;
}
