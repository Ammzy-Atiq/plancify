"use client";

import { Show, SignInButton, UserButton } from "@clerk/react";
import { usePlanifyAuth } from "@/app/components/auth-provider";

function SignInTrigger({ disabled = false }: { disabled?: boolean }) {
  return (
    <button
      className="auth-trigger"
      type="button"
      aria-label="Sign in to Planify"
      disabled={disabled}
    >
      <span
        className="auth-trigger-icon direction-icon direction-up-right"
        aria-hidden="true"
      />
      <span>{disabled ? "Loading" : "Sign in"}</span>
    </button>
  );
}

export function AuthControl() {
  const { configured, isLoaded } = usePlanifyAuth();

  if (!configured || !isLoaded) {
    return <SignInTrigger disabled />;
  }

  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <SignInTrigger />
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <div className="clerk-user-control" aria-label="Planify account">
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: "30px", height: "30px" },
                userButtonTrigger: {
                  width: "100%",
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                },
              },
            }}
          />
        </div>
      </Show>
    </>
  );
}
