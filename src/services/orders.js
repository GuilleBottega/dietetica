import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase-config.js";

const ordersRef = collection(db, "orders");

export const createOrder = async ({ customer, items, total }) => {
  try {
    const orderRef = await addDoc(ordersRef, {
      customer,
      items,
      total,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return orderRef.id;
  } catch (error) {
    console.error("Error al registrar el pedido:", error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const snapshot = await getDocs(query(ordersRef, orderBy("createdAt", "desc")));
    return snapshot.docs.map((orderDocument) => ({
      id: orderDocument.id,
      ...orderDocument.data(),
    }));
  } catch (error) {
    console.error("Error al cargar los pedidos:", error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    await updateDoc(doc(ordersRef, id), { status });
  } catch (error) {
    console.error("Error al actualizar el estado del pedido:", error);
    throw error;
  }
};
