import getSession from "@/libs/session/getSession";
import { getHighestRank } from "@/services/controller/GrantService";
import { redirect } from "next/navigation";


export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();
  const rank = await getHighestRank(session.uuid);
  if (!rank?.staff) {
    redirect("/");
  }

  return <>{children}</>
}
