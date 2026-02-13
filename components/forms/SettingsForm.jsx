"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function getInitials(name, email) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.charAt(0).toUpperCase() ?? "?";
}

export function SettingsForm({ profile, workspace, role }) {
  const router = useRouter();
  const isOwner = role === "owner";

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [workspaceName, setWorkspaceName] = useState(workspace?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", profile.id);

    setSavingProfile(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Profile updated!");
    router.refresh();
  }

  async function handleSaveWorkspace(e) {
    e.preventDefault();
    if (!isOwner) return;

    setSavingWorkspace(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("workspaces")
      .update({ name: workspaceName.trim() })
      .eq("id", workspace.id);

    setSavingWorkspace(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Workspace updated!");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <form onSubmit={handleSaveProfile}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-lg">
                  {getInitials(fullName, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{fullName || profile.email}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="fullName">Display Name</Label>
              <Input
                id="fullName"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="flex pt-2">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Workspace Card */}
      {workspace && (
        <form onSubmit={handleSaveWorkspace}>
          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>
                Manage your workspace settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input
                  id="workspaceName"
                  placeholder="Workspace name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  disabled={!isOwner}
                  className={!isOwner ? "bg-muted" : ""}
                />
                {!isOwner && (
                  <p className="text-xs text-muted-foreground">
                    Only workspace owners can rename the workspace.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Label>Current Plan</Label>
                <Badge variant={workspace.plan === "free" ? "secondary" : "default"}>
                  {workspace.plan?.charAt(0).toUpperCase() + workspace.plan?.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {isOwner && (
                  <Button type="submit" disabled={savingWorkspace}>
                    {savingWorkspace ? "Saving..." : "Save Workspace"}
                  </Button>
                )}
                <Button variant="outline" type="button" asChild>
                  <a href="/dashboard/settings/billing">Manage Billing</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
