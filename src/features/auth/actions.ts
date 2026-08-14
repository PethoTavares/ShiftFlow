"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { signUpSchema } from "@/features/auth/schema";
import { db } from "@/lib/db";

export async function signUpManager(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect(`/sign-up?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid form data.")}`);
  }

  const existingUser = await db.user.findUnique({
    where: {
      email: parsed.data.email,
    },
  });

  if (existingUser) {
    redirect("/sign-up?error=An account already exists for that email.");
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "MANAGER",
    },
  });

  redirect("/sign-in?success=Account created. You can sign in now.");
}
