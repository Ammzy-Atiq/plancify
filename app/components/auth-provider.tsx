"use client";

import { ClerkProvider, useAuth } from "@clerk/react";
import { createContext, type ReactNode, useContext } from "react";

type PlanifyAuthValue = {
  configured: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
};

const missingAuth: PlanifyAuthValue = {
  configured: false,
  isLoaded: true,
  isSignedIn: false,
  getToken: async () => null,
};

const PlanifyAuthContext = createContext<PlanifyAuthValue>(missingAuth);

function ClerkSessionBridge({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return (
    <PlanifyAuthContext.Provider
      value={{
        configured: true,
        isLoaded,
        isSignedIn: isSignedIn === true,
        getToken: async () => (isSignedIn ? getToken() : null),
      }}
    >
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
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{
        variables: {
          borderRadius: "0.9rem",
          colorBackground: "#ffffff",
          colorPrimary: "#4e55bb",
          colorText: "#111512",
          colorTextSecondary: "#4f5951",
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
