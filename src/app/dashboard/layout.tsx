import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <Sidebar role={session.user.role} />

      <main className="ml-72 min-h-screen">
        <Header user={session.user} />
        <section className="p-8">{children}</section>
      </main>
    </div>
  );
}
