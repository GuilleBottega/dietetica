import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase-config.js";
import { setCategory } from "./categories.js";


const productsRef = collection(db, "products");

/* -------------------------------------------------------------------------- */
/*                               TRAER PRODUCTOS                              */
/* -------------------------------------------------------------------------- */
export const getProducts = async () => {
  try {
 
    const snapshot = await getDocs(productsRef);

    const productsFormat = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    return productsFormat;
  } catch (error) {
    console.log("Error al traer productos", error);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                            TRAER PRODUCTO POR ID                           */
/* -------------------------------------------------------------------------- */

export const getProductById = async (id) => {
  try {

    const productRef = doc(productsRef, id);

  
    const snapshot = await getDoc(productRef);

    
    if (snapshot.exists()) {
      const product = { id: snapshot.id, ...snapshot.data() };
      console.log("Doc:", product);
      return product;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al traer producto por ID:", error);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                          SI FILTRAMOS POR CATEGORY                         */
/* -------------------------------------------------------------------------- */
export const getByCategory = async (category) => {
  try {
    let queryRef;


    if (category) {
      queryRef = query(productsRef, where("category", "==", category));
    } else {
      queryRef = productsRef;
    }

   
    const snapshot = await getDocs(queryRef);
    
    const productsFormat = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    return productsFormat;
  } catch (error) {
    console.error("Error al filtrar productos:", error);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*                              ALTA DE PRODUCTO                              */
/* -------------------------------------------------------------------------- */
export const createProduct = async (productData) => {
  try {
    const batch = writeBatch(db);
    const productRef = doc(productsRef);
    await setCategory(productData.category, batch);
    batch.set(productRef, productData);
    await batch.commit();
    const docRef = productRef;
    return docRef.id;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const batch = writeBatch(db);
    batch.update(doc(productsRef, id), productData);
    await setCategory(productData.category, batch);
    await batch.commit();
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

export const adjustProductStock = async (id, amount) => {
  if (!Number.isInteger(amount) || amount === 0) {
    throw new Error("El ajuste de stock debe ser un entero distinto de cero.");
  }

  try {
    const productRef = doc(productsRef, id);
    return await runTransaction(db, async (transaction) => {
      const productSnapshot = await transaction.get(productRef);
      if (!productSnapshot.exists()) {
        throw new Error("No se encontró el producto.");
      }

      const storedStock = productSnapshot.data().stock;
      const currentStock =
        Number.isInteger(storedStock) && storedStock >= 0 ? storedStock : 0;
      const storedCapacity = productSnapshot.data().stockCapacity;
      const currentCapacity =
        Number.isInteger(storedCapacity) && storedCapacity >= currentStock
          ? storedCapacity
          : currentStock;
      const nextStock = currentStock + amount;
      if (nextStock < 0) {
        throw new Error("El stock no puede ser menor que cero.");
      }

      transaction.update(productRef, {
        stock: nextStock,
        stockCapacity: Math.max(currentCapacity, nextStock),
      });
      return nextStock;
    });
  } catch (error) {
    console.error("No se pudo ajustar el stock del producto:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await deleteDoc(doc(productsRef, id));
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};
