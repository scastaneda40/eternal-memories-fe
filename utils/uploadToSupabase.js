// utils/supabaseUtils.js
import { supabase } from "../constants/supabaseClient";

export const uploadToSupabase = async (file, folder = "media") => {
  const { uri } = file;
  const fileName = `${Date.now()}_${uri.split("/").pop()}`;
  const filePath = `${folder}/${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from("eternal-moment-uploads")
      .upload(filePath, { uri, type: "multipart/form-data" });

    if (error) throw new Error(`Supabase upload error: ${error.message}`);

    const { data: publicData, error: publicUrlError } = supabase.storage
      .from("eternal-moment-uploads")
      .getPublicUrl(filePath);

    if (publicUrlError) {
      throw new Error(`Error retrieving public URL: ${publicUrlError.message}`);
    }

    return publicData.publicUrl;
  } catch (error) {
    console.error("Error uploading file to Supabase:", error);
    throw error;
  }
};
