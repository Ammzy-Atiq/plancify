"use client";

import { Show, SignInButton, UserButton } from "@clerk/react";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { usePlanifyAuth } from "@/app/components/auth-provider";

function SignInTrigger({
  className,
  disabled = false,
  ...buttonProps
}: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      {...buttonProps}
      className={["auth-trigger", className].filter(Boolean).join(" ")}
      type="button"
      aria-label="Sign in to Plancify"
      disabled={disabled}
    >
      <span className="auth-trigger-icon" aria-hidden="true">IN</span>
      <span>{disabled ? "Loading" : "Sign in"}</span>
    </button>
  );
}

export function AuthControl() {
  const { configured, isLoaded } = usePlanifyAuth();

  if (!configured) {
    return <Link className="auth-trigger" href="/login"><span>Demo access</span></Link>;
  }

  if (!isLoaded) {
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
        <div className="clerk-user-control" aria-label="Plancify account">
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
