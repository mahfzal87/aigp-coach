"use client";

import { authConfigured } from "@/lib/account";
import { AccountForm, useSession } from "@/components/account";
import { SignedInProfile } from "@/components/profile";
import { Card, CardBody, PageHeader } from "@/components/ui";

export default function AccountPage() {
  const { session, ready } = useSession();

  if (!ready) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  if (!authConfigured) {
    return (
      <div>
        <PageHeader title="Profile" subtitle="Accounts aren't set up on this copy — progress stays in this browser." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md">
        <PageHeader title="Profile" subtitle="Sign in to back up your progress and use it on any device." />
        <Card>
          <CardBody>
            <AccountForm defaultMode="up" />
          </CardBody>
        </Card>
      </div>
    );
  }

  return <SignedInProfile key={session.user.id} session={session} />;
}

