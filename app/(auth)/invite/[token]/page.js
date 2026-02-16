"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function InviteAcceptPage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("unauthenticated");
      } else {
        setStatus("ready");
      }
    }
    checkAuth();
  }, []);

  async function handleAccept() {
    setStatus("accepting");
    try {
      const res = await fetch(`/api/team/invite/${token}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept invite");

      setStatus("accepted");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  function handleLogin() {
    router.push(`/login?redirect=/invite/${token}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Workspace Invitation</CardTitle>
          <CardDescription>
            {status === "loading" && "Loading..."}
            {status === "unauthenticated" && "Please sign in to accept this invite."}
            {status === "ready" && "You've been invited to join a Reelytics workspace."}
            {status === "accepting" && "Accepting invite..."}
            {status === "accepted" && "You're in! Redirecting to your dashboard..."}
            {status === "error" && error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "unauthenticated" && (
            <Button onClick={handleLogin} className="w-full">
              Sign In to Accept
            </Button>
          )}
          {status === "ready" && (
            <Button onClick={handleAccept} className="w-full">
              Accept Invitation
            </Button>
          )}
          {status === "error" && (
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
