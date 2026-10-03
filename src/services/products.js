import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase-config";

const productsCollection = "products";

export const addProduct = async (product) => {
  const document = await addDoc(collection(db, productsCollection), product);
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
    products.map((product) => {
      const productRef = doc(db, productsCollection, String(product.id));
      return runTransaction(db, async (transaction) => {
        const existingProduct = await transaction.get(productRef);
        if (existingProduct.exists()) return false;

        transaction.set(productRef, product);
        return true;
      });
    })
  );

  return {
    added: results.filter(Boolean).length,
    skipped: results.filter((wasAdded) => !wasAdded).length,
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
