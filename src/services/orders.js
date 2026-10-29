import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
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
      stockDeducted: false,
      createdAt: serverTimestamp(),
    });
    return orderRef.id;
  } catch (error) {
    console.error("Error al registrar el pedido:", error);
    throw error;
  }
};

export const getOrders = async ({ startDate, endDate } = {}) => {
  try {
    const constraints = [];
    if (startDate) {
      const [year, month, day] = startDate.split("-").map(Number);
      constraints.push(where("createdAt", ">=", new Date(year, month - 1, day)));
    }
    if (endDate) {
      const [year, month, day] = endDate.split("-").map(Number);
      constraints.push(
        where("createdAt", "<", new Date(year, month - 1, day + 1))
      );
    }
    constraints.push(orderBy("createdAt", "desc"));

    const snapshot = await getDocs(query(ordersRef, ...constraints));
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
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(ordersRef, id);
      const orderSnapshot = await transaction.get(orderRef);
      if (!orderSnapshot.exists()) {
        throw new Error("No se encontró la orden.");
      }

      const order = orderSnapshot.data();
      const shouldDeductStock = status === "confirmed" || status === "delivered";
      const stockWasDeducted =
        typeof order.stockDeducted === "boolean"
          ? order.stockDeducted
          : false;

      if (shouldDeductStock !== stockWasDeducted) {
        const quantitiesByProduct = new Map();
        (order.items ?? []).forEach((item) => {
          const itemId = String(item.id);
          quantitiesByProduct.set(
            itemId,
            (quantitiesByProduct.get(itemId) ?? 0) + Number(item.quantity)
          );
        });
        const productSnapshots = await Promise.all(
          [...quantitiesByProduct.keys()].map((productId) =>
            transaction.get(doc(db, "products", productId))
          )
        );

        productSnapshots.forEach((productSnapshot) => {
          const quantity = quantitiesByProduct.get(productSnapshot.id);
          const product = productSnapshot.data();
          const stock = product?.stock;
          if (
            !productSnapshot.exists() ||
            !Number.isInteger(quantity) ||
            quantity <= 0 ||
            !Number.isInteger(stock) ||
            stock < 0 ||
            (shouldDeductStock && stock < quantity)
          ) {
            const error = new Error(
              shouldDeductStock
                ? "No hay stock suficiente para confirmar la orden."
                : "No se pudo devolver el stock de la orden."
            );
            error.code = shouldDeductStock
              ? "insufficient-stock"
              : "stock-restoration-failed";
            throw error;
          }
        });

        productSnapshots.forEach((productSnapshot) => {
          const product = productSnapshot.data();
          const quantity = quantitiesByProduct.get(productSnapshot.id);
          const stock = product.stock;
          const stockCapacity =
            Number.isInteger(product.stockCapacity) && product.stockCapacity > 0
              ? product.stockCapacity
              : stock;
          const nextStock = stock + (shouldDeductStock ? -quantity : quantity);
          transaction.update(productSnapshot.ref, {
            stock: nextStock,
            stockCapacity: Math.max(stockCapacity, nextStock),
          });
        });
      }

      transaction.update(orderRef, {
        status,
        stockDeducted: shouldDeductStock,
      });
    });
  } catch (error) {
    console.error("Error al actualizar el estado del pedido:", error);
    throw error;
  }
};
