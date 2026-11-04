import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspaces";

export async function GET(){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();if(!user)return redirect("/login");
 const activeWorkspace = await getActiveWorkspace(supabase, user.id);
 const workspaceId=activeWorkspace?.id;if(!workspaceId)return new Response("Workspace not found",{status:404});
 const {data,error}=await supabase.from("leads").select("first_name,last_name,email,phone,job_title,company_name,status,source,created_at").eq("workspace_id",workspaceId).order("created_at",{ascending:false}).limit(10000);
 if(error)return new Response("Could not export leads",{status:500});
 const cell=(v:unknown)=>{const s=String(v??"");return /[",\\r\\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
 const headers=["first_name","last_name","email","phone","job_title","company_name","status","source","created_at"];
 const csv=[headers.join(","),...(data||[]).map(row=>headers.map(h=>cell((row as Record<string,unknown>)[h])).join(","))].join("\\r\\n");
 return new Response("\\uFEFF"+csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="rush-leads.csv"',"Cache-Control":"no-store"}});
}
