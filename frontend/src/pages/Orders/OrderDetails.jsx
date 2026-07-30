import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { parseApiError } from "../../axiosClient";
import { Button, NumberField, SelectField, TextAreaField, TextField } from "../../components/DataFields";
import { Dialog, useToast } from "../../components/Popups";
import { Table } from "../../components/Tables";

const tabs = ["Summary", "Items", "Bill", "Payments", "Delivery", "Discounts", "Kitchen", "History"];
const rowsOf = (response) => response.data?.data?.data || response.data?.data || [];

export const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const toastRef = useRef(showToast);
  useEffect(() => {
    toastRef.current = showToast;
  }, [showToast]);
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState(null);
  const [tab, setTab] = useState("Summary");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({});
  const [orders, setOrders] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const load = useCallback(async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data?.data);
    } catch (error) {
      toastRef.current({ type: "error", message: parseApiError(error).message });
    }
  }, [orderId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    Promise.all([
      api.get("/orders", { params: { per_page: 100 } }),
      api.get("/promotions", { params: { per_page: 100, "filters[is_active]": 1 } }),
    ]).then(([orderResponse, promotionResponse]) => {
      setOrders(rowsOf(orderResponse).filter((item) => String(item.id) !== String(orderId)));
      setPromotions(rowsOf(promotionResponse));
    }).catch(() => {});
    return () => window.clearTimeout(timer);
  }, [load, orderId]);

  const action = async (request, success) => {
    try {
      await request();
      showToast({ type: "success", message: success });
      setDialog(null);
      setForm({});
      await load();
    } catch (error) {
      showToast({ type: "error", message: parseApiError(error).message, duration: 8000 });
    }
  };

  const loadHistory = useCallback(async () => {
    try {
      const response = await api.get(`/orders/${orderId}/history`);
      setHistory(response.data?.data);
    } catch (error) {
      toastRef.current({ type: "error", message: parseApiError(error).message });
    }
  }, [orderId]);

  useEffect(() => {
    if (tab === "History" && !history) {
      const timer = window.setTimeout(loadHistory, 0);
      return () => window.clearTimeout(timer);
    }
  }, [tab, history, loadHistory]);

  if (!order) return <div className="py-20 text-center text-slate-500">Loading order…</div>;

  const items = order.items || [];
  const bill = order.bill;
  const panel = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111318]";

  return (
    <div className="space-y-5">
      <ToastContainer />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <button onClick={() => navigate("/orders")} className="mb-2 text-sm font-semibold text-blue-600">← Orders</button>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{order.order_number || `Order #${order.id}`}</h1>
          <p className="text-sm text-slate-500">{order.order_type} · {order.status} · {order.payment_status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setDialog("promotion")}>Apply Promotion</Button>
          <Button variant="secondary" onClick={() => setDialog("merge")}>Merge</Button>
          {!bill && <Button onClick={() => action(() => api.post(`/orders/${order.id}/bill`), "Bill generated.")}>Generate Bill</Button>}
          <SelectField value={order.status} options={["pending", "accepted", "preparing", "ready", "served", "completed", "cancelled"].map((value) => ({ value, label: value }))} onChange={(event) => action(() => api.put(`/orders/${order.id}`, { status: event.target.value }), "Order status updated.")} />
        </div>
      </header>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-[#111318]">
        {tabs.map((name) => <button key={name} onClick={() => setTab(name)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === name ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{name}</button>)}
      </div>

      {tab === "Summary" && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[["Customer", order.customer?.first_name || "Walk-in"], ["Table", order.table?.table_number || "—"], ["Guests", order.guest_count || "—"], ["Source", order.order_source], ["Priority", order.priority], ["Created", order.created_at], ["Waiter", order.waiter?.name || `#${order.waiter_id || "—"}`], ["Notes", order.notes || "—"]].map(([label, value]) => <div key={label} className={panel}><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-2 font-semibold text-slate-900 dark:text-white">{value}</p></div>)}
      </div>}

      {tab === "Items" && <div className={panel}><Table columns={[{ key: "id", label: "ID" }, { key: "menu_item_name_snapshot", label: "Item" }, { key: "quantity", label: "Qty" }, { key: "unit_price", label: "Price" }, { key: "status", label: "Status" }, { key: "notes", label: "Notes" }]} data={items} actions={(item) => [
        { label: "Transfer", icon: <span className="text-sm font-semibold text-blue-600">Transfer</span>, onClick: () => { setForm({ item_id: item.id, quantity: 1, to_order_id: "", reason: "" }); setDialog("transfer"); } },
        { label: "Ready", icon: <span className="text-sm font-semibold text-emerald-600">Ready</span>, onClick: () => action(() => api.patch(`/orders/${order.id}/items/${item.id}/status`, { status: "ready" }), "Item marked ready.") },
      ]} /></div>}

      {tab === "Bill" && <div className={panel}>{bill ? <div className="grid gap-4 sm:grid-cols-3"><div><p className="text-sm text-slate-500">Bill</p><p className="font-bold">{bill.bill_number}</p></div><div><p className="text-sm text-slate-500">Grand total</p><p className="text-xl font-bold">{bill.grand_total}</p></div><div><p className="text-sm text-slate-500">Balance</p><p className="text-xl font-bold">{bill.balance_due}</p></div></div> : <p className="text-slate-500">No bill generated.</p>}</div>}
      {tab === "Payments" && <div className={panel}><Table columns={[{ key: "payment_number", label: "Payment" }, { key: "payment_method", label: "Method" }, { key: "amount_paid", label: "Amount" }, { key: "payment_status", label: "Status" }]} data={bill?.payments || []} /></div>}
      {tab === "Delivery" && <div className={panel}>{order.delivery ? <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(order.delivery, null, 2)}</pre> : <p className="text-slate-500">No delivery record.</p>}</div>}
      {tab === "Discounts" && <div className={panel}><Table columns={[{ key: "discount_type", label: "Type" }, { key: "discount_value", label: "Value" }, { key: "discount_amount", label: "Amount" }, { key: "reason", label: "Reason" }]} data={order.discounts || []} /></div>}
      {tab === "Kitchen" && <div className={panel}><Table columns={[{ key: "ticket_number", label: "Ticket" }, { key: "status", label: "Status" }, { key: "priority", label: "Priority" }, { key: "generated_at", label: "Generated" }]} data={order.kitchen_tickets || order.kitchenTickets || []} /></div>}
      {tab === "History" && <div className="grid gap-4 lg:grid-cols-3">{[
        ["Status History", history?.status_history || []], ["Transfers In", history?.transfers_in || []], ["Transfers Out", history?.transfers_out || []],
      ].map(([title, records]) => <section key={title} className={panel}><h2 className="mb-3 font-bold">{title}</h2>{records.length ? records.map((record) => <div key={record.id} className="mb-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800"><p className="font-semibold">{record.to_status || record.reason || `Record #${record.id}`}</p><p className="text-slate-500">{record.actor?.name || "System"} · {record.changed_at || record.created_at}</p></div>) : <p className="text-sm text-slate-500">No records.</p>}</section>)}</div>}

      <Dialog isOpen={dialog === "transfer"} onClose={() => setDialog(null)} title="Transfer Order Item" onPrimaryButtonClick={() => action(() => api.post(`/orders/${order.id}/items/${form.item_id}/transfer`, { to_order_id: Number(form.to_order_id), quantity: Number(form.quantity), reason: form.reason || null }), "Item transferred.")} primaryButtonText="Transfer">
        <div className="space-y-4"><SelectField label="Destination Order" value={form.to_order_id || ""} options={orders.map((item) => ({ value: item.id, label: item.order_number }))} onChange={(event) => setForm({ ...form, to_order_id: event.target.value })} searchable /><NumberField label="Quantity" value={form.quantity || 1} min={1} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /><TextAreaField label="Reason" value={form.reason || ""} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></div>
      </Dialog>
      <Dialog isOpen={dialog === "merge"} onClose={() => setDialog(null)} title="Merge Orders" onPrimaryButtonClick={() => action(() => api.post(`/orders/${order.id}/merge`, { source_order_id: Number(form.source_order_id), reason: form.reason || null }), "Orders merged.")} primaryButtonText="Merge">
        <div className="space-y-4"><SelectField label="Source Order" value={form.source_order_id || ""} options={orders.map((item) => ({ value: item.id, label: item.order_number }))} onChange={(event) => setForm({ ...form, source_order_id: event.target.value })} searchable /><TextAreaField label="Reason" value={form.reason || ""} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></div>
      </Dialog>
      <Dialog isOpen={dialog === "promotion"} onClose={() => setDialog(null)} title="Apply Promotion or Coupon" onPrimaryButtonClick={() => action(() => api.post(`/orders/${order.id}/apply-promotion`, { promotion_id: form.promotion_id ? Number(form.promotion_id) : null, coupon_code: form.coupon_code || null, reason: form.reason || null }), "Promotion applied.")} primaryButtonText="Apply">
        <div className="space-y-4"><SelectField label="Promotion" value={form.promotion_id || ""} options={promotions.map((item) => ({ value: item.id, label: item.name }))} onChange={(event) => setForm({ ...form, promotion_id: event.target.value })} searchable /><TextField label="Or Coupon Code" value={form.coupon_code || ""} onChange={(event) => setForm({ ...form, coupon_code: event.target.value })} /><TextAreaField label="Reason" value={form.reason || ""} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></div>
      </Dialog>
    </div>
  );
};
