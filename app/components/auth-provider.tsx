"use client";

import { ClerkProvider, useAuth } from "@clerk/react";
import { createContext, type ReactNode, useContext, useMemo } from "react";

type PlanifyAuthValue = {
  configured: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  getToken: () => Promise<string | null>;
};

const missingAuth: PlanifyAuthValue = {
  configured: false,
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  getToken: async () => null,
};

const PlanifyAuthContext = createContext<PlanifyAuthValue>(missingAuth);

function ClerkSessionBridge({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const value = useMemo<PlanifyAuthValue>(() => ({
    configured: true,
    isLoaded,
    isSignedIn: isSignedIn === true,
    userId: userId ?? null,
    getToken: async () => (isSignedIn ? getToken() : null),
  }), [getToken, isLoaded, isSignedIn, userId]);

  return (
    <PlanifyAuthContext.Provider value={value}>
      {children}
    </PlanifyAuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <PlanifyAuthContext.Provider value={missingAuth}>
        {children}
      </PlanifyAuthContext.Provider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        variables: {
          borderRadius: "0.9rem",
          colorBackground: "#ffffff",
          colorPrimary: "#4e55bb",
          colorForeground: "#111512",
          colorMutedForeground: "#4f5951",
          fontFamily:
            "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        elements: {
          cardBox: {
            border: "1px solid #d1d6ce",
            boxShadow: "0 30px 90px rgba(7, 10, 8, 0.28)",
          },
        },
      }}
    >
      <ClerkSessionBridge>{children}</ClerkSessionBridge>
    </ClerkProvider>
  );
}

export function usePlanifyAuth() {
  return useContext(PlanifyAuthContext);
}
