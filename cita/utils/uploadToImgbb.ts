export const uploadToImgbb = async (file: File): Promise<string | null> => {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    console.error("Missing imgbb API key");
    return null;
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data && data.data && data.data.url) {
      return data.data.url;  
    }
    return null;
  } catch (err) {
    console.error("Error uploading to imgbb:", err);
    return null;
  }
};
