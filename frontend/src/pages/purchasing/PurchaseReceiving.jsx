import { useEffect, useState } from "react";
import api from "../../axiosClient";
import { Button, NumberField, SelectField } from "../../components/DataFields";
import { useToast } from "../../components/Popups";
import { useParams } from "react-router-dom";

const collection = (response) => response.data?.data?.data || response.data?.data || [];

export const PurchaseReceiving = () => {
  const { purchaseOrderId } = useParams();
  const { showToast, ToastContainer } = useToast();
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState(purchaseOrderId || "");
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/purchase-orders", { params: { per_page: 100 } })
      .then((response) => setOrders(collection(response).filter((order) => !["received", "cancelled"].includes(order.status))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!orderId) {
      return;
    }
    const timer = window.setTimeout(() => {
      api.get("/purchase-order-items", { params: { per_page: 100, "filters[purchase_order_id]": orderId } })
        .then((response) => {
          const rows = collection(response);
          setItems(rows);
          setQuantities(Object.fromEntries(rows.map((item) => [item.id, Math.max(0, Number(item.quantity) - Number(item.received_quantity || 0))])));
        })
        .catch(() => setItems([]));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [orderId]);

  const receive = async () => {
    const receiving = items
      .map((item) => ({ purchase_order_item_id: item.id, quantity: Number(quantities[item.id] || 0) }))
      .filter((item) => item.quantity > 0);
    if (!receiving.length) return;
    setSaving(true);
    try {
      await api.post(`/purchase-orders/${orderId}/receive`, { items: receiving, received_at: new Date().toISOString() });
      showToast({ type: "success", message: "Stock received and inventory balances updated." });
      setOrderId("");
      setItems([]);
    } catch (error) {
      showToast({ type: "error", message: error?.response?.data?.message || "Purchase order could not be received." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      <header>
        <p className="text-sm font-semibold text-blue-600">Purchasing</p>
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Receive Purchase Order</h1>
        <p className="mt-1 text-sm text-slate-500">Record partial or complete deliveries and update stock automatically.</p>
      </header>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111318]">
        <SelectField
          label="Purchase Order"
          value={orderId}
          options={orders.map((order) => ({ value: order.id, label: `${order.purchase_order_number} — ${order.status}` }))}
          onChange={(event) => {
            setItems([]);
            setOrderId(event.target.value);
          }}
          searchable
          fullWidth
        />
      </section>
      {items.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111318]">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => {
              const remaining = Math.max(0, Number(item.quantity) - Number(item.received_quantity || 0));
              return (
                <div key={item.id} className="grid items-center gap-4 p-4 md:grid-cols-[1fr_140px_180px]">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Inventory item #{item.inventory_item_id}</p>
                    <p className="text-sm text-slate-500">Ordered {item.quantity}; received {item.received_quantity || 0}; remaining {remaining}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Unit cost: {item.unit_cost}</p>
                  <NumberField label="Receive Now" value={quantities[item.id] ?? ""} min={0} max={remaining} onChange={(event) => setQuantities({ ...quantities, [item.id]: event.target.value })} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-end border-t border-slate-200 p-4 dark:border-slate-800">
            <Button onClick={receive} disabled={saving}>{saving ? "Receiving…" : "Receive Stock"}</Button>
          </div>
        </section>
      )}
    </div>
  );
};
