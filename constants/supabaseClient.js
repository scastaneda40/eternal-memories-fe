import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
const supabaseKey = Constants.expoConfig?.extra?.SUPABASE_SERVICE_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("supabaseUrl and supabaseKey are required.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
