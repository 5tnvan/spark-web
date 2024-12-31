"use server";

import { redirect } from "next/navigation";
import { createClient } from "~~/utils/supabase/server";

/* LOGIN ACTIONS */

/* LOG IN */
export async function login(formData: FormData) {
  const supabase = createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    throw new Error();
  }

  console.log("login success");
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `https://www.3seconds.me/callback`,
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}
