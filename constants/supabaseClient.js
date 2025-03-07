import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, 
    storage: AsyncStorage,  // ✅ Ensures session persistence on mobile
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// ✅ Function to fetch and validate the session before making API calls
export const getSessionToken = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.access_token) {
      console.error("❌ No active Supabase session:", error);
      return null;
    }
    console.log("✅ Retrieved Supabase Session Token:", data.session.access_token);
    return data.session.access_token;
  } catch (err) {
    console.error("❌ Error fetching Supabase session:", err.message);
    return null;
  }
};
