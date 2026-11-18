// D2C Assist persistence adapter. No service-role credentials belong in browser code.
// Import from a module script after setting up Supabase Auth for approved staff.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
export const supabase = createClient(
  "https://tmggolsyrfcrsjluuvgd.supabase.co",
  "sb_publishable_R_b8pZEkadMpz-AE16aXkA_xIIbVdZn"
);
async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Sign in before saving warehouse investigations.");
  return data.user;
}
function checked(result) {
  if (result.error) throw result.error;
  return result.data;
}
export async function signIn(email) {
  return checked(await supabase.auth.signInWithOtp({
    email, options: { shouldCreateUser: false }
  }));
}
export async function listInvestigations() {
  await requireUser();
  return checked(await supabase.from("shortage_investigations")
    .select("*").order("oldest_order_at", { ascending: true, nullsFirst: false }));
}
export async function saveInvestigation(row) {
  const user = await requireUser();
  const allowed = ["sku","oldest_order_at","order_dates","order_codes",
    "shortage_qty","status","selected_location","selected_lpn",
    "notes","attempted_locations","source_snapshot"];
  const payload = { user_id: user.id };
  for (const key of allowed) if (Object.hasOwn(row,key)) payload[key]=row[key];
  if (!payload.sku) throw new Error("SKU is required");
  return checked(await supabase.from("shortage_investigations")
    .upsert(payload,{onConflict:"user_id,sku"}).select().single());
}
export async function recordNotFound(investigation, location, lpn, nextLocation, nextLpn) {
  const user = await requireUser();
  if (investigation.user_id !== user.id) throw new Error("Investigation owner mismatch");
  const attempts = Array.isArray(investigation.attempted_locations)
    ? investigation.attempted_locations.slice() : [];
  attempts.push({location,lpn,at:new Date().toISOString()});
  const saved = checked(await supabase.from("shortage_investigations")
    .update({attempted_locations:attempts,selected_location:nextLocation || null,
      selected_lpn:nextLpn || null,status:"Investigating"})
    .eq("id",investigation.id).eq("user_id",user.id).select().single());
  checked(await supabase.from("investigation_events").insert({
    user_id:user.id,investigation_id:investigation.id,event_type:"not_found",
    location,lpn,details:{next_location:nextLocation || null,next_lpn:nextLpn || null}
  }));
  return saved;
}
export async function createMvM1Batch(items,notes="") {
  const user = await requireUser();
  if (!items.length) throw new Error("Select at least one MV-M1 item");
  const batch=checked(await supabase.from("mv_m1_requests")
    .insert({user_id:user.id,notes,status:"Draft"}).select().single());
  try {
    checked(await supabase.from("mv_m1_request_items").insert(items.map(item=>({
      user_id:user.id,request_id:batch.id,sku:item.sku,
      quantity:item.quantity,location:item.location,lpn:item.lpn,
      oldest_order_at:item.oldest_order_at || null
    }))));
  } catch(error) {
    await supabase.from("mv_m1_requests").delete().eq("id",batch.id);
    throw error;
  }
  return batch;
}
export async function markBatchSent(batchId) {
  const user=await requireUser();
  const batch=checked(await supabase.from("mv_m1_requests")
    .update({status:"Waiting for Delivery",sent_at:new Date().toISOString()})
    .eq("id",batchId).eq("user_id",user.id).eq("status","Draft")
    .select().single());
  const items=checked(await supabase.from("mv_m1_request_items")
    .select("sku").eq("request_id",batchId));
  for (const item of items) {
    checked(await supabase.from("shortage_investigations")
      .update({status:"Waiting for Delivery"}).eq("user_id",user.id)
      .eq("sku",item.sku).neq("status","Done"));
  }
  return batch;
}
export async function listMvM1Batches() {
  await requireUser();
  return checked(await supabase.from("mv_m1_requests")
    .select("*,mv_m1_request_items(*)").order("created_at",{ascending:false}));
}
