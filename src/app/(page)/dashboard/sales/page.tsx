'use client'

import { useEffect, useState, useCallback } from 'react'
import "@/app/globals.css"
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import { Bar, Line } from 'react-chartjs-2'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface OrderItem {
    menuItemId: string
    quantity: number
    toppingIds: string[]
}

interface Order {
    id: string
    orderItems: string
    peopleCount: number
    amount: number
    createdAt: string
}

interface SalesData {
    totalAmount: number
    orders: Order[]
}

interface DateRange {
    startDate?: Date;
    endDate?: Date;
    from?: Date|undefined
    to?: Date
}

interface MenuItemSales {
    [key: string]: { quantity: number; amount: number }
}

interface ToppingSales {
    [key: string]: number
}

interface MenuItem {
    id: string
    name: string
    toppings: { id: string; name: string }[]
}

export default function EnhancedSalesDashboard() {
    const { eventName, circleName } = useParams()
    const [salesData, setSalesData] = useState<SalesData | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('daily')
    const [dateRange, setDateRange] = useState<DateRange>({ startDate: new Date(), endDate: new Date() });

    const fetchSalesData = useCallback(async () => {
        setLoading(true)
        try {
            const circleId = document.cookie
                .split('; ')
                .find(row => row.startsWith('circleId='))
                ?.split('=')[1];

            if (!circleId) {
                window.location.href = '/login';
            }

            const salesResponse = await fetch(`/api/sales?circleId=${encodeURIComponent(circleId)}`)
            const salesData = await salesResponse.json()
            setSalesData(salesData)

            const menusResponse = await fetch(`/api/menus?circleId=${encodeURIComponent(circleId)}`)
            const menusData = await menusResponse.json()
            if (menusResponse.ok) {
                setMenuItems(menusData)
            } else {
                console.error('Error fetching menu items:', menusData.error)
            }
        } catch (error) {
            console.error('Error fetching sales data:', error)
        } finally {
            setLoading(false)
        }
    }, [eventName, circleName])

    useEffect(() => {
        fetchSalesData()
    }, [fetchSalesData])

    const handleRefresh = () => {
        fetchSalesData()
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!salesData) {
        return <div>Error loading sales data.</div>
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
    }

    const getMenuItemName = (id: string) => {
        const menuItem = menuItems.find(item => item.id === id)
        return menuItem ? menuItem.name : id
    }

    const getToppingName = (id: string) => {
        for (const menuItem of menuItems) {
            const topping = menuItem.toppings.find(t => t.id === id)
            if (topping) return topping.name
        }
        return id
    }

    const processOrdersData = (orders: Order[], range: string) => {
        const totals: { [key: string]: number } = {}
        const menuItemSales: MenuItemSales = {}
        const toppingSales: ToppingSales = {}
        const hourlyOrderCounts: { [key: string]: number } = {}
        let totalCustomers = 0
        const uniqueCustomerSets: { [key: string]: Set<string> } = {}

        orders.forEach(order => {
            const date = new Date(order.createdAt)
            totalCustomers += order.peopleCount;

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
                if (key !== undefined) {
                    totals[key] = (totals[key] || 0) + order.amount
                }

                // Process order items
                const orderItems: OrderItem[] = JSON.parse(order.orderItems)
                orderItems.forEach(item => {
                    const menuItemName = getMenuItemName(item.menuItemId)
                    if (!menuItemSales[menuItemName]) {
                        menuItemSales[menuItemName] = { quantity: 0, amount: 0 }
                    }
                    menuItemSales[menuItemName].quantity += item.quantity
                    menuItemSales[menuItemName].amount += (order.amount / orderItems.length) * item.quantity

                    item.toppingIds.forEach(toppingId => {
                        const toppingName = getToppingName(toppingId)
                        toppingSales[toppingName] = (toppingSales[toppingName] || 0) + item.quantity
                    })
                })

                // Count unique customers per time period
                if (key !== undefined) {
                    if (!uniqueCustomerSets[key]) {
                        uniqueCustomerSets[key] = new Set()
                    }
                    uniqueCustomerSets[key].add(order.id)

                    // Count hourly orders
                    const hourKey = `${date.getHours().toString().padStart(2, '0')}:00`
                    if (hourKey !== undefined) {
                        hourlyOrderCounts[hourKey] = (hourlyOrderCounts[hourKey] || 0) + 1
                    }
                }
            }
        )

        return { totals, menuItemSales, toppingSales, totalCustomers, hourlyOrderCounts }
    }

    const { totals, menuItemSales, toppingSales, totalCustomers, hourlyOrderCounts } = processOrdersData(salesData.orders, timeRange)

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-center text-primary">
                            {formatCurrency(salesData.totalAmount)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-center text-primary">
                            {totalCustomers}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Average Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-center text-primary">
                            {formatCurrency(salesData.totalAmount / salesData.orders.length)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px] mb-4 md:mb-0">
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
                                {salesData.orders.slice(0, 10).map((order) => (
                                    <tr key={order.id} className="bg-white border-b  dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4">{order.id.slice(0, 8)}...</td>
                                        <td className="px-6 py-4">
                                            {JSON.parse(order.orderItems).map((item: OrderItem) =>
                                                `${item.quantity}x ${getMenuItemName(item.menuItemId)}`
                                            ).join(', ')}
                                        </td>
                                        <td className="px-6 py-4">{formatCurrency(order.amount)}</td>
                                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleString('ja-JP')}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={4} className="text-center py-4">
                                        <Button onClick={() => window.location.href = '/dashboard/orders'}>
                                            全ての注文
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}