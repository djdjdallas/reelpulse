"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const roleBadgeVariant = {
  owner: "default",
  editor: "secondary",
  viewer: "outline",
};

export function TeamMemberList({ members, currentUserId, onUpdate }) {
  const [loading, setLoading] = useState(null);

  async function handleRoleChange(memberId, newRole) {
    setLoading(memberId);
    try {
      const res = await fetch(`/api/team/members/${memberId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }
      toast.success("Role updated");
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  async function handleRemove(memberId) {
    setLoading(memberId);
    try {
      const res = await fetch(`/api/team/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }
      toast.success("Member removed");
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isCurrentUser = member.user_id === currentUserId;
        const isOwner = member.role === "owner";

        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-md border px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium">
                  {member.profiles?.full_name || "User"}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.profiles?.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner ? (
                <Badge variant={roleBadgeVariant[member.role]}>
                  {member.role}
                </Badge>
              ) : (
                <Select
                  value={member.role}
                  onValueChange={(val) => handleRoleChange(member.id, val)}
                  disabled={loading === member.id || isCurrentUser}
                >
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">editor</SelectItem>
                    <SelectItem value="viewer">viewer</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {!isOwner && !isCurrentUser && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      disabled={loading === member.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove member?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will revoke their access to the workspace.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(member.id)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
