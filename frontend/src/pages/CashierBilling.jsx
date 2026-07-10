import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { Button, NumberField, SelectField, TextField, ToggleSwitch } from '../components/DataFields'
import { Dialog } from '../components/Popups'
import { useTheme } from '../context/ThemeContext'

const servedOrders = [
  {
    id: 1,
    orderNo: 'ORD-001',
    customer: 'Jack Smith',
    type: 'Dine in',
    servedAt: '10:35 AM',
    items: [
      { name: 'Classic Beef Burger', quantity: 2, price: 1450 },
      { name: 'Lemonade', quantity: 2, price: 550 },
    ],
  },
  {
    id: 2,
    orderNo: 'ORD-002',
    customer: 'Walk-in customer',
    type: 'Takeaway',
    servedAt: '10:42 AM',
    items: [
      { name: 'Chicken Fried Rice', quantity: 1, price: 1100 },
      { name: 'Iced Coffee', quantity: 1, price: 650 },
    ],
  },
  {
    id: 3,
    orderNo: 'ORD-003',
    customer: 'Nimali Perera',
    type: 'Dine in',
    servedAt: '10:50 AM',
    items: [
      { name: 'Pepperoni Pizza', quantity: 1, price: 2200 },
      { name: 'Mango Smoothie', quantity: 2, price: 750 },
    ],
  },
  {
    id: 4,
    orderNo: 'ORD-004',
    customer: 'Ahmed Khan',
    type: 'Delivery',
    servedAt: '11:05 AM',
    items: [
      { name: 'Margherita Pizza', quantity: 2, price: 1800 },
      { name: 'Chocolate Lava Cake', quantity: 1, price: 850 },
    ],
  },
  {
    id: 5,
    orderNo: 'ORD-005',
    customer: 'Walk-in customer',
    type: 'Dine in',
    servedAt: '11:12 AM',
    items: [
      { name: 'Seafood Fried Rice', quantity: 3, price: 1550 },
    ],
  },
  {
    id: 6,
    orderNo: 'ORD-006',
    customer: 'Jack Smith',
    type: 'Takeaway',
    servedAt: '11:18 AM',
    items: [
      { name: 'Chicken Burger', quantity: 2, price: 1250 },
      { name: 'Lemonade', quantity: 1, price: 550 },
    ],
  },
]

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
]

const DEFAULT_DISCOUNT_PERCENT = 5
const DEFAULT_TAX_PERCENT = 10
const DEFAULT_SERVICE_CHARGE_PERCENT = 8

const money = (value) => new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
}).format(value)

const getOrderSubtotal = (order) => order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

const getBillDetails = (order, settings = {}) => {
  const discountRate = (Number(settings.discountPercent) || 0) / 100
  const taxRate = (Number(settings.taxPercent) || 0) / 100
  const serviceChargeRate = (Number(settings.serviceChargePercent) || 0) / 100
  const subtotal = getOrderSubtotal(order)
  const discount = subtotal * discountRate
  const taxableAmount = subtotal - discount
  const tax = taxableAmount * taxRate
  const serviceCharge = taxableAmount * serviceChargeRate

  return {
    subtotal,
    discount,
    tax,
    serviceCharge,
    total: taxableAmount + tax + serviceCharge,
  }
}

export const CashierBilling = () => {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()
  const [search, setSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(servedOrders[0]?.id ?? null)
  const [billedOrderIds, setBilledOrderIds] = useState([])
  const [billOrder, setBillOrder] = useState(null)
  const [billSettings, setBillSettings] = useState({
    discountPercent: DEFAULT_DISCOUNT_PERCENT,
    taxPercent: DEFAULT_TAX_PERCENT,
    serviceChargePercent: DEFAULT_SERVICE_CHARGE_PERCENT,
  })

  const payableOrders = useMemo(() => servedOrders.filter((order) => !billedOrderIds.includes(order.id)), [billedOrderIds])

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return payableOrders

    return payableOrders.filter((order) => (
      order.orderNo.toLowerCase().includes(term) ||
      order.customer.toLowerCase().includes(term) ||
      order.type.toLowerCase().includes(term)
    ))
  }, [payableOrders, search])

  const selectedOrder = payableOrders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0] ?? null
  const selectedBill = selectedOrder ? getBillDetails(selectedOrder, billSettings) : null
  const selectedTotal = selectedBill?.total ?? 0
  const receivedValue = Number(amountReceived) || 0
  const balance = receivedValue - selectedTotal
  const canCreateBill = Boolean(selectedOrder) && (paymentMethod !== 'cash' || receivedValue >= selectedTotal)

  const updateBillSetting = (key, value) => {
    setBillSettings((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }))
  }

  const openBillConfirmation = () => {
    if (!canCreateBill) return
    setBillOrder(selectedOrder)
  }

  const createBill = () => {
    if (!billOrder) return

    setBilledOrderIds((current) => [...current, billOrder.id])
    setSelectedOrderId((currentId) => (currentId === billOrder.id ? null : currentId))
    setAmountReceived('')
    setBillOrder(null)
  }

  const printBill = () => {
    window.print()
  }

  return (
    <main className="min-h-screen bg-gray-100 p-3 text-gray-900 dark:bg-[#09090B] dark:text-white lg:p-5">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#18181B]">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-6">
            <img src={logo} alt="Restaurant" className="h-9 w-auto max-w-36 object-contain invert dark:invert-0" />
            <Button variant="ghost" size="small" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button variant="ghost" size="small" onClick={() => navigate('/pos/new-order')}>New Order</Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
              Served bills: {payableOrders.length}
            </span>
            <ToggleSwitch checked={isDarkMode} onChange={toggleTheme} size="small" />
          </div>
        </header>

        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_440px]">
          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#18181B]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">Served Orders</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select an order to print the bill, then collect payment.</p>
              </div>
              <div className="w-full sm:w-80">
                <TextField
                  placeholder="Search order or customer"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                />
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-center dark:border-gray-700">
                <p className="text-lg font-semibold">No served bills found</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Served orders ready for payment will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredOrders.map((order) => {
                  const total = getBillDetails(order, billSettings).total
                  const isSelected = selectedOrder?.id === order.id

                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`group rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:bg-[#212125] ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Order Number</p>
                          <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{order.orderNo}</h2>
                        </div>
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                          Served
                        </span>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Customer</p>
                          <p className="mt-1 truncate text-base font-semibold">{order.customer}</p>
                        </div>
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Bill Amount</p>
                            <p className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-300">{money(total)}</p>
                          </div>
                          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                            <p>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                            <p>{order.type}</p>
                            <p>{order.servedAt}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <aside className="flex min-h-[calc(100vh-8.5rem)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#18181B] xl:h-[calc(100vh-8.5rem)] xl:min-h-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Bill Preview</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Print this bill before taking payment.</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                Before Payment
              </span>
            </div>

            {selectedOrder ? (
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#212125]">
                  <div className="border-b border-dashed border-gray-300 pb-4 text-center dark:border-gray-600">
                    <img src={logo} alt="Restaurant" className="mx-auto h-10 w-auto max-w-36 object-contain invert dark:invert-0" />
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Pre-payment bill</p>
                    <h3 className="mt-1 text-2xl font-black">{selectedOrder.orderNo}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-b border-dashed border-gray-300 py-4 text-sm dark:border-gray-600">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Customer</p>
                      <p className="mt-1 font-semibold">{selectedOrder.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Order Type</p>
                      <p className="mt-1 font-semibold">{selectedOrder.type}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Served Time</p>
                      <p className="mt-1 font-semibold">{selectedOrder.servedAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</p>
                      <p className="mt-1 font-semibold text-green-600 dark:text-green-300">Served</p>
                    </div>
                  </div>

                  <div className="py-4">
                    <div className="mb-2 grid grid-cols-[minmax(0,1fr)_42px_78px] gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <span>Item</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right">Amount</span>
                    </div>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_42px_78px] items-start gap-2 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{money(item.price)} each</p>
                          </div>
                          <p className="text-center font-semibold">{item.quantity}</p>
                          <p className="text-right font-semibold">{money(item.quantity * item.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedBill && (
                    <div className="border-t border-dashed border-gray-300 pt-4 dark:border-gray-600">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Subtotal</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{money(selectedBill.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Discount ({billSettings.discountPercent}%)</span>
                          <span className="font-semibold text-red-500">- {money(selectedBill.discount)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Tax ({billSettings.taxPercent}%)</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{money(selectedBill.tax)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Service Charge ({billSettings.serviceChargePercent}%)</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{money(selectedBill.serviceCharge)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                          <div className="flex justify-between text-lg font-black">
                            <span>Amount Due</span>
                            <span className="text-blue-600 dark:text-blue-300">{money(selectedBill.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 rounded-lg bg-blue-50 p-3 text-center text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                    This bill is issued before payment. Print it first, then complete payment below.
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <p className="mb-3 text-sm font-bold">Bill Adjustments</p>
                  <div className="grid grid-cols-3 gap-2">
                    <NumberField
                      label="Discount %"
                      value={billSettings.discountPercent}
                      min={0}
                      decimals={2}
                      onChange={(event) => updateBillSetting('discountPercent', event.target.value)}
                    />
                    <NumberField
                      label="Tax %"
                      value={billSettings.taxPercent}
                      min={0}
                      decimals={2}
                      onChange={(event) => updateBillSetting('taxPercent', event.target.value)}
                    />
                    <NumberField
                      label="Service %"
                      value={billSettings.serviceChargePercent}
                      min={0}
                      decimals={2}
                      onChange={(event) => updateBillSetting('serviceChargePercent', event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-sm font-bold">Payment After Bill</p>
                  <SelectField
                    label="Payment Method"
                    value={paymentMethod}
                    options={paymentMethods}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    fullWidth
                  />
                  <NumberField
                    label="Amount Received"
                    value={amountReceived}
                    min={0}
                    decimals={2}
                    onChange={(event) => setAmountReceived(event.target.value)}
                    disabled={paymentMethod !== 'cash'}
                    fullWidth
                  />
                  <div className="flex justify-between rounded bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:bg-[#212125] dark:text-gray-400">
                    <span>Balance</span>
                    <span className={`font-semibold ${balance < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-300'}`}>
                      {money(paymentMethod === 'cash' ? balance : 0)}
                    </span>
                  </div>
                </div>

                <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-2 bg-white pt-3 dark:bg-[#18181B]">
                  <Button
                    variant="outlined"
                    onClick={printBill}
                    disabled={!selectedOrder}
                  >
                    Print Bill
                  </Button>
                  <Button
                    variant="primary"
                    onClick={openBillConfirmation}
                    disabled={!canCreateBill}
                  >
                    Done Payment
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                <p className="font-medium">Select a served order</p>
                <p className="mt-1 text-sm">The bill preview will appear here.</p>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Dialog
        isOpen={Boolean(billOrder)}
        onClose={() => setBillOrder(null)}
        title="Done payment?"
        size="small"
        primaryButtonText="Done Payment"
        secondaryButtonText="Cancel"
        onPrimaryButtonClick={createBill}
        onSecondaryButtonClick={() => setBillOrder(null)}
      >
        {billOrder && (
          <div className="space-y-3 text-sm">
            <p className="text-gray-600 dark:text-gray-300">Confirm payment and create the bill for this served order.</p>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-[#212125]">
              <p className="font-semibold text-gray-900 dark:text-white">{billOrder.orderNo}</p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">{billOrder.customer}</p>
              <p className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-300">{money(getBillDetails(billOrder, billSettings).total)}</p>
            </div>
          </div>
        )}
      </Dialog>
    </main>
  )
}
