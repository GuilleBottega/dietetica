import { useState } from "react";
import {
  getLocalProductImage,
  getProductImage,
} from "../utils/productImage.js";

export const ProductImage = ({ image, name, alt, ...props }) => {
  const primaryImage = getProductImage(image, name);
  const fallbackImage = getLocalProductImage(name);
  const [failedImage, setFailedImage] = useState("");
  const src =
    failedImage === primaryImage && fallbackImage
      ? fallbackImage
      : primaryImage;

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      onError={() => {
        if (primaryImage !== fallbackImage) {
          setFailedImage(primaryImage);
        }
      }}
    />
  );
};
