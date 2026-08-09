import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../axiosClient";
import { Button } from "../../components/DataFields";
import { useToast } from "../../components/Popups";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../utils/logout";

const statuses = ["pending", "printed", "cooking", "ready"];

export const KitchenDisplay = () => {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const toastRef = useRef(showToast);
  useEffect(() => {
    toastRef.current = showToast;
  }, [showToast]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await api.get("/kitchen-tickets", { params: { per_page: 100, sort_by: "priority", sort_direction: "desc" } });
      const rows = response.data?.data?.data || response.data?.data || [];
      setTickets(rows.filter((ticket) => statuses.includes(ticket.status)));
    } catch (error) {
      if (!quiet) toastRef.current({ type: "error", message: error?.response?.data?.message || "Could not load kitchen tickets." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(load, 0);
    const timer = window.setInterval(() => load(true), 15000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [load]);

  const move = async (ticket, status) => {
    try {
      await api.put(`/kitchen-tickets/${ticket.id}`, { status });
      setTickets((current) =>
        status === "closed"
          ? current.filter((item) => item.id !== ticket.id)
          : current.map((item) => item.id === ticket.id ? { ...item, status } : item),
      );
    } catch (error) {
      showToast({ type: "error", message: error?.response?.data?.message || "Ticket could not be updated." });
    }
  };

  const nextStatus = (status) => ({ pending: "cooking", printed: "cooking", cooking: "ready", ready: "closed" })[status];
  const handleLogout = async () => {
    await logoutUser({ navigate });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6">
      <ToastContainer />
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">Live kitchen</p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Kitchen Display</h1>
          <p className="text-sm text-slate-500">Auto-refreshes every 15 seconds.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => load()}>Refresh</Button>
          <Button variant="outlined" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      {loading ? <div className="py-20 text-center text-slate-500">Loading tickets…</div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {tickets.map((ticket) => (
            <article key={ticket.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900 ${ticket.priority === "urgent" ? "border-red-500" : "border-slate-200 dark:border-slate-800"}`}>
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                <div><p className="font-black text-slate-900 dark:text-white">{ticket.ticket_number || `Ticket #${ticket.id}`}</p><p className="text-xs text-slate-500">Order #{ticket.order_id}</p></div>
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold uppercase text-orange-700">{ticket.status}</span>
              </div>
              <div className="space-y-2 p-4">
                {(ticket.items || []).map((item) => (
                  <div key={item.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white">{item.quantity} × {item.order_item?.menu_item?.name || `Item #${item.order_item_id}`}</p>
                    {item.notes && <p className="mt-1 text-sm text-slate-500">{item.notes}</p>}
                  </div>
                ))}
                {!ticket.items?.length && <p className="py-4 text-center text-sm text-slate-400">Open ticket to view its items.</p>}
              </div>
              <div className="p-4 pt-0"><Button fullWidth onClick={() => move(ticket, nextStatus(ticket.status))}>{ticket.status === "ready" ? "Complete" : ticket.status === "cooking" ? "Mark Ready" : "Start Cooking"}</Button></div>
            </article>
          ))}
        </div>
      )}
      {!loading && tickets.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center text-slate-500 dark:border-slate-700">No active kitchen tickets.</div>}
    </div>
  );
};
