export default interface Grant {
  uuid: string;
  addedAt: number;
  addedBy: string | null;
  addedOn: string;
  addedReason: string;
  duration: number;
  expireDate: string;
  rankId: string;
  removedAt: number | null;
  removedBy: string | null;
  removedOn: string | null;
  removedReason: string | null;
  scopes: string[];
  target: string;
}
