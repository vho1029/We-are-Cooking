import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gfgutaejbqhwgmrgjkeb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZ3V0YWVqYnFod2dtcmdqa2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NDA2MjgsImV4cCI6MjA1NzIxNjYyOH0.OkpTRSp4IpsEtP5VFU_7NHsLjkpIpLVMqDWS8laZFeU";  // Replace with your regenerated key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
