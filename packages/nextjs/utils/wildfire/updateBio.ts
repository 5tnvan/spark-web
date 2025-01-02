import { createClient } from "../supabase/client";
import { fetchUser } from "./fetch/fetchUser";

export async function updateBio(newBio: any) {
  const supabase = createClient();
  const user = await fetchUser();
  const { error } = await supabase
    .from("profiles")
    .update({ bio: newBio })
    .eq("id", user?.user?.id)

  return error;
}