import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../constants/supabaseClient";
import { useUser } from "../../constants/UserContext";

const UploadToMediaBank = async () => {
  const { userId } = useUser();

  // Request permissions to access the media library
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Sorry, we need media library permissions to make this work!");
    return;
  }

  // Launch the image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.cancelled) {
    try {
      // Upload to Supabase Storage
      const fileName = `media/${Date.now()}_${result.uri.split("/").pop()}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("your_bucket_name") // Replace with your Supabase bucket name
        .upload(fileName, {
          uri: result.uri,
          name: fileName,
          type: result.type,
        });

      if (storageError) {
        console.error("Error uploading to storage:", storageError.message);
        return;
      }

      // Get public URL
      const { publicUrl } = supabase.storage
        .from("your_bucket_name")
        .getPublicUrl(fileName);

      // Insert record into media_bank
      const { data, error } = await supabase.from("media_bank").insert([
        {
          user_id: userId,
          file_url: publicUrl,
          meta: {
            file_name: fileName,
            file_size: result.fileSize,
            file_type: result.type,
          },
        },
      ]);

      if (error) {
        console.error("Error inserting into media_bank:", error.message);
      } else {
        alert("Media uploaded successfully!");
      }
    } catch (error) {
      console.error("Unexpected error uploading media:", error);
    }
  }
};

export default UploadToMediaBank;