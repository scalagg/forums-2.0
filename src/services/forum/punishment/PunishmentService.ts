import HTTPClient from "@/libs/HTTPClient";
import Punishment from "@/libs/types/entities/Punishment";

export const getPunishments = async (uuid: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
  const result = await client.GetAsync<Punishment[]>(`/punishment/profile/${uuid}`);
  // Suppress punishment data logging to reduce console bloat
  return result;
};
