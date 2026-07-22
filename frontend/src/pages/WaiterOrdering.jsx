import { use, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  Button,
  NumberField,
  SelectField,
  TextField,
  ToggleSwitch,
} from "../components/DataFields";
import { MenuItemCardList } from "../components/MenuItemCardList";
import { Dialog, Drawer } from "../components/Popups";
import { Table } from "../components/Tables";
import { useTheme } from "../context/ThemeContext";
import axiosClient from "../axiosClient";

export const POSNewOrder = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get("/menu-items");

      setMenuItems(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];
  const orderTypes = [
    { value: "dine_in", label: "Dine in" },
    { value: "takeaway", label: "Takeaway" },
    { value: "delivery", label: "Delivery" },
  ];
  const customerOptions = [
    { value: "walk_in", label: "Walk-in customer" },
    { value: "1", label: "Jack Smith — 077 123 4567" },
    { value: "2", label: "Nimali Perera — 071 456 7890" },
    { value: "3", label: "Ahmed Khan — 076 987 6543" },
  ];

  const money = (value) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);

  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("walk_in");
  const [orderType, setOrderType] = useState("dine_in");
  const [cart, setCart] = useState([]);
  const [placedOrders, setPlacedOrders] = useState([]);
  const [showOrdersDrawer, setShowOrdersDrawer] = useState(false);
  const [orderToServe, setOrderToServe] = useState(null);

  const filteredItems = useMemo(
    () =>
      menuItems.filter((item) => {
        const matchesCategory =
          category === "All" || item.category === category;

        const term = search.trim().toLowerCase();

        const matchesSearch =
          !term ||
          item.name.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term);

        return matchesCategory && matchesSearch;
      }),
    [menuItems, category, search],
  );

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === item.id);
      return existing
        ? current.map((line) =>
            line.id === item.id
              ? { ...line, quantity: line.quantity + 1 }
              : line,
          )
        : [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity) || 1);
    setCart((current) =>
      current.map((line) =>
        line.id === id ? { ...line, quantity: nextQuantity } : line,
      ),
    );
  };

  const removeFromCart = (id) =>
    setCart((current) => current.filter((line) => line.id !== id));

  const selectedCustomer =
    customerOptions.find((customer) => customer.value === customerId)?.label ||
    "Walk-in customer";
  const selectedOrderType =
    orderTypes.find((type) => type.value === orderType)?.label || "Dine in";

  const placeOrder = () => {
    if (!cart.length) return;

    const order = {
      id: Date.now(),
      orderNo: `ORD-${String(placedOrders.length + 1).padStart(3, "0")}`,
      time: new Intl.DateTimeFormat("en-LK", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
      customer: selectedCustomer,
      type: selectedOrderType,
      items: cart.map((line) => `${line.name} x${line.quantity}`).join(", "),
      itemCount: cart.reduce((sum, line) => sum + line.quantity, 0),
      served: false,
    };

    setPlacedOrders((current) => [order, ...current]);
    setCart([]);

    axiosClient.post("/orders", order);
  };
  const confirmMarkServed = (order) => {
    if (order.served) return;
    setOrderToServe(order);
  };

  const markOrderAsServed = () => {
    if (!orderToServe) return;

    setPlacedOrders((current) =>
      current.map((order) =>
        order.id === orderToServe.id ? { ...order, served: true } : order,
      ),
    );
    setOrderToServe(null);
  };

  const placedOrderRows = useMemo(
    () =>
      placedOrders.map((order) => ({
        ...order,
        status: (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              order.served
                ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
            }`}
          >
            {order.served ? "Served" : "Placed"}
          </span>
        ),
      })),
    [placedOrders],
  );

  return (
    <main className="min-h-screen bg-gray-100 p-3 text-gray-900 dark:bg-[#09090B] dark:text-white lg:p-5">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#18181B]">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-6">
            <img
              src={logo}
              alt="Restaurant"
              className="h-9 w-auto max-w-36 object-contain invert dark:invert-0"
            />
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowOrdersDrawer(true)}
              className="whitespace-nowrap"
            >
              Orders ({placedOrders.length})
            </Button>
            <SelectField
              value={orderType}
              options={orderTypes}
              onChange={(event) => setOrderType(event.target.value)}
            />
            <ToggleSwitch
              checked={isDarkMode}
              onChange={toggleTheme}
              size="small"
            />
          </div>
        </header>

        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_450px]">
          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#18181B]">
            <div className="mb-4">
              <TextField
                placeholder="Search by menu item or code"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
              />
            </div>

            <div className="mb-5 flex gap-3 overflow-x-auto pb-2">
              {categories.map((itemCategory) => (
                <Button
                  key={itemCategory}
                  variant={category === itemCategory ? "primary" : "outlined"}
                  size="medium"
                  width="auto"
                  height={50}
                  onClick={() => setCategory(itemCategory)}
                  className="shrink-0 whitespace-nowrap px-6 text-base font-semibold"
                >
                  {itemCategory}
                </Button>
              ))}
            </div>

            <MenuItemCardList
              items={filteredItems}
              columns={4}
              variant="default"
              gap="normal"
              itemsPerPage={4}
              pagination={false}
              currency="LKR"
              locale="en-LK"
              show={{
                status: false,
                description: false,
                code: false,
                actions: false,
              }}
              addToCartLabel="Add"
              cartButtonHeight={34}
              onAddToCart={addToCart}
              onCardClick={(item) =>
                item.available !== false && addToCart(item)
              }
              loading={loading}
            />
          </section>

          <aside className="flex min-h-[calc(100vh-8.5rem)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#18181B] xl:h-[calc(100vh-8.5rem)] xl:min-h-0">
            <h1 className="mb-4 text-2xl font-bold">Current Order</h1>

            <div className="mb-4 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <SelectField
                  label="Customer"
                  value={customerId}
                  options={customerOptions}
                  onChange={(event) => setCustomerId(event.target.value)}
                  searchable
                  fullWidth
                />
              </div>
              <Button
                variant="primary"
                size="icon"
                width={42}
                height={42}
                aria-label="Add customer"
                title="Add customer"
                onClick={() => console.log("Add customer")}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              </Button>
            </div>

            <div className="min-h-48 max-h-96 flex-1 overflow-y-auto overscroll-contain border-y border-gray-200 pr-1 dark:border-gray-700 xl:min-h-0 xl:max-h-none">
              {cart.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-medium">Your order is empty</p>
                  <p className="mt-1 text-xs">
                    Select a menu item to add it here.
                  </p>
                </div>
              ) : (
                cart.map((line) => (
                  <div
                    key={line.id}
                    className="grid grid-cols-[minmax(0,1fr)_70px_auto] items-center gap-2 border-b border-gray-100 py-3 last:border-0 dark:border-gray-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">
                        {line.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {money(line.price)} each
                      </p>
                    </div>
                    <NumberField
                      value={line.quantity}
                      min={1}
                      onChange={(event) =>
                        updateQuantity(line.id, event.target.value)
                      }
                    />
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        width={30}
                        height={30}
                        aria-label={`Remove ${line.name}`}
                        onClick={() => removeFromCart(line.id)}
                      >
                        <svg
                          className="h-4 w-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => setCart([])}
                disabled={!cart.length}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!cart.length}
                onClick={placeOrder}
              >
                Place Order
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <Drawer
        isOpen={showOrdersDrawer}
        onClose={() => setShowOrdersDrawer(false)}
        title="Orders placed now"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
            These are the orders placed during this cashier session. Mark an
            order as served after confirmation.
          </div>

          <Table
            columns={[
              { key: "orderNo", label: "Order No", sortable: true },
              { key: "time", label: "Time", sortable: true },
              { key: "customer", label: "Customer", sortable: true },
              { key: "type", label: "Type", sortable: true },
              { key: "itemCount", label: "Items", sortable: true },
              { key: "status", label: "Status" },
            ]}
            data={placedOrderRows}
            searchable
            pagination
            defaultRowsPerPage={8}
            rowsPerPageOptions={[8, 15, 25]}
            emptyMessage="No orders placed yet"
            actions={(row) => [
              {
                label: row.served ? "Served" : "Mark as served",
                icon: row.served ? (
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                onClick: () => confirmMarkServed(row),
              },
            ]}
            renderExpandedRow={(row) => (
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-[#212125] dark:text-gray-200">
                {row.items}
              </div>
            )}
            expandable
          />
        </div>
      </Drawer>

      <Dialog
        isOpen={Boolean(orderToServe)}
        onClose={() => setOrderToServe(null)}
        title="Mark order as served?"
        size="small"
        primaryButtonText="Mark Served"
        secondaryButtonText="Cancel"
        onPrimaryButtonClick={markOrderAsServed}
        onSecondaryButtonClick={() => setOrderToServe(null)}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to mark this order as served?
          </p>
          {orderToServe && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-[#212125]">
              <p className="font-semibold text-gray-900 dark:text-white">
                {orderToServe.orderNo}
              </p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                {orderToServe.customer}
              </p>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {orderToServe.items}
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </main>
  );
};
