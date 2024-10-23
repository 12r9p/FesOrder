'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ShoppingCart, Plus, Minus, X, User, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion"
import { Order, MenuItem, OrderItem } from '@/types/interfaces';

const OrderPage: React.FC = () => {
    const { eventName, circleName } = useParams()
    const [circleId, setCircleId] = useState<string | null>(null)
    const [currentView, setCurrentView] = useState<'menu' | 'details'>('menu');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [tempItem, setTempItem] = useState<OrderItem | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [orderNumber, setOrderNumber] = useState<string>('');
    const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
    const [selectedCashier, setSelectedCashier] = useState<{ id: string; name: string } | null>(null);
    const [showCashierDialog, setShowCashierDialog] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showOrderDialog, setShowOrderDialog] = useState<boolean>(false);
    const [showItemDialog, setShowItemDialog] = useState<boolean>(false);
    const { toast } = useToast();

    useEffect(() => {
        const newOrderNumber = uuidv4();
        setOrderNumber(newOrderNumber);
    }, []);

    const fetchMenuItems = async () => {
        try {
            // Fetch circleId
            const eventResponse = await fetch(`/api/events?eventName=${encodeURIComponent(eventName as string)}&circleName=${encodeURIComponent(circleName as string)}`)
            const eventData = await eventResponse.json()
            const circleId = eventData[0].circleId
            setCircleId(circleId)

            const response = await fetch(`/api/menus?circleId=${encodeURIComponent(circleId)}`);
            const data = await response.json();
            if (response.ok) {
                setMenuItems(data);
            } else {
                console.error('Error fetching menu items:', data.error);
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, [circleId]);

    const addToCart = () => {
        if (tempItem) {
            setCart(prevCart => [...prevCart, tempItem]);
            setTempItem(null);
            setShowItemDialog(false);
        }
    };

    const removeFromCart = (menuItemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.menuItemId !== menuItemId));
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
            const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
            if (!menuItem) return total;

            const itemTotal = menuItem.price * item.quantity;
            const toppingsTotal = (item.toppingIds || []).reduce((tTotal, toppingId) => {
                const topping = menuItem.toppings?.find(t => t.id === toppingId);
                return tTotal + (topping?.price || 0);
            }, 0);
            return total + itemTotal + toppingsTotal;
        }, 0);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const orderData: Order = {
            id: uuidv4(),
            circleId: circleId,
            orderItems: cart,
            time: new Date().toISOString(),
            peopleCount: numberOfPeople,
            totalPrice: getTotalPrice(),
            cashier: selectedCashier?.name || '',
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                toast({
                    title: "Order Submitted",
                    description: "Your order has been successfully submitted.",
                });
                setCart([]);
                setShowOrderDialog(false);
                setNumberOfPeople(1);
            } else {
                throw new Error('Failed to submit order');
            }
        } catch (error) {
            console.error('Error sending order:', error);
            toast({
                title: "Order Submission Failed",
                description: "Failed to submit your order. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderMenu = () => (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Menu</span>
                    <Button variant="outline" onClick={fetchMenuItems}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Update Menu
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-16rem)]">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                        {menuItems.map(item => (
                            <Card
                                key={item.id}
                                className={`cursor-pointer transition-all hover:shadow-lg ${item.soldOut ? 'opacity-50' : ''}`}
                                onClick={() => {
                                    if (!item.soldOut) {
                                        setSelectedItem(item);
                                        setTempItem({ menuItemId: item.id, quantity: 1, toppingIds: [] });
                                        setShowItemDialog(true);
                                    }
                                }}
                            >
                                <img src={item.imagePath} alt={item.name} className="w-full h-32 object-cover rounded-t-lg" />
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                    <p className="text-muted-foreground">¥{item.price}</p>
                                    {item.soldOut && <Badge variant="secondary">Sold Out</Badge>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
                <Button
                    onClick={() => setShowOrderDialog(true)}
                    className="w-full"
                    disabled={cart.length === 0}
                >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Proceed to Order ({cart.length})
                </Button>
            </CardFooter>
        </Card>
    );

    const renderItemDialog = () => {
        if (!selectedItem || !tempItem) return null;

        return (
            <AnimatePresence>
                {showItemDialog && (
                    <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
                        <DialogContent>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="w-full max-w-md mx-auto">
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Button variant="ghost" className="mr-2" onClick={() => setShowItemDialog(false)}>
                                                <ChevronLeft className="h-6 w-6" />
                                            </Button>
                                            {selectedItem.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[60vh]">
                                            <img src={selectedItem.imagePath} alt={selectedItem.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                                            <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
                                            <p className="text-xl mb-4">¥{selectedItem.price}</p>
                                            <p className="text-muted-foreground mb-4">{selectedItem.description}</p>

                                            {selectedItem.toppings && selectedItem.toppings.length > 0 && (
                                                <div className="mb-4">
                                                    <h3 className="font-semibold mb-2">Toppings</h3>
                                                    {selectedItem.toppings.map(topping => (
                                                        <div key={topping.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`topping-${topping.id}`}
                                                                checked={tempItem.toppingIds?.includes(topping.id)}
                                                                onCheckedChange={(checked) => {
                                                                    setTempItem(prev => {
                                                                        if (!prev) return null;
                                                                        const newToppingIds = checked
                                                                            ? [...(prev.toppingIds || []), topping.id]
                                                                            : prev.toppingIds?.filter(id => id !== topping.id) || [];
                                                                        return { ...prev, toppingIds: newToppingIds };
                                                                    });
                                                                }}
                                                                disabled={topping.soldOut}
                                                            />
                                                            <Label htmlFor={`topping-${topping.id}`} className={topping.soldOut ? 'text-muted-foreground' : ''}>
                                                                {topping.name} (+¥{topping.price}) {topping.soldOut && '(Sold Out)'}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {Array.isArray(selectedItem.additionalInfo) && selectedItem.additionalInfo.length > 0 && (
                                                <div className="mb-4">
                                                    <h3 className="font-semibold mb-2">Additional Information</h3>
                                                    <ul className="list-disc list-inside">
                                                        {selectedItem.additionalInfo.map((info, index) => (
                                                            <li key={index} className="text-sm text-muted-foreground">{info}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-center space-x-4 mt-4">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setTempItem(prev => prev && { ...prev, quantity: Math.max(1, prev.quantity - 1) })}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="text-xl font-semibold">{tempItem.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setTempItem(prev => prev && { ...prev, quantity: prev.quantity + 1 })}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t p-4">
                                        <Button variant="outline" onClick={() => setShowItemDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={addToCart}>
                                            Add to Cart
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        );
    };

    const renderOrderDialog = () => (
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Order Summary</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[50vh]">
                    {cart.map(item => {
                        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                        if (!menuItem) return null;
                        return (
                            <Card key={item.menuItemId} className="mb-4">
                                <CardContent className="flex justify-between items-center p-4">
                                    <div>
                                        <h3 className="font-semibold">{menuItem.name}</h3>
                                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                        {item.toppingIds && item.toppingIds.length > 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                Toppings: {item.toppingIds.map(t => menuItem.toppings?.find(topping => topping.id === t)?.name).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <p className="font-semibold mr-4">¥{menuItem.price * item.quantity}</p>
                                        <Button
                                            variant="ghost"
                                            size="icon"

                                            onClick={() => removeFromCart(item.menuItemId)}
                                            aria-label={`Remove ${menuItem.name} from cart`}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </ScrollArea>
                <div className="flex justify-between items-center w-full mb-4">
                    <span className="text-xl font-semibold">Total:</span>
                    <span className="text-xl font-semibold">¥{getTotalPrice()}</span>
                </div>
                <div className="w-full mb-4">
                    <Label htmlFor="numberOfPeople">Number of People</Label>
                    <Input
                        id="numberOfPeople"
                        type="number"
                        value={numberOfPeople}
                        onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Confirm Order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    const renderCashierDialog = () => (
        <Dialog open={showCashierDialog} onOpenChange={setShowCashierDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Cashier Information</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cashierId" className="text-right">
                            Cashier ID
                        </Label>
                        <Input
                            id="cashierId"
                            value={selectedCashier?.id || ''}
                            onChange={(e) => setSelectedCashier(prev => prev ? { ...prev, id: e.target.value } : { id: e.target.value, name: '' })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cashierName" className="text-right">
                            Cashier Name
                        </Label>
                        <Input
                            id="cashierName"
                            value={selectedCashier?.name || ''}
                            onChange={(e) => setSelectedCashier(prev => prev ? { ...prev, name: e.target.value } : { id: '', name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => setShowCashierDialog(false)} disabled={!selectedCashier?.id || !selectedCashier?.name}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="bg-primary text-primary-foreground p-4 flex items-center">
                <h1 className="text-xl font-bold">Menu</h1>
                <Badge variant="secondary" className="ml-auto mr-2">
                    Order #: {orderNumber.slice(0, 8)}
                </Badge>
                {selectedCashier && (
                    <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{selectedCashier.name}</span>
                    </div>
                )}
            </header>
            <main className="flex-1 overflow-hidden p-4">
                {renderMenu()}
            </main>
            {renderItemDialog()}
            {renderOrderDialog()}
            {renderCashierDialog()}
            <Toaster />
        </div>
    );
};

export default OrderPage;