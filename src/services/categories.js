import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase-config.js";

export const defaultCategories = [
  "Aceites",
  "Frutos secos",
  "Cereales",
  "Colaciones",
  "Semillas",
  "Frutas deshidratadas",
  "Untables",
  "Harinas",
  "Legumbres",
  "Dulces",
  "Endulzantes",
];

const categoriesRef = collection(db, "categories");
const productsRef = collection(db, "products");
const initializationRef = doc(categoriesRef, "category-metadata");
let initializationPromise;

const getCategoryRef = (name) =>
  doc(categoriesRef, `category-${encodeURIComponent(name)}`);

const ensureCategoriesInitialized = async () => {
  const initializationSnapshot = await getDoc(initializationRef);
  if (initializationSnapshot.exists()) return;

  if (!initializationPromise) {
    initializationPromise = (async () => {
      const productsSnapshot = await getDocs(productsRef);
      const names = [
        ...new Set([
          ...defaultCategories,
          ...productsSnapshot.docs
            .map((product) => product.data().category?.trim())
            .filter(Boolean),
        ]),
      ];

      for (let index = 0; index < names.length; index += 450) {
        const batch = writeBatch(db);
        names.slice(index, index + 450).forEach((name) => {
          batch.set(getCategoryRef(name), { name });
        });
        await batch.commit();
      }

      await writeBatch(db)
        .set(initializationRef, { initialized: true })
        .commit();
    })().finally(() => {
      initializationPromise = undefined;
    });
  }

  await initializationPromise;
};

export const getCategories = async () => {
  const initializationSnapshot = await getDoc(initializationRef);
  if (!initializationSnapshot.exists()) {
    const productsSnapshot = await getDocs(productsRef);
    return [
      ...new Set([
        ...defaultCategories,
        ...productsSnapshot.docs
          .map((product) => product.data().category?.trim())
          .filter(Boolean),
      ]),
    ].sort((first, second) => first.localeCompare(second, "es"));
  }

  const snapshot = await getDocs(categoriesRef);

  return snapshot.docs
    .filter((category) => category.id !== initializationRef.id)
    .map((category) => category.data().name)
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second, "es"));
};

export const initializeCategories = async () => {
  await ensureCategoriesInitialized();
  return getCategories();
};

export const setCategory = async (name, batch) => {
  await ensureCategoriesInitialized();
  batch.set(getCategoryRef(name), { name });
};

export const deleteCategory = async (name) => {
  await ensureCategoriesInitialized();

  try {
    const categoryProducts = await getDocs(
      query(productsRef, where("category", "==", name))
    );

    for (let index = 0; index < categoryProducts.docs.length; index += 450) {
      const batch = writeBatch(db);
      categoryProducts.docs
        .slice(index, index + 450)
        .forEach((product) => batch.delete(product.ref));
      await batch.commit();
    }

    await deleteDoc(getCategoryRef(name));
    return categoryProducts.size;
  } catch (error) {
    console.error(`No se pudo eliminar la categoría "${name}":`, error);
    throw error;
  }
};
