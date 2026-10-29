import { useEffect, useState } from "react";
import { useLanguage } from "../../context/useLanguage.js";
import { getOrders, updateOrderStatus } from "../../services/orders.js";
import "./AdminOrders.css";

const orderStatuses = ["pending", "confirmed", "delivered", "cancelled"];

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

export default function AdminOrders() {
  const { t, formatPrice, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportError, setExportError] = useState("");

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

  const handleDateSearch = async (event) => {
    event.preventDefault();
    if (startDate && endDate && startDate > endDate) {
      setError(t("invalidOrderDateRange"));
      return;
    }

    setLoading(true);
    setError("");
    try {
      setOrders(await getOrders({ startDate, endDate }));
    } catch {
      setError(t("orderLoadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleClearDateSearch = async () => {
    setStartDate("");
    setEndDate("");
    setLoading(true);
    setError("");
    try {
      setOrders(await getOrders());
    } catch {
      setError(t("orderLoadError"));
    } finally {
      setLoading(false);
    }
  };

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
    } catch (updateError) {
      setError(
        updateError.code === "insufficient-stock"
          ? t("orderStockInsufficient")
          : t("orderUpdateError")
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleExportPdf = () => {
    if (orders.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setExportError(t("orderPdfPopupError"));
      return;
    }

    setExportError("");
    const locale = language === "en" ? "en-US" : "es-AR";
    const printableOrders = orders
      .map((order) => {
        const createdAt = order.createdAt?.toDate?.();
        const date = createdAt
          ? createdAt.toLocaleString(locale)
          : t("loading");
        const items = (order.items ?? [])
          .map(
            (item) =>
              `<li>${escapeHtml(item.name)} × ${escapeHtml(item.quantity)} — ${escapeHtml(formatPrice(item.price * item.quantity))}</li>`
          )
          .join("");

        return `<article class="order">
          <header><h2>${escapeHtml(t("orderNumber"))} #${escapeHtml(order.id)}</h2><span>${escapeHtml(date)}</span></header>
          <p><strong>${escapeHtml(t("customer"))}:</strong> ${escapeHtml(order.customer?.name ?? "")} — ${escapeHtml(order.customer?.phone ?? "")}</p>
          <ul>${items}</ul>
          <p><strong>${escapeHtml(t("orderStatus"))}:</strong> ${escapeHtml(statusLabels[order.status] ?? order.status ?? "")}</p>
          <p class="total"><strong>${escapeHtml(t("total"))}:</strong> ${escapeHtml(formatPrice(order.total))}</p>
        </article>`;
      })
      .join("");
    const dateRange = startDate || endDate
      ? `${startDate ? escapeHtml(startDate) : "—"} – ${endDate ? escapeHtml(endDate) : "—"}`
      : t("allOrderDates");

    printWindow.document.write(`<!doctype html>
      <html lang="${language === "en" ? "en" : "es"}">
        <head>
          <meta charset="utf-8">
          <title>${escapeHtml(t("ordersTitle"))}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; color: #222; }
            h1 { margin-bottom: 6px; font-size: 24px; }
            .range, .generated { color: #555; margin: 4px 0; }
            .order { margin: 18px 0; padding: 14px; border: 1px solid #bbb; border-radius: 8px; break-inside: avoid; }
            .order header { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
            .order h2 { margin: 0; font-size: 16px; }
            .order header span { color: #555; }
            .order ul { padding-left: 22px; }
            .total { font-size: 16px; }
            @media print { body { margin: 15mm; } }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(t("ordersTitle"))}</h1>
          <p class="range">${escapeHtml(t("orderReportDateRange"))}: ${escapeHtml(dateRange)}</p>
          <p class="generated">${escapeHtml(t("reportGenerated"))}: ${escapeHtml(new Date().toLocaleString(locale))}</p>
          ${printableOrders}
        </body>
      </html>`);
    printWindow.document.close();
    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
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
      <form className="admin-orders__date-filter" onSubmit={handleDateSearch}>
        <label>
          {t("ordersFromDate")}
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label>
          {t("ordersToDate")}
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {t("searchOrders")}
        </button>
        <button
          type="button"
          onClick={handleClearDateSearch}
          disabled={loading || (!startDate && !endDate)}
        >
          {t("clearOrderDates")}
        </button>
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={loading || orders.length === 0}
        >
          {t("saveOrdersPdf")}
        </button>
      </form>
      {exportError && (
        <p className="admin-orders__error" role="alert">
          {exportError}
        </p>
      )}
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
