"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
 const [mode,setMode]=useState<"login"|"signup">("login");
 const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage("");
  const supabase=createClient();
  const result=mode==="login"
   ? await supabase.auth.signInWithPassword({email,password})
   : await supabase.auth.signUp({email,password,options:{emailRedirectTo:location.origin+"/auth/callback"}});
  setBusy(false);
  if(result.error){setMessage(result.error.message);return;}
  if(mode==="signup"&&!result.data.session){setMessage("Account created. Check your email to confirm, then sign in.");return;}
  location.href="/";
 }
 return <main className="auth-shell"><section className="auth-card"><div className="brand">RUSH <span>AI</span></div><p className="eyebrow">YOUR AI SALES WORKSPACE</p><h1>{mode==="login"?"Welcome back":"Create your RUSH account"}</h1><p>Secure access to your team's sales workspace.</p><form onSubmit={submit}><label>Work email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/></label><label>Password<input type="password" autoComplete={mode==="login"?"current-password":"new-password"} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><button className="primary full" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in":"Create account"}</button></form>{message&&<div className="form-message" role="status">{message}</div>}<button className="link-button switch" onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("");}}>{mode==="login"?"New to RUSH? Create an account":"Already have an account? Sign in"}</button><small className="secure-note">Protected by Supabase Authentication · Your data is workspace-isolated</small></section></main>;
}
