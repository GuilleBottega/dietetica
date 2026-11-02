const localProductImages = {
  almendras: "/img/almendras.jpg",
  avena: "/img/avena.jpg",
  barrita: "/img/barrita.jpg",
  chia: "/img/chia.jpg",
  coco: "/img/coco.jpg",
  "copo de maiz": "/img/copo de maiz.jpg",
  "copos de maiz": "/img/copo de maiz.jpg",
  "crema de mani": "/img/crema de mani.jpg",
  datiles: "/img/datiles.jpg",
  galletitas: "/img/galletitas.jpg",
  "harina integral": "/img/harina integral.jpg",
  legumbres: "/img/legumbres.jpg",
  membrillo: "/img/membrillo.jpg",
  mermelada: "/img/mermelada.jpg",
  nuez: "/img/nuez.jpg",
  "pasas de uva": "/img/pasas de uva.jpg",
  pistachos: "/img/pistachos.jpg",
  stevia: "/img/stevia.jpg",
};

const normalizeProductName = (name) =>
  String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const getLocalProductImage = (name) => {
  const normalizedName = normalizeProductName(name);
  return Object.hasOwn(localProductImages, normalizedName)
    ? localProductImages[normalizedName]
    : "";
};

export const getProductImage = (image, name) => {
  const localImage = getLocalProductImage(name);

  if (typeof image !== "string" || !image.trim()) {
    return localImage;
  }

  if (/^https?:\/\/(?:www\.)?(?:imgbb\.com|ibb\.co)(?:\/|$)/i.test(image)) {
    return localImage || image;
  }

  return image;
};
