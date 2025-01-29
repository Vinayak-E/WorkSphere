export const uploadToCloudinary = async (file: File) => {
    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
  
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary environment variables not configured');
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Image upload failed');
      }
  
      return await response.json().then((data) => data.secure_url);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };