const ENDPOINT = "https://api.imgbb.com/1/upload";

export const uploadImage = async (file) => {
  if (!(file instanceof Blob) || !file.type.startsWith("image/")) {
    throw new Error("Seleccioná un archivo de imagen válido.");
  }

  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar la variable VITE_IMGBB_API_KEY.");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message ?? "Error al subir la imagen a ImgBB.");
    }

    return data.data.url;
  } catch (error) {
    console.error("ImgBB error:", error);
    throw error;
  }
};