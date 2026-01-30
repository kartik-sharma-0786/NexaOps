import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import IncidentDetail from "./incident-detail";

async function getIncident(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.jwt) return null;

  try {
    const res = await fetch(`http://localhost:4000/incidents/${id}`, {
      headers: {
        Authorization: `Bearer ${session.user.jwt}`,
      },
      cache: "no-store",
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch");

    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function IncidentPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params; // Awaiting params for Next.js 15+ (if user is on new version)
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const incident = await getIncident(id);

  if (!incident) {
    notFound();
  }

  return <IncidentDetail initialIncident={incident} />;
}
