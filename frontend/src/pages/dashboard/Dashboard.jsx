import {
  FiActivity,
  FiAlertTriangle,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiCoffee,
  FiDollarSign,
  FiGrid,
  FiShoppingBag,
  FiStar,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import api from "../../axiosClient";

const stats = [
  {
    label: "Today Revenue",
    value: "—", trend: "Loading", detail: "Live reporting data",
    icon: FiDollarSign,
    tone: "blue",
  },
  {
    label: "Open Orders",
    value: "—", trend: "Loading", detail: "Live reporting data",
    icon: FiShoppingBag,
    tone: "emerald",
  },
  {
    label: "Kitchen Queue",
    value: "—", trend: "Loading", detail: "Live reporting data",
    icon: FiClock,
    tone: "amber",
  },
  {
    label: "Reservations",
    value: "—", trend: "Loading", detail: "Live reporting data",
    icon: FiStar,
    tone: "violet",
  },
];

const salesTrend = [];
const team = [];

const toneClasses = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  emerald:
    "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  amber:
    "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  violet:
    "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
};

const tableStatusClasses = {
  occupied:
    "border-blue-200 bg-blue-50/80 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200",
  available:
    "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  reserved:
    "border-violet-200 bg-violet-50/80 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200",
  cleaning:
    "border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
};

const statusPillClasses = {
  Serving: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  Ready: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  Cooking: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  Paid: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  Plating: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  Queued: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
};

const Panel = ({ children, className = "" }) => (
  <section
    className={`rounded-lg border border-slate-200/80 bg-white/90 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.55)] backdrop-blur-sm dark:border-white/10 dark:bg-[#11151d]/92 ${className}`}
  >
    {children}
  </section>
);

const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-white/10">
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-white/8 dark:text-slate-200 dark:ring-white/10">
        <Icon className="size-4" />
      </span>
      <h2 className="truncate text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
    </div>
    {action ? (
      <button className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
        {action}
        <FiChevronRight className="size-4" />
      </button>
    ) : null}
  </div>
);

const StatusPill = ({ children }) => (
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
      statusPillClasses[children] || "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
    }`}
  >
    {children}
  </span>
);

export const Dashboard = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [dateRange, setDateRange] = useState({ date_from: today, date_to: today });
  const [summary, setSummary] = useState(null);
  const [liveTables, setLiveTables] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      Promise.all([
        api.get("/dashboard/summary", { params: { date_from: dateRange.date_from, date_to: dateRange.date_to } }),
        api.get("/restaurant-tables", { params: { per_page: 20 } }),
        api.get("/orders", { params: { per_page: 8, sort_by: "created_at", sort_direction: "desc" } }),
      ]).then(([summaryResponse, tableResponse, orderResponse]) => {
        setSummary(summaryResponse.data?.data || null);
        const tableRows = tableResponse.data?.data?.data || tableResponse.data?.data || [];
        setLiveTables(tableRows.map((table) => ({
          name: table.table_number,
          guests: table.current_session?.guest_count || 0,
          status: table.status,
          amount: table.status === "available" ? "Ready" : table.section || "In service",
        })));
        const orderRows = orderResponse.data?.data?.data || orderResponse.data?.data || [];
        setLiveOrders(orderRows.map((order) => ({
          id: order.order_number || `#${order.id}`,
          customer: order.customer?.first_name || order.table?.table_number || "Walk-in",
          type: (order.order_type || "dining").replaceAll("_", " "),
          total: new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(order.bill?.grand_total || 0),
          status: order.status ? order.status[0].toUpperCase() + order.status.slice(1) : "Pending",
        })));
      }).catch(() => {
        // The designed fallback content remains visible if reporting is unavailable.
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [dateRange.date_from, dateRange.date_to]);

  const displayedStats = useMemo(() => summary ? [
    { ...stats[0], value: new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(summary.revenue), trend: `${summary.orders?.completed || 0} completed`, detail: `${summary.orders?.total || 0} total orders` },
    { ...stats[1], value: String(summary.orders?.open || 0), trend: `${summary.orders?.cancelled || 0} cancelled`, detail: "current reporting period" },
    { ...stats[2], value: String(summary.kitchen_queue || 0), trend: `${summary.tables?.occupied || 0} tables occupied`, detail: "active kitchen tickets" },
    { ...stats[3], label: "Reservations", value: String(summary.reservations_today || 0), trend: `${summary.tables?.available || 0} tables free`, detail: "today's bookings", icon: FiCalendar },
  ] : stats.map((stat) => ({ ...stat, value: "—", trend: "Loading", detail: "Waiting for live data" })), [summary]);
  const displayedTables = liveTables;
  const displayedOrders = liveOrders;
  const displayedTopItems = summary?.top_items?.length ? summary.top_items.map((item, index) => ({
    name: item.menu_item_name_snapshot || `Menu item #${item.menu_item_id}`,
    sold: Number(item.quantity),
    revenue: new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(item.revenue),
    progress: Math.max(15, 100 - index * 12),
  })) : [];
  const displayedStockAlerts = summary?.low_stock?.length ? summary.low_stock.map((level) => ({
    item: level.inventory_item?.name || `Inventory item #${level.inventory_item_id}`,
    level: `${level.quantity_on_hand} ${level.inventory_item?.unit || ""}`,
    severity: Number(level.quantity_on_hand) <= 0 ? "Critical" : "Low",
    icon: FiAlertTriangle,
  })) : [];
  const displayedChannels = summary?.orders_by_type?.map((item, index) => ({
    label: String(item.order_type || "Other").replaceAll("_", " "),
    value: summary.orders?.total ? Math.round((Number(item.total) / summary.orders.total) * 100) : 0,
    count: Number(item.total),
    color: ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500"][index % 4],
  })) || [];
  const displayedKitchenQueue = [];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
            <FiActivity className="size-4 text-emerald-500" />
            Live restaurant operations
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-white">
            Good evening, here is today&apos;s service.
          </h1>
          <p className="mt-2 max-w-3xl text-base text-slate-600 dark:text-slate-400">
            A complete overview for dining room, kitchen, delivery, inventory, staff coverage and daily performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/6">
            <FiCalendar className="size-4 text-blue-500" />
            <input type="date" value={dateRange.date_from} onChange={(event) => setDateRange((current) => ({ ...current, date_from: event.target.value }))} className="bg-transparent outline-none" aria-label="Report start date" />
            <span>to</span>
            <input type="date" value={dateRange.date_to} min={dateRange.date_from} onChange={(event) => setDateRange((current) => ({ ...current, date_to: event.target.value }))} className="bg-transparent outline-none" aria-label="Report end date" />
          </label>
          <div className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20">
            <FiCheckCircle className="size-4" />
            {summary?.current_shift ? `Shift #${summary.current_shift.id} Open` : "No Open Shift"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {displayedStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Panel key={stat.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <span className={`grid size-11 place-items-center rounded-lg ring-1 ${toneClasses[stat.tone]}`}>
                  <Icon className="size-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <FiArrowUpRight className="size-3.5" />
                  {stat.trend}
                </span>
              </div>
              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{stat.detail}</p>
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.85fr)]">
        <Panel>
          <SectionHeader icon={FiDollarSign} title="Revenue Flow" action="View report" />
          <div className="px-5 py-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Peak service window</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">6:00 PM - 8:00 PM</p>
              </div>
              <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-white/8 dark:text-slate-300">
                Forecast close: <span className="font-semibold text-slate-950 dark:text-white">$24.8k</span>
              </div>
            </div>
            <div className="flex h-48 items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 pb-3 pt-5 dark:border-white/10 dark:bg-black/12">
              {salesTrend.map((point) => (
                <div key={point.time} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 shadow-sm shadow-blue-500/20 dark:from-blue-500 dark:to-cyan-300"
                    style={{ height: `${point.value}%` }}
                  />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{point.time}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <SectionHeader icon={FiGrid} title="Dining Room" action="Floor map" />
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4 xl:grid-cols-2">
            {displayedTables.map((table) => (
              <div key={table.name} className={`rounded-lg border p-3 ${tableStatusClasses[table.status]}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold">{table.name}</span>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-current dark:bg-white/10">
                    {table.status}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <FiUsers className="size-4" />
                    {table.guests}
                  </span>
                  <span className="text-sm font-semibold">{table.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <SectionHeader icon={FiCoffee} title="Kitchen Queue" action="Open KDS" />
          <div className="divide-y divide-slate-200/80 dark:divide-white/10">
            {displayedKitchenQueue.map((item) => (
              <div key={item.order} className="grid gap-3 px-5 py-4 sm:grid-cols-[90px_minmax(0,1fr)_120px_90px] sm:items-center">
                <span className="font-semibold text-slate-950 dark:text-white">{item.order}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.item}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{item.station}</p>
                </div>
                <StatusPill>{item.status}</StatusPill>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.eta}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader icon={FiTruck} title="Order Channels" />
          <div className="space-y-5 p-5">
            {displayedChannels.map((channel) => (
              <div key={channel.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{channel.label}</span>
                  <span className="font-medium text-slate-500 dark:text-slate-400">{channel.count} orders</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-white/8">
                  <div className={`h-full rounded-full ${channel.color}`} style={{ width: `${channel.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(340px,0.8fr)]">
        <Panel>
          <SectionHeader icon={FiShoppingBag} title="Top Menu Items" />
          <div className="space-y-5 p-5">
            {displayedTopItems.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{item.sold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.revenue}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-white/8">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader icon={FiUsers} title="Staff Coverage" />
          <div className="space-y-4 p-5">
            {team.map((group) => (
              <div
                key={group.name}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{group.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{group.people} on shift</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[group.tone]}`}>
                    {group.coverage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader icon={FiAlertTriangle} title="Stock Alerts" action="Inventory" />
          <div className="space-y-3 p-5">
              {displayedStockAlerts.map((alert) => {
              const Icon = alert.icon;

              return (
                <div
                  key={alert.item}
                  className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/70 text-amber-600 dark:bg-white/10 dark:text-amber-300">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{alert.item}</p>
                    <p className="text-xs font-medium opacity-75">{alert.level}</p>
                  </div>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold dark:bg-white/10">
                    {alert.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionHeader icon={FiClock} title="Recent Orders" action="All orders" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-white/10">
              {displayedOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="px-5 py-4 font-semibold text-slate-950 dark:text-white">{order.id}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{order.customer}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{order.type}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">{order.total}</td>
                  <td className="px-5 py-4">
                    <StatusPill>{order.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
