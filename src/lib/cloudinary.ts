export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error('Konfigurasi Cloudinary belum lengkap di .env.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let errorMessage = 'Gagal mengunggah foto ke Cloudinary.';
    try {
      const errorJson = (await res.json()) as { error?: { message?: string } };
      if (errorJson?.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch {
      // fallback default message
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
