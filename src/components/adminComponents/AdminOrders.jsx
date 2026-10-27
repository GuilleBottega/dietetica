import { useEffect, useState } from "react";
import { useLanguage } from "../../context/useLanguage.js";
import { getOrders, updateOrderStatus } from "../../services/orders.js";
import "./AdminOrders.css";

const orderStatuses = ["pending", "confirmed", "delivered", "cancelled"];

export default function AdminOrders() {
  const { t, formatPrice, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getOrders()
      .then((loadedOrders) => {
        if (isCurrent) setOrders(loadedOrders);
      })
      .catch(() => {
        if (isCurrent) setError(t("orderLoadError"));
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [t]);

  const handleStatusChange = async (order, status) => {
    setUpdatingId(order.id);
    setError("");

    try {
      await updateOrderStatus(order.id, status);
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? { ...currentOrder, status }
            : currentOrder
        )
      );
    } catch {
      setError(t("orderUpdateError"));
    } finally {
      setUpdatingId("");
    }
  };

  const statusLabels = {
    pending: t("orderPending"),
    confirmed: t("orderConfirmed"),
    delivered: t("orderDelivered"),
    cancelled: t("orderCancelled"),
  };

  return (
    <section className="admin-orders">
      <h1>{t("ordersTitle")}</h1>
      {loading && <p role="status">{t("loadingOrders")}</p>}
      {error && <p className="admin-orders__error" role="alert">{error}</p>}
      {!loading && !error && orders.length === 0 && <p>{t("noOrders")}</p>}

      <div className="admin-orders__list">
        {orders.map((order) => {
          const createdAt = order.createdAt?.toDate?.();

          return (
            <article className="admin-orders__card" key={order.id}>
              <header className="admin-orders__header">
                <h2>
                  {t("orderNumber")} #{order.id}
                </h2>
                <span>
                  {createdAt
                    ? createdAt.toLocaleString(
                        language === "en" ? "en-US" : "es-AR"
                      )
                    : t("loading")}
                </span>
              </header>
              <p>
                <strong>{t("customer")}:</strong> {order.customer?.name} —{" "}
                <a href={`tel:${order.customer?.phone}`}>{order.customer?.phone}</a>
              </p>
              <ul className="admin-orders__items">
                {order.items?.map((item) => (
                  <li key={item.id}>
                    {item.name} × {item.quantity} —{" "}
                    {formatPrice(item.price * item.quantity)}
                  </li>
                ))}
              </ul>
              <p className="admin-orders__total">
                {t("total")}: {formatPrice(order.total)}
              </p>
              <label className="admin-orders__status">
                {t("orderStatus")}
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(event) =>
                    handleStatusChange(order, event.target.value)
                  }
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}
