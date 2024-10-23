'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, RefreshCw } from "lucide-react"
import { Bar, Line, Pie } from 'react-chartjs-2'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DatePickerWithRange from "@/components/date-picker-with-range"
import { addDays } from 'date-fns'
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
} from 'chart.js'

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
    circleId: string
    amount: number
    createdAt: string
    menuItemId: string
    menuItemName: string
}

interface SalesData {
    totalAmount: number
    orders: Order[]
}

interface DateRange {
    from: Date
    to: Date
}

export default function SalesDashboard() {
    const { eventName, circleName } = useParams()
    const [salesData, setSalesData] = useState<SalesData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('daily')
    const [dateRange, setDateRange] = useState<DateRange>({
        from: addDays(new Date(), -7),
        to: new Date(),
    })

    const fetchSalesData = useCallback(async () => {
        setLoading(true)
        try {
            const eventResponse = await fetch(`/api/events?eventName=${encodeURIComponent(eventName as string)}&circleName=${encodeURIComponent(circleName as string)}`)
            const eventData = await eventResponse.json()
            const circleId = eventData[0].circleId

            const response = await fetch(`/api/sales?circleId=${encodeURIComponent(circleId)}`)
            const data = await response.json()
            setSalesData(data)
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

    const processOrdersData = (orders: Order[], range: string) => {
        const totals: { [key: string]: number } = {}
        const menuItemSales: { [key: string]: number } = {}

        orders.forEach(order => {
            const date = new Date(order.createdAt)
            if (date >= dateRange.from && date <= dateRange.to) {
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
                totals[key] = (totals[key] || 0) + order.amount
                menuItemSales[order.menuItemName] = (menuItemSales[order.menuItemName] || 0) + order.amount
            }
        })

        return { totals, menuItemSales }
    }

    const { totals, menuItemSales } = processOrdersData(salesData.orders, timeRange)

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
                data: Object.values(menuItemSales),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
            },
        ],
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Sales Dashboard</h1>
                <Button onClick={handleRefresh} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-6xl font-bold text-center text-primary">
                        {formatCurrency(salesData.totalAmount)}
                    </p>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center mb-4">
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
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {timeRange === 'hourly' ? (
                            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        ) : (
                            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Menu Item Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Pie data={menuItemChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Order ID</th>
                                    <th scope="col" className="px-6 py-3">Menu Item</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesData.orders.slice(0, 10).map((order) => (
                                    <tr key={order.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4">{order.id.slice(0, 8)}...</td>
                                        <td className="px-6 py-4">{order.menuItemName}</td>
                                        <td className="px-6 py-4">{formatCurrency(order.amount)}</td>
                                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleString('ja-JP')}</td>
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