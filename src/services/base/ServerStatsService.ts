
export async function getPlayerCount(): Promise<number> {
  const res = await fetch("https://api.mcsrvstat.us/3/scala.gg")
  const json = await res.json();
  return json?.players?.online || undefined;
}
