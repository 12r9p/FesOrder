'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MenuItem as MenuItemType, Circle, Topping } from '@/types/interfaces'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from 'react-markdown'

const ToppingItem: React.FC<Topping> = ({ name, price, soldOut }) => (
    <div className="flex justify-between items-center text-sm">
        <span>{name}</span>
        <span className="flex items-center">
            {soldOut && <AlertCircle className="w-4 h-4 text-red-500 mr-1" />}
            {price} 円
        </span>
    </div>
)

const MenuItem: React.FC<MenuItemType> = ({ name, description, price, imagePath, toppings, additionalInfo, soldOut }) => (
    <Card className="relative">
        {soldOut && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                <Badge variant="destructive" className="text-lg py-2 px-4">売り切れ</Badge>
            </div>
        )}
        <CardHeader>
            <CardTitle className="flex justify-between items-center">
                <span>{name}</span>
                <span className="text-lg font-bold">{price} 円</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="aspect-square relative mb-4">
                <img src={imagePath} alt={name} className="object-cover rounded-md w-full h-full" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            {toppings && toppings.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">トッピング</h4>
                    {toppings.map((topping) => (
                        <ToppingItem key={topping.id} {...topping} />
                    ))}
                </div>
            )}
            {additionalInfo && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">追加情報</h4>
                    <div className="text-sm prose prose-sm max-w-none">
                        <ReactMarkdown>{additionalInfo}</ReactMarkdown>
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
)

const MenuPage: React.FC = () => {
    const { eventName, circleName } = useParams()
    const [circle, setCircle] = useState<Circle | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItemType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch circleId
                const eventResponse = await fetch(`/api/events?eventName=${encodeURIComponent(eventName as string)}&circleName=${encodeURIComponent(circleName as string)}`)
                const eventData = await eventResponse.json()
                const circleId = eventData[0].circleId

                // Fetch circle info
                const circleResponse = await fetch(`/api/circles?circleId=${encodeURIComponent(circleId)}`)
                const circleData = await circleResponse.json()
                setCircle(circleData[0])

                // Fetch menu items
                const menuResponse = await fetch(`/api/menus?circleId=${encodeURIComponent(circleId)}`)
                const menuData = await menuResponse.json()
                setMenuItems(menuData)
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [eventName, circleName])

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <header className="text-center mb-8">
                {circle ? (
                    <>
                        <div className="w-32 h-32 mx-auto mb-4 relative">
                            <img
                                src={circle.iconImagePath || '/placeholder.svg?height=128&width=128'}
                                alt={`${circle.name} icon`}
                                className="rounded-full object-cover w-full h-full"
                            />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{circle.name}</h1>
                        <p className="text-lg text-muted-foreground">{circle.description}</p>
                    </>
                ) : (
                    <>
                        <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                        <Skeleton className="h-8 w-64 mx-auto mb-2" />
                        <Skeleton className="h-4 w-96 mx-auto" />
                    </>
                )}
            </header>
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {menuItems.length > 0 ? (
                    menuItems.map(item => (
                        <MenuItem key={item.id} {...item} />
                    ))
                ) : (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="aspect-square mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))
                )}
            </main>
        </div>
    )
}

export default MenuPage