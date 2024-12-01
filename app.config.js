import 'dotenv/config';

export default {
  expo: {
    name: "YourAppName",
    slug: "your-app-slug",
    version: "1.0.0",
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    },
  },
};
