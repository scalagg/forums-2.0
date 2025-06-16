import HeaderContext from "@/components/HeaderContext";
import getSession from "@/libs/session/getSession";
import { GetProfileFromUuid, GetPublicConnections, updateConnections } from "@/services/controller/ProfileService";
import SettingsPage from "./component";
import { getAccountFromUuid } from "@/services/forum/account/AccountService";
import { redirect } from "next/navigation";

export default async function Page() {
  const headerContent: [string, string] = ["Settings", `Configure your account.`];

  const session = await getSession();
  if (!session.uuid) redirect("/");

  const [profile, status, error] = await GetProfileFromUuid(session.uuid);
  const [account] = await getAccountFromUuid(session.uuid);
  const [connections] = await GetPublicConnections(session.uuid);
  if (profile && connections) (profile as any).webSettings = connections;

  if (!profile) {
    redirect("/");
    return null;
  }

  return <>
    <HeaderContext setTo={headerContent} />
    <SettingsPage profile={profile} account={account} />
  </>
}

