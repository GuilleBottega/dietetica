import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase-config";

const productsCollection = "products";

const uploadProductImage = async (file, path) => {
  if (!(file instanceof Blob) || !file.type.startsWith("image/")) {
    throw new Error("Product image must be a valid image file");
  }

  const imageRef = ref(storage, path);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
};

const uploadLocalProductImage = async (imagePath, productId) => {
  const response = await fetch(imagePath);
  if (!response.ok) {
    throw new Error(`Unable to load product image: ${imagePath}`);
  }

  const imageFile = await response.blob();
  const fileName = imagePath.split("/").pop();
  return uploadProductImage(imageFile, `products/${productId}/${fileName}`);
};

export const addProduct = async (product, imageFile) => {
  const productToSave = imageFile
    ? {
        ...product,
        image: await uploadProductImage(
          imageFile,
          `products/${crypto.randomUUID()}-${imageFile.name}`
        ),
      }
    : product;

  const document = await addDoc(collection(db, productsCollection), productToSave);
  return document.id;
};

export const seedProductsFromJson = async () => {
  const response = await fetch("/data/products.json");
  if (!response.ok) {
    throw new Error("Unable to load local products");
  }

  const products = await response.json();
  if (!Array.isArray(products)) {
    throw new Error("Local products data must be an array");
  }

  const results = await Promise.all(
    products.map(async (product) => {
      const productRef = doc(db, productsCollection, String(product.id));
      const existingProduct = await getDoc(productRef);
      const existingData = existingProduct.exists()
        ? existingProduct.data()
        : null;

      if (existingData && !existingData.image?.startsWith("/")) {
        return "skipped";
      }

      let productToSave = product;
      const localImagePath = existingData?.image ?? product.image;
      if (typeof localImagePath === "string" && localImagePath.startsWith("/")) {
        productToSave = {
          ...(existingData ?? product),
          image: await uploadLocalProductImage(localImagePath, product.id),
        };
      }

      if (existingData) {
        await updateDoc(productRef, { image: productToSave.image });
        return "updated";
      }

      return runTransaction(db, async (transaction) => {
        const currentProduct = await transaction.get(productRef);
        if (currentProduct.exists()) return "skipped";

        transaction.set(productRef, productToSave);
        return "added";
      });
    })
  );

  return {
    added: results.filter((result) => result === "added").length,
    updated: results.filter((result) => result === "updated").length,
    skipped: results.filter((result) => result === "skipped").length,
  };
};

const mapProduct = (documentSnapshot) => {
  const product = documentSnapshot.data();
  return { ...product, id: product.id ?? documentSnapshot.id };
};

export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, productsCollection));

  if (snapshot.empty) {
    const response = await fetch("/data/products.json");
    if (!response.ok) {
      throw new Error("Unable to load local products");
    }
    return response.json();
  }

  return snapshot.docs.map(mapProduct);
};

export const getProductById = async (id) => {
  const productDocument = await getDoc(doc(db, productsCollection, id));

  if (productDocument.exists()) {
    return mapProduct(productDocument);
  }

  const products = await getProducts();
  return products.find((product) => String(product.id) === id) ?? null;
};
