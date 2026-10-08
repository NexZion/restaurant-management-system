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

const stats = [
  {
    label: "Today Revenue",
    value: "$18,420",
    trend: "+12.4%",
    detail: "from 286 completed orders",
    icon: FiDollarSign,
    tone: "blue",
  },
  {
    label: "Open Orders",
    value: "42",
    trend: "18 active",
    detail: "dine-in, delivery and pickup",
    icon: FiShoppingBag,
    tone: "emerald",
  },
  {
    label: "Kitchen Queue",
    value: "16",
    trend: "7 urgent",
    detail: "average prep time 14 min",
    icon: FiClock,
    tone: "amber",
  },
  {
    label: "Guest Rating",
    value: "4.8",
    trend: "+0.3",
    detail: "based on today's feedback",
    icon: FiStar,
    tone: "violet",
  },
];

const salesTrend = [
  { time: "10a", value: 32 },
  { time: "11a", value: 46 },
  { time: "12p", value: 78 },
  { time: "1p", value: 88 },
  { time: "2p", value: 64 },
  { time: "3p", value: 42 },
  { time: "4p", value: 52 },
  { time: "5p", value: 70 },
  { time: "6p", value: 96 },
  { time: "7p", value: 84 },
];

const tables = [
  { name: "T01", guests: 4, status: "occupied", amount: "$86" },
  { name: "T02", guests: 2, status: "reserved", amount: "7:30" },
  { name: "T03", guests: 0, status: "available", amount: "Ready" },
  { name: "T04", guests: 6, status: "occupied", amount: "$142" },
  { name: "T05", guests: 0, status: "cleaning", amount: "4 min" },
  { name: "T06", guests: 3, status: "occupied", amount: "$64" },
  { name: "T07", guests: 0, status: "available", amount: "Ready" },
  { name: "T08", guests: 5, status: "reserved", amount: "8:00" },
];

const kitchenQueue = [
  { order: "#1048", item: "Smoked brisket platter", station: "Grill", eta: "6 min", status: "Plating" },
  { order: "#1049", item: "Truffle mushroom pasta", station: "Saute", eta: "9 min", status: "Cooking" },
  { order: "#1050", item: "Crispy chicken bao", station: "Hot line", eta: "12 min", status: "Queued" },
  { order: "#1051", item: "Mango panna cotta", station: "Dessert", eta: "3 min", status: "Ready" },
];

const channels = [
  { label: "Dine-in", value: 58, count: 164, color: "bg-blue-500 dark:bg-[#828FFF]" },
  { label: "Delivery", value: 28, count: 79, color: "bg-emerald-500" },
  { label: "Pickup", value: 14, count: 39, color: "bg-amber-500" },
];

const topItems = [
  { name: "Signature ramen bowl", sold: 82, revenue: "$2,870", progress: 92 },
  { name: "Charcoal chicken biryani", sold: 64, revenue: "$2,240", progress: 78 },
  { name: "Classic beef burger", sold: 58, revenue: "$1,740", progress: 70 },
  { name: "Iced passion mojito", sold: 51, revenue: "$612", progress: 62 },
];

const stockAlerts = [
  { item: "Avocado", level: "12 portions", severity: "Low", icon: FiAlertTriangle },
  { item: "Ribeye steak", level: "8 cuts", severity: "Critical", icon: FiAlertTriangle },
  { item: "Sparkling water", level: "18 bottles", severity: "Low", icon: FiAlertTriangle },
];

const team = [
  { name: "Front of house", people: 8, coverage: "92%", tone: "emerald" },
  { name: "Kitchen crew", people: 11, coverage: "88%", tone: "blue" },
  { name: "Delivery riders", people: 5, coverage: "76%", tone: "amber" },
];

const recentOrders = [
  { id: "#1052", customer: "Table 04", type: "Dine-in", total: "$142.00", status: "Serving" },
  { id: "#1051", customer: "Nadia Perera", type: "Pickup", total: "$38.50", status: "Ready" },
  { id: "#1050", customer: "Uber Eats", type: "Delivery", total: "$67.20", status: "Cooking" },
  { id: "#1049", customer: "Table 01", type: "Dine-in", total: "$86.40", status: "Paid" },
];

const toneClasses = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-[#121314] dark:text-[#D0D6E0] dark:ring-white/5",
  emerald:
    "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  amber:
    "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  violet:
    "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
};

const tableStatusClasses = {
  occupied:
    "border-blue-200 bg-blue-50/80 text-blue-800 dark:border-white/5 dark:bg-[#121314] dark:text-[#D0D6E0]",
  available:
    "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  reserved:
    "border-violet-200 bg-violet-50/80 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200",
  cleaning:
    "border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
};

const statusPillClasses = {
  Serving: "bg-blue-50 text-blue-700 dark:bg-[#121314] dark:text-[#D0D6E0]",
  Ready: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  Cooking: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  Paid: "bg-slate-100 text-slate-700 dark:bg-[#161719] dark:text-[#D0D6E0]",
  Plating: "bg-blue-50 text-blue-700 dark:bg-[#121314] dark:text-[#D0D6E0]",
  Queued: "bg-slate-100 text-slate-700 dark:bg-[#161719] dark:text-[#D0D6E0]",
};

const Panel = ({ children, className = "" }) => (
  <section
    className={`rounded-lg border border-slate-200/80 bg-white/90 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.55)] backdrop-blur-sm dark:border-white/5 dark:bg-[#121314] ${className}`}
  >
    {children}
  </section>
);

const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between gap-2.5 border-b border-slate-200/80 px-4.5 py-3.5 dark:border-white/5">
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-[#161719] dark:text-[#D0D6E0] dark:ring-white/5">
        <Icon className="size-4" />
      </span>
      <h2 className="truncate text-base font-semibold text-slate-950 dark:text-[#F7F8F8]">{title}</h2>
    </div>
    {action ? (
      <button className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-[#D0D6E0] dark:hover:bg-[#1A1C20] dark:hover:text-white">
        {action}
        <FiChevronRight className="size-4" />
      </button>
    ) : null}
  </div>
);

const StatusPill = ({ children }) => (
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
      statusPillClasses[children] || "bg-slate-100 text-slate-700 dark:bg-[#161719] dark:text-[#D0D6E0]"
    }`}
  >
    {children}
  </span>
);

export const Dashboard = () => {
  return (
    <div className="space-y-5 text-slate-900 dark:text-[#D0D6E0]">
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-600 shadow-sm dark:border-white/5 dark:bg-[#121314] dark:text-[#D0D6E0]">
            <FiActivity className="size-4 text-emerald-500" />
            Live restaurant operations
          </div>
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 dark:text-[#F7F8F8]">
            Good evening, here is today&apos;s service.
          </h1>
          <p className="mt-2 max-w-3xl text-base text-slate-600 dark:text-[#8A8F98]">
            A complete overview for dining room, kitchen, delivery, inventory, staff coverage and daily performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 dark:border-white/5 dark:bg-[#121314] dark:text-[#D0D6E0] dark:hover:border-white/20 dark:hover:bg-[#1A1C20] dark:hover:text-white">
            <FiCalendar className="size-4" />
            Today
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 dark:bg-[#161719] dark:text-[#D0D6E0] dark:hover:bg-[#1A1C20]">
            <FiCheckCircle className="size-4" />
            Close Shift
          </button>
        </div>
      </div>

      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Panel key={stat.label} className="p-4.5">
              <div className="flex items-start justify-between gap-3.5">
                <span className={`grid size-11 place-items-center rounded-lg ring-1 ${toneClasses[stat.tone]}`}>
                  <Icon className="size-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <FiArrowUpRight className="size-3.5" />
                  {stat.trend}
                </span>
              </div>
              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500 dark:text-[#8A8F98]">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-[#F7F8F8]">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-[#8A8F98]">{stat.detail}</p>
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.85fr)]">
        <Panel>
          <SectionHeader icon={FiDollarSign} title="Revenue Flow" action="View report" />
          <div className="px-4.5 py-4.5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-[#8A8F98]">Peak service window</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-[#F7F8F8]">6:00 PM - 8:00 PM</p>
              </div>
              <div className="rounded-lg bg-slate-100 px-2.5 py-2 text-sm text-slate-600 dark:bg-[#161719] dark:text-[#D0D6E0]">
                Forecast close: <span className="font-semibold text-slate-950 dark:text-[#F7F8F8]">$24.8k</span>
              </div>
            </div>
            <div className="flex h-48 items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 pb-3 pt-5 dark:border-white/5 dark:bg-black/12">
              {salesTrend.map((point) => (
                <div key={point.time} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 shadow-sm shadow-blue-500/20 dark:from-white dark:to-slate-400 dark:shadow-white/10"
                    style={{ height: `${point.value}%` }}
                  />
                  <span className="text-xs font-medium text-slate-500 dark:text-[#8A8F98]">{point.time}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <SectionHeader icon={FiGrid} title="Dining Room" action="Floor map" />
          <div className="grid grid-cols-2 gap-2.5 p-4.5 sm:grid-cols-4 xl:grid-cols-2">
            {tables.map((table) => (
              <div key={table.name} className={`rounded-lg border p-2.5 ${tableStatusClasses[table.status]}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold">{table.name}</span>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-current dark:bg-[#161719]">
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

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <SectionHeader icon={FiCoffee} title="Kitchen Queue" action="Open KDS" />
          <div className="divide-y divide-slate-200/80 dark:divide-white/10">
            {kitchenQueue.map((item) => (
              <div key={item.order} className="grid gap-2.5 px-4.5 py-3.5 sm:grid-cols-[90px_minmax(0,1fr)_120px_90px] sm:items-center">
                <span className="font-semibold text-slate-950 dark:text-[#F7F8F8]">{item.order}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-[#D0D6E0]">{item.item}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-[#8A8F98]">{item.station}</p>
                </div>
                <StatusPill>{item.status}</StatusPill>
                <span className="text-sm font-semibold text-slate-600 dark:text-[#D0D6E0]">{item.eta}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader icon={FiTruck} title="Order Channels" />
          <div className="space-y-4.5 p-4.5">
            {channels.map((channel) => (
              <div key={channel.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800 dark:text-[#D0D6E0]">{channel.label}</span>
                  <span className="font-medium text-slate-500 dark:text-[#8A8F98]">{channel.count} orders</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-[#161719]">
                  <div className={`h-full rounded-full ${channel.color}`} style={{ width: `${channel.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(340px,0.8fr)]">
        <Panel>
          <SectionHeader icon={FiShoppingBag} title="Top Menu Items" />
          <div className="space-y-4.5 p-4.5">
            {topItems.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-[#D0D6E0]">{item.name}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-[#8A8F98]">{item.sold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-[#D0D6E0]">{item.revenue}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-[#161719]">
                  <div className="h-full rounded-full bg-blue-500 dark:bg-[#828FFF]" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader icon={FiUsers} title="Staff Coverage" />
          <div className="space-y-3.5 p-4.5">
            {team.map((group) => (
              <div
                key={group.name}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-white/5 dark:bg-[#121314]"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-[#F7F8F8]">{group.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#8A8F98]">{group.people} on shift</p>
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
          <div className="space-y-2.5 p-4.5">
            {stockAlerts.map((alert) => {
              const Icon = alert.icon;

              return (
                <div
                  key={alert.item}
                  className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/70 text-amber-600 dark:bg-[#161719] dark:text-amber-300">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{alert.item}</p>
                    <p className="text-xs font-medium opacity-75">{alert.level}</p>
                  </div>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold dark:bg-[#161719]">
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
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-normal text-slate-500 dark:bg-[#121314] dark:text-[#8A8F98]">
              <tr>
                <th className="px-4.5 py-2">Order</th>
                <th className="px-4.5 py-2">Customer</th>
                <th className="px-4.5 py-2">Type</th>
                <th className="px-4.5 py-2">Total</th>
                <th className="px-4.5 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-white/10">
              {recentOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50 dark:hover:bg-[#1A1C20]">
                  <td className="px-4.5 py-2.5 font-semibold text-slate-950 dark:text-[#F7F8F8]">{order.id}</td>
                  <td className="px-4.5 py-2.5 text-slate-600 dark:text-[#D0D6E0]">{order.customer}</td>
                  <td className="px-4.5 py-2.5 text-slate-600 dark:text-[#D0D6E0]">{order.type}</td>
                  <td className="px-4.5 py-2.5 font-semibold text-slate-800 dark:text-[#D0D6E0]">{order.total}</td>
                  <td className="px-4.5 py-2.5">
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
