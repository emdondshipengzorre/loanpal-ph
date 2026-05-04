"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signOut, onAuthChange } from "@/lib/storage";

interface AuthUser {
  id: string;
  email?: string;
}

export function AuthButton() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {user.email}
        </span>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => signInWithGoogle()}>
      Sign in
    </Button>
  );
}
