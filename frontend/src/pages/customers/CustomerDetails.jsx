import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { parseApiError } from "../../axiosClient";
import { Button, NumberField, SelectField, TextAreaField } from "../../components/DataFields";
import { Dialog, useToast } from "../../components/Popups";
import { Table } from "../../components/Tables";

const rowsOf = (response) => response.data?.data?.data || response.data?.data || [];

export const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const toastRef = useRef(showToast);
  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loyalty, setLoyalty] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => { toastRef.current = showToast; }, [showToast]);

  const load = useCallback(async () => {
    try {
      const [customerResponse, addressResponse, loyaltyResponse, orderResponse] = await Promise.all([
        api.get(`/customers/${customerId}`),
        api.get("/customer-addresses", { params: { per_page: 100, "filters[customer_id]": customerId } }),
        api.get("/loyalty-transactions", { params: { per_page: 100, "filters[customer_id]": customerId, sort_by: "id", sort_direction: "desc" } }),
        api.get("/orders", { params: { per_page: 100, "filters[customer_id]": customerId, sort_by: "id", sort_direction: "desc" } }),
      ]);
      setCustomer(customerResponse.data?.data);
      setAddresses(rowsOf(addressResponse));
      setLoyalty(rowsOf(loyaltyResponse));
      setOrders(rowsOf(orderResponse));
    } catch (error) {
      toastRef.current({ type: "error", message: parseApiError(error).message });
    }
  }, [customerId]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const recordLoyalty = async () => {
    try {
      await api.post(`/customers/${customerId}/loyalty-transactions`, {
        type: form.type,
        points: Number(form.points),
        order_id: form.order_id ? Number(form.order_id) : null,
        description: form.description || null,
      });
      toastRef.current({ type: "success", message: "Loyalty balance updated." });
      setForm(null);
      load();
    } catch (error) {
      toastRef.current({ type: "error", message: parseApiError(error).message });
    }
  };

  if (!customer) return <div className="py-20 text-center text-slate-500">Loading customer…</div>;

  return (
    <div className="space-y-6">
      <ToastContainer />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><button onClick={() => navigate("/customers")} className="text-sm font-semibold text-blue-600">← Customers</button><h1 className="mt-2 text-3xl font-bold">{customer.first_name} {customer.last_name}</h1><p className="text-sm text-slate-500">{customer.customer_code} · {customer.customer_type} · {customer.status}</p></div>
        <Button onClick={() => setForm({ type: "earn", points: "", order_id: "", description: "" })}>Adjust Loyalty</Button>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Loyalty Points", customer.loyalty_points], ["Total Spend", customer.total_spend], ["Receipts", customer.receipt_count], ["Last Visit", customer.last_visited_at || "—"], ["Phone", customer.phone], ["Email", customer.email], ["Identity", customer.id_number || "—"], ["City", customer.city || "—"]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111318]"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-2 font-semibold">{value ?? "—"}</p></div>)}
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111318]"><h2 className="mb-3 text-lg font-bold">Addresses</h2><Table columns={[{ key: "label", label: "Label" }, { key: "address_line_1", label: "Address" }, { key: "city", label: "City" }, { key: "delivery_instructions", label: "Instructions" }, { key: "is_default", label: "Default" }]} data={addresses.map((item) => ({ ...item, is_default: item.is_default ? "Yes" : "No" }))} /></section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111318]"><h2 className="mb-3 text-lg font-bold">Loyalty History</h2><Table columns={[{ key: "type", label: "Type" }, { key: "points", label: "Points" }, { key: "balance_after", label: "Balance" }, { key: "description", label: "Description" }, { key: "occurred_at", label: "Date" }]} data={loyalty} /></section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111318]"><h2 className="mb-3 text-lg font-bold">Orders</h2><Table columns={[{ key: "order_number", label: "Order" }, { key: "order_type", label: "Type" }, { key: "status", label: "Status" }, { key: "payment_status", label: "Payment" }, { key: "created_at", label: "Date" }]} data={orders} actions={(row) => [{ label: "Open", icon: <span className="font-semibold text-blue-600">Open</span>, onClick: () => navigate(`/orders/${row.id}`) }]} /></section>
      <Dialog isOpen={Boolean(form)} onClose={() => setForm(null)} title="Loyalty Transaction" onPrimaryButtonClick={recordLoyalty} primaryButtonText="Save Transaction">
        {form && <div className="space-y-4"><SelectField label="Type" value={form.type} options={[{ value: "earn", label: "Earn" }, { value: "redeem", label: "Redeem" }, { value: "adjustment", label: "Adjustment" }, { value: "expiry", label: "Expiry" }]} onChange={(event) => setForm({ ...form, type: event.target.value })} /><NumberField label="Points" value={form.points} onChange={(event) => setForm({ ...form, points: event.target.value })} /><SelectField label="Related Order" value={form.order_id} options={orders.map((item) => ({ value: item.id, label: item.order_number }))} onChange={(event) => setForm({ ...form, order_id: event.target.value })} searchable /><TextAreaField label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>}
      </Dialog>
    </div>
  );
};
