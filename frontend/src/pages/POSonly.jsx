import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { Button, NumberField, SelectField, TextField, ToggleSwitch } from '../components/DataFields'
import { MenuItemCardList } from '../components/MenuItemCardList'
import { useTheme } from '../context/ThemeContext'
 
const menuItems = [
  { id: 1, code: 'M-001', name: 'Classic Beef Burger', category: 'Burgers', description: 'Beef, cheddar and house sauce', price: 1450, available: true },
  { id: 2, code: 'M-002', name: 'Chicken Burger', category: 'Burgers', description: 'Crispy chicken and fresh slaw', price: 1250, available: true },
  { id: 3, code: 'M-011', name: 'Margherita Pizza', category: 'Pizza', description: 'Mozzarella, tomato and basil', price: 1800, available: true },
  { id: 4, code: 'M-012', name: 'Pepperoni Pizza', category: 'Pizza', description: 'Pepperoni and mozzarella', price: 2200, available: true },
  { id: 5, code: 'M-021', name: 'Chicken Fried Rice', category: 'Rice', description: 'Wok-fried rice with chicken', price: 1100, available: true },
  { id: 6, code: 'M-022', name: 'Seafood Fried Rice', category: 'Rice', description: 'Prawns, cuttlefish and vegetables', price: 1550, available: true },
  { id: 7, code: 'M-031', name: 'Chocolate Lava Cake', category: 'Desserts', description: 'Warm chocolate centre', price: 850, available: true },
  { id: 8, code: 'M-041', name: 'Iced Coffee', category: 'Beverages', description: 'Cold brewed coffee with milk', price: 650, available: false },
]

const categories = ['All', ...new Set(menuItems.map((item) => item.category))]
const orderTypes = [
  { value: 'dine_in', label: 'Dine in' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
]
const customerOptions = [
  { value: 'walk_in', label: 'Walk-in customer' },
  { value: '1', label: 'Jack Smith — 077 123 4567' },
  { value: '2', label: 'Nimali Perera — 071 456 7890' },
  { value: '3', label: 'Ahmed Khan — 076 987 6543' },
]

const money = (value) => new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 2,
}).format(value)

export const POSNewOrder = () => {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [customerId, setCustomerId] = useState('walk_in')
  const [orderType, setOrderType] = useState('dine_in')
  const [cart, setCart] = useState([])
  const [coupon, setCoupon] = useState('')

  const filteredItems = useMemo(() => menuItems.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category
    const term = search.trim().toLowerCase()
    const matchesSearch = !term || item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term)
    return matchesCategory && matchesSearch
  }), [category, search])

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === item.id)
      return existing
        ? current.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity) || 1)
    setCart((current) => current.map((line) => line.id === id ? { ...line, quantity: nextQuantity } : line))
  }

  const removeFromCart = (id) => setCart((current) => current.filter((line) => line.id !== id))

  const subtotal = cart.reduce((total, line) => total + line.price * line.quantity, 0)
  const discountAmount = 0
  const taxRate = 10
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100)
  const grandTotal = subtotal - discountAmount + taxAmount

  return (
    <main className="min-h-screen bg-gray-100 p-3 text-gray-900 dark:bg-[#09090B] dark:text-white lg:p-5">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#18181B]">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-6">
            <img src={logo} alt="Restaurant" className="h-9 w-auto max-w-36 object-contain invert dark:invert-0" />
            <Button variant="ghost" size="small" onClick={() => navigate('/dashboard')}>Dashboard</Button>
          </div>
          <div className="flex items-center gap-3">
            <SelectField value={orderType} options={orderTypes} onChange={(event) => setOrderType(event.target.value)} />
            <ToggleSwitch checked={isDarkMode} onChange={toggleTheme} size="small" />
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
                  variant={category === itemCategory ? 'primary' : 'outlined'}
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
              currency="LKR"
              locale="en-LK"
              show={{ status: false, description: false, code: false, actions: false }}
              addToCartLabel="Add"
              cartButtonHeight={34}
              onAddToCart={addToCart}
              onCardClick={(item) => item.available !== false && addToCart(item)}
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
              onClick={() => console.log('Add customer')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
              </svg>
            </Button>
          </div>

          <div className="min-h-48 max-h-96 flex-1 overflow-y-auto overscroll-contain border-y border-gray-200 pr-1 dark:border-gray-700 xl:min-h-0 xl:max-h-none">
            {cart.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
                <p className="font-medium">Your order is empty</p>
                <p className="mt-1 text-xs">Select a menu item to add it here.</p>
              </div>
            ) : cart.map((line) => (
              <div key={line.id} className="grid grid-cols-[minmax(0,1fr)_70px_auto] items-center gap-2 border-b border-gray-100 py-3 last:border-0 dark:border-gray-800">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{line.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{money(line.price)} each</p>
                </div>
                <NumberField
                  value={line.quantity}
                  min={1}
                  onChange={(event) => updateQuantity(line.id, event.target.value)}
                />
                <div className="flex items-center gap-1">
                  <span className="w-24 text-right text-base font-semibold">{money(line.price * line.quantity)}</span>
                  <Button variant="ghost" size="icon" width={30} height={30} aria-label={`Remove ${line.name}`} onClick={() => removeFromCart(line.id)}>
                    <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="py-4">
            <TextField label="Coupon" value={coupon} onChange={(event) => setCoupon(event.target.value)} fullWidth />
          </div>

          <div className="space-y-2 border-t border-gray-200 pt-4 text-base dark:border-gray-700">
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Discount</span><span>- {money(discountAmount)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Tax ({taxRate}%)</span><span>{money(taxAmount)}</span></div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-2xl font-bold dark:border-gray-700">
              <span>Grand total</span><span>{money(grandTotal)}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={() => setCart([])} disabled={!cart.length}>Cancel</Button>
            <Button variant="primary" disabled={!cart.length}>Place Order</Button>
            <Button variant="outlined" disabled={!cart.length}>Print Invoice</Button>
          </div>
        </aside>
      </div>
      </div>
    </main>
  )
}
