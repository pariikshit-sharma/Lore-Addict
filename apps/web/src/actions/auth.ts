"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/utils/safe-redirect";
import {
  authRateLimiter,
  passwordResetRateLimiter,
  checkRateLimit,
} from "@/lib/rate-limit";
import {
  loginSchema,
  signUpSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth";

export interface AuthActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

export async function signUpAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const ip = await getClientIp();
  const { success } = await checkRateLimit(authRateLimiter, ip);
  if (!success) {
    return { error: "Too many attempts. Try again in a minute." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/verify");
}

export async function loginAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const ip = await getClientIp();
  const { success } = await checkRateLimit(
    authRateLimiter,
    `${ip}:${parsed.data.email}`,
  );
  if (!success) {
    return { error: "Too many attempts. Try again in a minute." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Deliberately generic — never confirm whether the email exists.
    return { error: "Incorrect email or password." };
  }

  redirect(getSafeRedirectPath(formData.get("redirectTo")));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const ip = await getClientIp();
  const { success } = await checkRateLimit(passwordResetRateLimiter, ip);
  if (!success) {
    return { error: "Too many requests. Try again later." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });

  // Always return success regardless of whether the email exists —
  // confirming non-existence here is a user-enumeration vector.
  return {};
}

export async function updatePasswordAction(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}

export async function signInWithOAuthAction(
  provider: "google" | "discord",
): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_failed");
  }

  redirect(data.url as Route);
}

function flattenZodErrors(
  error: import("zod").ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
