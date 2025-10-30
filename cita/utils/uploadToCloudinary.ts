export async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "my_unsigned_preset"); 

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dnnlnxiev/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) throw new Error("Failed to upload image to Cloudinary");
  const data = await res.json();
  return data.secure_url as string;
}
