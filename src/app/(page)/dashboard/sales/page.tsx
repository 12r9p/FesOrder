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
            const storedCircleId = Cookies.get('circleId')
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
        const totalSales = getTotalSales()
        return orders.length > 0 ? totalSales / orders.length : 0
    }

    const processOrdersData = (orders: Order[], range: string) => {
        const totals: { [key: string]: number } = {}
        const menuItemSales: { [key: string]: { quantity: number; amount: number } } = {}
        const toppingSales: { [key: string]: number } = {}
        const hourlyOrderCounts: { [key: string]: number } = {}

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
                    if (!menuItemSales[menuItem.menuName]) {
                        menuItemSales[menuItem.menuName] = { quantity: 0, amount: 0 }
                    }
                    menuItemSales[menuItem.menuName].quantity += item.quantity
                    menuItemSales[menuItem.menuName].amount += menuItem.price * item.quantity

                    item.toppingIds.forEach(toppingId => {
                        const topping = toppings.find(t => t.id === toppingId)
                        if (topping) {
                            toppingSales[topping.toppingName] = (toppingSales[topping.toppingName] || 0) + item.quantity
                        }
                    })
                }
            })

            const hourKey = `${date.getHours().toString().padStart(2, '0')}:00`
            hourlyOrderCounts[hourKey] = (hourlyOrderCounts[hourKey] || 0) + 1
        })

        return { totals, menuItemSales, toppingSales, hourlyOrderCounts }
    }

    const { totals, menuItemSales, toppingSales, hourlyOrderCounts } = processOrdersData(orders, timeRange)

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
                label: 'Sales Amount',
                data: Object.values(menuItemSales).map(item => item.amount),
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
            },
        ],
    }

    const toppingChartData = {
        labels: Object.keys(toppingSales),
        datasets: [
            {
                label: 'Quantity Sold',
                data: Object.values(toppingSales),
                backgroundColor: 'rgba(75, 192, 192, 0.8)',
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
                        <CardTitle>Average Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-center text-primary">
                            {formatCurrency(getAverageOrderValue())}
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
                        <div className="h-[300px]">
                            {timeRange === 'hourly' ? (
                                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                            ) : (
                                <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Menu Item Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <Bar data={menuItemChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Topping Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <Bar data={toppingChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Hourly Order Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <Line data={hourlyOrderChartData} options={{ responsive: true, maintainAspectRatio: false }} />
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