'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface MenuItem {
    id: string
    circleId: string
    name: string
    price: number
    imagePath: string
    description: string
    additionalInfo: string
    soldOut: boolean
    toppingIds: string[]
}

interface Topping {
    id: string
    name: string
    price: number
}

export default function MenuManagement() {
    const { eventName, circleName } = useParams()
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [toppings, setToppings] = useState<Topping[]>([])
    const [loading, setLoading] = useState(true)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { toast } = useToast();

    useEffect(() => {
        fetchMenuData()
    }, [])

    const fetchMenuData = async () => {
        setLoading(true)
        try {
            const circleId = document.cookie
                .split('; ')
                .find(row => row.startsWith('circleId='))
                ?.split('=')[1];

            if (!circleId) {
                window.location.href = '/login';
            }

            const menuResponse = await fetch(`/api/menus?circleId=${encodeURIComponent(circleId)}`)
            const menuData = await menuResponse.json()
            setMenuItems(menuData)

            const toppingResponse = await fetch(`/api/menus/toppings?circleId=${encodeURIComponent(circleId)}`)
            const toppingData = await toppingResponse.json()
            setToppings(toppingData)
        } catch (error) {
            console.error('Error fetching menu data:', error)
            toast({
                title: "Error",
                description: "Failed to fetch menu data. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddOrEditMenuItem = async (item: MenuItem) => {
        try {
            const method = item.id ? 'PATCH' : 'POST'
            const url = `/api/menus`
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            })
            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Menu item ${item.id ? 'updated' : 'added'} successfully.`,
                })
                fetchMenuData()
                setIsDialogOpen(false)
            } else {
                throw new Error(`Failed to ${item.id ? 'update' : 'add'} menu item`)
            }
        } catch (error) {
            console.error('Error adding/editing menu item:', error)
            toast({
                title: "Error",
                description: `Failed to ${item.id ? 'update' : 'add'} menu item. Please try again.`,
                variant: "destructive",
            })
        }
    }

    const handleDeleteMenuItem = async (id: string) => {
        if (confirm('Are you sure you want to delete this menu item?')) {
            try {
                const response = await fetch(`/api/menus/${id}`, { method: 'DELETE' })
                if (response.ok) {
                    toast({
                        title: "Success",
                        description: "Menu item deleted successfully.",
                    })
                    fetchMenuData()
                } else {
                    throw new Error('Failed to delete menu item')
                }
            } catch (error) {
                console.error('Error deleting menu item:', error)
                toast({
                    title: "Error",
                    description: "Failed to delete menu item. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Menu Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingItem(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                        </DialogHeader>
                        <MenuItemForm
                            item={editingItem || { id: '', circleId: '', name: '', price: 0, imagePath: '', description: '', additionalInfo: '', soldOut: false, toppingIds: [] }}
                            toppings={toppings}
                            onSubmit={handleAddOrEditMenuItem}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                {item.name}
                                <div>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMenuItem(item.id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Price: ¥{item.price}</p>
                            <p>Description: {item.description}</p>
                            <p>Sold Out: {item.soldOut ? 'Yes' : 'No'}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

interface MenuItemFormProps {
    item: MenuItem
    toppings: Topping[]
    onSubmit: (item: MenuItem) => void
}

function MenuItemForm({ item, toppings, onSubmit }: MenuItemFormProps) {
    const [formData, setFormData] = useState(item)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleToppingChange = (toppingId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            toppingIds: checked
                ? [...prev.toppingIds, toppingId]
                : prev.toppingIds.filter(id => id !== toppingId)
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="imagePath">Image Path</Label>
                <Input id="imagePath" name="imagePath" value={formData.imagePath} onChange={handleChange} />
            </div>
            <div>
                <Label htmlFor="additionalInfo">Additional Info</Label>
                <Input id="additionalInfo" name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="soldOut"
                    name="soldOut"
                    checked={formData.soldOut}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, soldOut: checked as boolean }))}
                />
                <Label htmlFor="soldOut">Sold Out</Label>
            </div>
            <div>
                <Label>Toppings</Label>
                <div className="space-y-2">
                    {toppings.map((topping) => (
                        <div key={topping.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`topping-${topping.id}`}
                                checked={formData.toppingIds.includes(topping.id)}
                                onCheckedChange={(checked) => handleToppingChange(topping.id, checked as boolean)}
                            />
                            <Label htmlFor={`topping-${topping.id}`}>{topping.name}</Label>
                        </div>
                    ))}
                </div>
            </div>
            <Button type="submit">Save</Button>
        </form>
    )
}