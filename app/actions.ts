"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ACTIVE_WORKSPACE_COOKIE, getActiveWorkspace } from "@/lib/workspaces";

export async function selectWorkspace(formData: FormData) {
  const workspaceId = String(formData.get("workspace_id") || "").trim();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership, error } = await supabase.from("workspace_members").select("workspace_id").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle();
  if (error || !membership) throw new Error("You do not have access to that workspace.");
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/");
  redirect("/");
}

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
  const activeWorkspace = await getActiveWorkspace(supabase, user.id);
  const workspaceId = activeWorkspace?.id;
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

function parseCsv(text: string): string[][] {
  const rows: string[][]=[]; let row:string[]=[]; let cell=""; let quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'&&quoted&&text[i+1]==='"'){cell+='"';i++;}
    else if(ch==='"'){quoted=!quoted;}
    else if(ch===","&&!quoted){row.push(cell.trim());cell="";}
    else if((ch==="\\n"||ch==="\\r")&&!quoted){if(ch==="\\r"&&text[i+1]==="\\n")i++;row.push(cell.trim());if(row.some(v=>v!==""))rows.push(row);row=[];cell="";}
    else cell+=ch;
  }
  row.push(cell.trim());if(row.some(v=>v!==""))rows.push(row);
  return rows;
}

export async function importLeadsCsv(formData: FormData) {
  const file=formData.get("file");
  if(!(file instanceof File)||file.size===0) throw new Error("Choose a CSV file to import.");
  if(file.size>2*1024*1024) throw new Error("CSV must be 2 MB or smaller.");
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
  const activeWorkspace=await getActiveWorkspace(supabase,user.id);
  const workspaceId=activeWorkspace?.id;if(!workspaceId)throw new Error("Create a workspace first.");
  const rows=parseCsv(await file.text());
  if(rows.length<2)throw new Error("CSV needs a header row and at least one contact.");
  const headers=rows[0].map(h=>h.toLowerCase().replace(/[^a-z0-9]/g,""));
  const index=(...names:string[])=>headers.findIndex(h=>names.includes(h));
  const ix={first:index("firstname","first"),last:index("lastname","last"),email:index("email","emailaddress"),phone:index("phone","phonenumber","mobile"),title:index("jobtitle","title","role"),company:index("company","companyname","account")};
  if(ix.email<0&&ix.company<0)throw new Error("CSV must include an Email or Company column.");
  const {data:existing}=await supabase.from("leads").select("email").eq("workspace_id",workspaceId).not("email","is",null);
  const seen=new Set((existing||[]).map(x=>(x.email||"").toLowerCase()));
  const records=rows.slice(1).map(row=>{
    const val=(i:number)=>i<0?"":(row[i]||"").trim();
    const email=val(ix.email).toLowerCase();
    if(email&&seen.has(email))return null;
    if(email)seen.add(email);
    return {workspace_id:workspaceId,created_by:user.id,owner_id:user.id,first_name:val(ix.first)||null,last_name:val(ix.last)||null,email:email||null,phone:val(ix.phone)||null,job_title:val(ix.title)||null,company_name:val(ix.company)||null,source:"csv_import"};
  }).filter((x):x is NonNullable<typeof x>=>x!==null);
  let inserted=0;
  for(let i=0;i<records.length;i+=100){
    const {data,error}=await supabase.from("leads").insert(records.slice(i,i+100)).select("id");
    if(error)throw new Error("Import stopped after "+inserted+" contacts: "+error.message);
    inserted+=data?.length||0;
  }
  revalidatePath("/");revalidatePath("/leads");
  redirect("/leads?imported="+inserted+"&skipped="+(rows.length-1-records.length));
}
