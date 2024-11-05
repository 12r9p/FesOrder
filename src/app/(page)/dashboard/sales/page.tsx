'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCw } from "lucide-react"
import { Bar, Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
} from 'chart.js/auto'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    ArcElement,
    PointElement,
    Title,
    Tooltip,
    Legend
)

interface Order {
    id: string
    orderId: string
    orderItems: string
    totalPrice: number
    peopleCount: number
    time: string
    cashier: string
    orderState: string
}

interface MenuItem {
    id: string
    menuName: string
    price: number
    imagePath: string
    toppings: string[]
    description: string
    additionalInfo: string
    soldOut: boolean
}

interface Topping {
    id: string
    toppingName: string
    price: number
    description: string
    soldOut: boolean
}

interface ToppingUsage {
    [menuItem: string]: {
        [topping: string]: number
        totalOrders: number
    }
}

export default function Component() {
    const [circleId, setCircleId] = useState<string | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [toppings, setToppings] = useState<Topping[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('daily')
    const router = useRouter()

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const storedCircleId = "09e6beabe3504beeb6b51d9efa7d3e6f";
            if (!storedCircleId) {
                router.push('/login?page=/dashboard/sales')
                return
            }
            setCircleId(storedCircleId)

            const [ordersRes, menuItemsRes, toppingsRes] = await Promise.all([
                fetch(`/api/orders/${storedCircleId}`),
                fetch(`/api/menus/${storedCircleId}`),
                fetch(`/api/toppings/${storedCircleId}`)
            ])

            const [ordersData, menuItemsData, toppingsData] = await Promise.all([
                ordersRes.json(),
                menuItemsRes.json(),
                toppingsRes.json()
            ])

            setOrders(ordersData)
            setMenuItems(menuItemsData)
            setToppings(toppingsData)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleRefresh = () => {
        fetchData()
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
    }

    const getTotalSales = () => {
        return orders.reduce((total, order) => total + order.totalPrice, 0)
    }

    const getTotalCustomers = () => {
        return orders.reduce((total, order) => total + order.peopleCount, 0)
    }

    const getAverageOrderValue = () => {
        return orders.length
    }

    const processOrdersData = (orders: Order[], range: string) => {
        const totals: { [key: string]: number } = {}
        const menuItemSales: { [key: string]: number } = {}
        const toppingUsage: ToppingUsage = {}
        const hourlyOrderCounts: { [key: string]: number } = {}
        const cashierSales: { [key: string]: number } = {}
        let totalToppings = 0

        orders.forEach(order => {
            const date = new Date(order.time)
            let key

            switch (range) {
                case 'hourly':
                    key = `${date.toISOString().split('T')[0]} ${date.getHours().toString().padStart(2, '0')}:00`
                    break
                case 'daily':
                    key = date.toISOString().split('T')[0]
                    break
                case 'weekly':
                    const weekStart = new Date(date)
                    weekStart.setDate(date.getDate() - date.getDay())
                    key = weekStart.toISOString().split('T')[0]
                    break
                case 'monthly':
                    key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
                    break
            }

            if (key) {
                totals[key] = (totals[key] || 0) + order.totalPrice
            }

            const orderItems = JSON.parse(order.orderItems)
            orderItems.forEach((item: { menuItemId: string; quantity: number; toppingIds: string[] }) => {
                const menuItem = menuItems.find(m => m.id === item.menuItemId)
                if (menuItem) {
                    menuItemSales[menuItem.menuName] = (menuItemSales[menuItem.menuName] || 0) + item.quantity

                    if (!toppingUsage[menuItem.menuName]) {
                        toppingUsage[menuItem.menuName] = { totalOrders: 0 }
                    }
                    toppingUsage[menuItem.menuName].totalOrders += item.quantity

                    item.toppingIds.forEach(toppingId => {
                        const topping = toppings.find(t => t.id === toppingId)
                        if (topping) {
                            toppingUsage[menuItem.menuName][topping.toppingName] = (toppingUsage[menuItem.menuName][topping.toppingName] || 0) + item.quantity
                            totalToppings += item.quantity
                        }
                    })
                }
            })

            const hourKey = `${date.getHours().toString().padStart(2, '0')}:00`
            hourlyOrderCounts[hourKey] = (hourlyOrderCounts[hourKey] || 0) + 1

            cashierSales[order.cashier] = (cashierSales[order.cashier] || 0) + order.totalPrice
        })

        return { totals, menuItemSales, toppingUsage, hourlyOrderCounts, cashierSales, totalToppings }
    }

    const { totals, menuItemSales, toppingUsage, hourlyOrderCounts, cashierSales, totalToppings } = processOrdersData(orders, timeRange)

    const chartData = {
        labels: Object.keys(totals).sort(),
        datasets: [
            {
                label: 'Sales',
                data: Object.keys(totals).sort().map(key => totals[key]),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                borderColor: 'rgb(53, 162, 235)',
                tension: 0.1,
            },
        ],
    }

    const menuItemChartData = {
        labels: Object.keys(menuItemSales),
        datasets: [
            {
                label: 'Quantity Sold',
                data: Object.values(menuItemSales),
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
            },
        ],
    }

    const hourlyOrderChartData = {
        labels: Object.keys(hourlyOrderCounts).sort(),
        datasets: [
            {
                label: 'Orders per Hour',
                data: Object.keys(hourlyOrderCounts).sort().map(key => hourlyOrderCounts[key]),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.1,
            },
        ],
    }

    const cashierRankingData = Object.entries(cashierSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h1 className="text-4xl font-bold mb-4 md:mb-0">Sales Dashboard</h1>
                <Button onClick={handleRefresh} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-center text-primary">
                            {formatCurrency(getTotalSales())}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-center text-primary">
                            {getTotalCustomers()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-center text-primary">
                            {getAverageOrderValue()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end mb-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        x: {
                                            ticks: {
                                                maxTicksLimit: 20
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Menu Item Sales (Quantity)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <Bar data={menuItemChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Topping Usage by Menu Item</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Menu Item</th>
                                    {toppings.map(topping => (
                                        <th key={topping.id} scope="col" className="px-6 py-3">{topping.toppingName}</th>
                                    ))}
                                    <th scope="col" className="px-6 py-3">Total Orders</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(toppingUsage).map(([menuItem, usage]) => (
                                    <tr key={menuItem} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{menuItem}</td>
                                        {toppings.map(topping => (
                                            <td key={topping.id} className="px-6 py-4">
                                                {usage[topping.toppingName] ?
                                                    `${((usage[topping.toppingName] / usage.totalOrders) * 100).toFixed(2)}% (${usage[topping.toppingName]})` :
                                                    '0%'}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4">{usage.totalOrders}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Total Topping Usage</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-center text-primary">
                        {totalToppings}
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Hourly Order Count</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="h-[300px] w-full">
                            <Line
                                data={hourlyOrderChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        x: {
                                            ticks: {
                                                maxTicksLimit: 24
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cashier Ranking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Rank</th>
                                        <th scope="col" className="px-6 py-3">Cashier</th>
                                        <th scope="col" className="px-6 py-3">Total Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cashierRankingData.map(([cashier, sales], index) => (
                                        <tr key={cashier} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td className="px-6 py-4">{index + 1}</td>
                                            <td className="px-6 py-4">{cashier}</td>
                                            <td className="px-6 py-4">{formatCurrency(sales)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Order ID</th>
                                    <th scope="col" className="px-6 py-3">Items</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 10).map((order) => (
                                    <tr key={order.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4">{order.orderId}</td>
                                        <td className="px-6 py-4">
                                            {JSON.parse(order.orderItems).map((item: { menuItemId: string; quantity: number }) => {
                                                const menuItem = menuItems.find(m => m.id === item.menuItemId)
                                                return menuItem ? `${item.quantity}x ${menuItem.menuName}` : ''
                                            }).join(', ')}
                                        </td>
                                        <td className="px-6 py-4">{formatCurrency(order.totalPrice)}</td>
                                        <td className="px-6 py-4">{new Date(order.time).toLocaleString('ja-JP')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}