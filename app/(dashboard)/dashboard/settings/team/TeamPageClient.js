"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMemberList } from "@/components/team/TeamMemberList";
import { InviteMemberDialog } from "@/components/team/InviteMemberDialog";
import { PendingInviteList } from "@/components/team/PendingInviteList";

export function TeamPageClient({ members, invites, currentUserId, isOwner }) {
  const router = useRouter();

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage your workspace members and invitations.
          </p>
        </div>
        {isOwner && <InviteMemberDialog onInvited={refresh} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members ({members.length})</CardTitle>
          <CardDescription>People with access to this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMemberList
            members={members}
            currentUserId={currentUserId}
            onUpdate={refresh}
          />
        </CardContent>
      </Card>

      {isOwner && invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Invites ({invites.length})</CardTitle>
            <CardDescription>Invitations waiting to be accepted.</CardDescription>
          </CardHeader>
          <CardContent>
            <PendingInviteList invites={invites} onUpdate={refresh} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
