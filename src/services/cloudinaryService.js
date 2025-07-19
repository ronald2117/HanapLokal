// Cloudinary image upload service
// This service handles image uploads to Cloudinary using their REST API

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (imageUri) => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration is missing. Please check your .env file.');
    }

    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'product-image.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'lokalfinds/products'); // Organize images in folders

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Upload failed: ${errorData}`);
    }

    const data = await response.json();
    
    // Return the secure URL of the uploaded image
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteImageFromCloudinary = async (publicId) => {
  try {
    // Note: Deletion requires authentication and is typically done on the backend
    // For MVP, we'll just log this action
    console.log('Image deletion requested for:', publicId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  const {
    width = 400,
    height = 400,
    quality = 'auto',
    format = 'auto',
  } = options;

  // Insert transformation parameters into the Cloudinary URL
  const transformations = `w_${width},h_${height},c_fill,q_${quality},f_${format}`;
  return originalUrl.replace('/upload/', `/upload/${transformations}/`);
};
