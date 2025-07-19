# Cloudinary Setup Guide for LokalFinds

## 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. After verification, you'll be taken to your dashboard

## 2. Get Your Configuration Details

From your Cloudinary dashboard, you'll need:

### Cloud Name
- Found in your dashboard under "Account Details"
- It's the first part of your API environment variable

### Upload Preset
You need to create an unsigned upload preset:

1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: `lokalfinds_products` (or your preferred name)
   - **Signing Mode**: **Unsigned**
   - **Folder**: `lokalfinds/products` (organizes your images)
   - **Access Mode**: **Public**
   - **Resource Type**: **Image**
   - **Allowed formats**: `jpg, png, jpeg, webp`
   - **Transformation**: Optional - you can set default transformations
5. Click **Save**

## 3. Configure Your App

Update your `.env` file with your Cloudinary credentials:

```env
# Cloudinary Configuration
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=lokalfinds_products
```

## 4. Optional: Advanced Configuration

### Image Optimization Settings
In your upload preset, you can configure:

- **Quality**: Auto compression
- **Format**: Auto format selection (WebP when supported)
- **Responsive breakpoints**: For different screen sizes
- **Eager transformations**: Pre-generate common sizes

### Security Settings
For production, consider:

- **Signed uploads**: More secure but requires backend
- **Upload restrictions**: File size limits, format restrictions
- **Access control**: Private uploads with signed URLs

## 5. Test Your Configuration

1. Start your development server: `npm start`
2. Navigate to "My Store" → "Add Product"
3. Try uploading an image using the camera or gallery
4. Check your Cloudinary dashboard to see uploaded images

## 6. Image URL Structure

Cloudinary URLs follow this pattern:
```
https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
```

### Common Transformations
- `w_400,h_400,c_fill` - Resize to 400x400, crop to fill
- `q_auto` - Auto quality optimization
- `f_auto` - Auto format selection
- `dpr_auto` - Auto DPR for retina displays

## 7. Folder Organization

Images are organized in folders:
- `lokalfinds/products/` - Product images
- Future: `lokalfinds/stores/` - Store profile images
- Future: `lokalfinds/users/` - User avatars

## 8. Free Tier Limits

Cloudinary free tier includes:
- **25 GB storage**
- **25 GB monthly bandwidth**
- **1,000 transformations per month**
- **2 concurrent transformations**

This should be sufficient for MVP testing and small-scale deployment.

## 9. Troubleshooting

### Common Issues:

1. **Upload fails with 401 error**
   - Check that your upload preset is set to "Unsigned"
   - Verify cloud name and preset name are correct

2. **Images not loading**
   - Check that the Cloudinary URL is properly formatted
   - Ensure images are set to "Public" access mode

3. **Slow upload speeds**
   - Check internet connection
   - Consider image compression before upload

### Debug Mode
Set `console.log` in `cloudinaryService.js` to see detailed upload information.

## 10. Production Considerations

- Enable signed uploads for security
- Set up webhook notifications for upload events
- Implement image moderation if needed
- Configure backup and disaster recovery
- Monitor usage and upgrade plan as needed
