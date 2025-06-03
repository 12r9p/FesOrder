"use client";

import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MenuItem, Topping, Order, OrderItem } from "@/types/interfaces";


const DashboardMenus = dynamic(
    () => import("@/app/(page)/dashboard/menus/page"),
    { ssr: false }
);

export default function Backyard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [circleId, setCircleId] = useState("");
    const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
    const [toppings, setToppings] = useState<Record<string, Topping>>({});
    const [completedItems, setCompletedItems] = useState<
        Record<string, Set<string>>
    >({});
    const [useWebSocket, setUseWebSocket] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(60000); // Default to 1 minute
    const [socket, setSocket] = useState<Socket | null>(null);
    const [showDashboardMenus, setShowDashboardMenus] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const storedCircleId = Cookies.get("circleId");
        if (!storedCircleId) {
            router.push("/login?page=/backyard");
        } else {
            setCircleId(storedCircleId);
        }
    }, [router]);

    const fetchOrders = useCallback(async () => {
        if (!circleId) return;
        try {
            const response = await fetch(`/api/orders/${circleId}`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                throw new Error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({
                title: "Error",
                description: "Failed to fetch orders. Please try again.",
                variant: "destructive",
            });
        }
    }, [circleId, toast]);

    const fetchMenuItems = useCallback(async () => {
        if (!circleId) return;
        try {
            const response = await fetch(`/api/menus/${circleId}`);
            if (response.ok) {
                const data: MenuItem[] = await response.json();
                const menuItemMap = data.reduce((acc, item) => {
                    acc[item.id] = item;
                    return acc;
                }, {} as Record<string, MenuItem>);
                setMenuItems(menuItemMap);
            } else {
                throw new Error("Failed to fetch menu items");
            }
        } catch (error) {
            console.error("Error fetching menu items:", error);
            toast({
                title: "Error",
                description: "Failed to fetch menu items. Please try again.",
                variant: "destructive",
            });
        }
    }, [circleId, toast]);

    const fetchToppings = useCallback(async () => {
        if (!circleId) return;
        try {
            const response = await fetch(`/api/toppings/${circleId}`);
            if (response.ok) {
                const data: Topping[] = await response.json();
                const toppingMap = data.reduce((acc, item) => {
                    acc[item.id] = item;
                    return acc;
                }, {} as Record<string, Topping>);
                setToppings(toppingMap);
            } else {
                throw new Error("Failed to fetch toppings");
            }
        } catch (error) {
            console.error("Error fetching toppings:", error);
            toast({
                title: "Error",
                description: "Failed to fetch toppings. Please try again.",
                variant: "destructive",
            });
        }
    }, [circleId, toast]);

    useEffect(() => {
        if (circleId) {
            fetchOrders();
            fetchMenuItems();
            fetchToppings();
        }
    }, [circleId, fetchOrders, fetchMenuItems, fetchToppings]);

    useEffect(() => {
        if (circleId && useWebSocket) {
            const newSocket: Socket = io(
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
            );

            newSocket.on("connect", () => {
                console.log("WebSocket connected");
                newSocket.emit("join", circleId);
            });

            newSocket.on("orderUpdate", () => {
                fetchOrders();
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }

        let interval: NodeJS.Timeout | null = null;
        if (!useWebSocket && circleId) {
            interval = setInterval(fetchOrders, pollingInterval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [circleId, useWebSocket, pollingInterval, fetchOrders]);

    const toggleItemCompletion = useCallback(
        (orderId: string, itemId: string) => {
            setCompletedItems((prev) => {
                const orderSet = prev[orderId] || new Set();
                const newSet = new Set(orderSet);
                if (newSet.has(itemId)) {
                    newSet.delete(itemId);
                } else {
                    newSet.add(itemId);
                }
                return { ...prev, [orderId]: newSet };
            });
        },
        []
    );

    const isOrderComplete = useCallback(
        (order: Order) => {
            const completedSet = completedItems[order.id] || new Set();
            return order.orderItems.every((item) => completedSet.has(item));
        },
        [completedItems]
    );

    const completeOrder = useCallback(
        async (orderId: string) => {
            if (!circleId) return;
            try {
                const response = await fetch(`/api/orders/${circleId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ orderState: "complete" }),
                });
                if (response.ok) {
                    setOrders((prevOrders) =>
                        prevOrders.filter((order) => order.id !== orderId)
                    );
                    toast({
                        title: "Order Completed",
                        description: `Order ID: ${orderId} has been marked as complete.`,
                    });
                } else {
                    throw new Error("Failed to complete order");
                }
            } catch (error) {
                console.error("Error completing order:", error);
                toast({
                    title: "Error",
                    description: "Failed to complete order. Please try again.",
                    variant: "destructive",
                });
            }
        },
        [circleId, toast]
    );

    const handleWebSocketToggle = useCallback(
        (checked: boolean) => {
            setUseWebSocket(checked);
            if (!checked && socket) {
                socket.disconnect();
                setSocket(null);
            }
        },
        [socket]
    );

    const handleIntervalChange = useCallback((value: string) => {
        setPollingInterval(parseInt(value));
    }, []);

    if (!circleId) {
        return null; // or a loading spinner
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">
                Backyard Order Management
            </h1>
            <div className="mb-6 space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="use-websocket"
                        checked={useWebSocket}
                        onCheckedChange={handleWebSocketToggle}
                    />
                    <Label htmlFor="use-websocket">Use WebSocket</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="polling-interval">Polling Interval</Label>
                    <Select
                        onValueChange={handleIntervalChange}
                        defaultValue={pollingInterval.toString()}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30000">30 seconds</SelectItem>
                            <SelectItem value="60000">1 minute</SelectItem>
                            <SelectItem value="300000">5 minutes</SelectItem>
                            <SelectItem value="600000">10 minutes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={fetchOrders}>Reload Orders</Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button onClick={() => setShowDashboardMenus(true)}>
                            Manage Sold Out Items
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Manage Sold Out Items</DialogTitle>
                        </DialogHeader>
                        {showDashboardMenus && <DashboardMenus />}
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => (
                    <Card key={order.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Order #{order.orderId}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {order.orderItems.map((itemId: string) => {
                                const orderItem = JSON.parse(
                                    itemId
                                ) as OrderItem;
                                const menuItem =
                                    menuItems[orderItem.menuItemId];
                                if (!menuItem) return null;
                                return (
                                    <div
                                        key={orderItem.menuItemId}
                                        className="flex items-center space-x-2 mb-2"
                                    >
                                        <Checkbox
                                            id={`${order.id}-${orderItem.menuItemId}`}
                                            checked={completedItems[
                                                order.id
                                            ]?.has(itemId)}
                                            onCheckedChange={() =>
                                                toggleItemCompletion(
                                                    order.id,
                                                    itemId
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor={`${order.id}-${orderItem.menuItemId}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {menuItem.menuName} x
                                            {orderItem.quantity}
                                            {orderItem.toppingIds &&
                                                orderItem.toppingIds.length >
                                                    0 && (
                                                    <span className="block text-xs text-gray-500">
                                                        Toppings:{" "}
                                                        {orderItem.toppingIds
                                                            .map(
                                                                (id) =>
                                                                    toppings[id]
                                                                        ?.toppingName
                                                            )
                                                            .join(", ")}
                                                    </span>
                                                )}
                                        </label>
                                    </div>
                                );
                            })}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                disabled={!isOrderComplete(order)}
                                onClick={() => completeOrder(order.id)}
                            >
                                Complete Order
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
