# Supabase Storage Setup for Social Media Assets

## Create Media Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"Create Bucket"** button
4. Configure the bucket:
   - **Name**: `media`
   - **Public**: ✅ Yes (check this box)
   - **File size limit**: 50 MB (or your preferred limit)
   - **Allowed MIME types**: Leave empty for all types, or specify:
     - Images: `image/*`
     - Videos: `video/*`
5. Click **"Create Bucket"**

## Bucket Configuration

The `media` bucket should be:
- **Public**: Yes (so assets can be accessed via public URLs)
- **Size limit**: 50 MB (adjust based on your needs)
- **MIME types**: Optional (leave empty for all types)

## Verify Setup

After creating the bucket, you should be able to:
1. Upload assets in the Content Library (`/admin/social/library`)
2. View uploaded images/videos
3. Use assets in social media posts

## Troubleshooting

If you get "Bucket not found" error:
1. Check that the bucket name is exactly `media` (lowercase)
2. Verify the bucket is set to **Public**
3. Check your Supabase project settings
4. Try refreshing the page after creating the bucket
