"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient(); await supabase.auth.signOut(); redirect("/login");
}

export async function createWorkspace(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) throw new Error("Workspace name must be at least 2 characters.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-" + crypto.randomUUID().slice(0,6);
  const { data: workspace, error } = await supabase.from("workspaces").insert({name,slug,created_by:user.id}).select("id").single();
  if (error) throw new Error(error.message);
  const { error: memberError } = await supabase.from("workspace_members").insert({workspace_id:workspace.id,user_id:user.id,role:"owner"});
  if (memberError) throw new Error(memberError.message);
  revalidatePath("/"); redirect("/");
}

export async function addLead(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: memberships } = await supabase.from("workspace_members").select("workspace_id").eq("user_id",user.id).limit(1);
  const workspaceId = memberships?.[0]?.workspace_id;
  if (!workspaceId) throw new Error("Create a workspace first.");
  const email = String(formData.get("email")||"").trim().toLowerCase();
  const payload = {
    workspace_id:workspaceId, created_by:user.id, owner_id:user.id,
    first_name:String(formData.get("first_name")||"").trim()||null,
    last_name:String(formData.get("last_name")||"").trim()||null,
    email:email||null, phone:String(formData.get("phone")||"").trim()||null,
    job_title:String(formData.get("job_title")||"").trim()||null,
    company_name:String(formData.get("company_name")||"").trim()||null,
    source:"manual"
  };
  const { error } = await supabase.from("leads").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/"); revalidatePath("/leads"); redirect("/leads");
}
