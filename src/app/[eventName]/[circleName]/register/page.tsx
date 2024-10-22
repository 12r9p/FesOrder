'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, ShoppingCart, Plus, Minus } from 'lucide-react';

type Topping = {
    id: string;
    name: string;
    price: number;
};

type Discount = {
    id: string;
    name: string;
    value: number;
};

type MenuItem = {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    circleName: string;
    toppings?: Topping[];
    discounts?: Discount[];
    notes?: string[];
};

type OrderItem = MenuItem & {
    quantity: number;
    selectedToppings: string[];
    selectedDiscounts: string[];
};

const OrderPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<'menu' | 'details' | 'summary'>('menu');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [tempItem, setTempItem] = useState<OrderItem | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [orderNumber, setOrderNumber] = useState<string>(''); // 追加

    const circleName = 'サークルA'; // サークル名
    const selectedCircleId = '9f064cea-39dd-4ab6-a357-95069c50f89a'; // サークルID
    const numberOfPeople = 1; // 人数
    const selectedCashier = { id: '1', name: 'John Doe' }; // レジ係

    // UUID注文番号の生成
    useEffect(() => {
        const newOrderNumber = uuidv4();
        setOrderNumber(newOrderNumber);
    }, []);

    // メニューアイテムの取得
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(`/api/menus?circleId=${encodeURIComponent(selectedCircleId)}`);
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

        fetchMenuItems();
    }, [circleName]);

    const addToCart = () => {
        if (tempItem) {
            setCart(prevCart => [...prevCart, tempItem]);
            setTempItem(null);
            setCurrentView('menu');
        }
    };

    const removeFromCart = (itemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => {
            const itemTotal = item.price * item.quantity;
            const toppingsTotal = item.selectedToppings.reduce((tTotal, toppingId) => {
                const topping = item.toppings?.find(t => t.id === toppingId);
                return tTotal + (topping?.price || 0);
            }, 0);
            const discountsTotal = item.selectedDiscounts.reduce((dTotal, discountId) => {
                const discount = item.discounts?.find(d => d.id === discountId);
                return dTotal + (discount?.value || 0);
            }, 0);
            return total + itemTotal + toppingsTotal - discountsTotal;
        }, 0);
    };

    const handleSubmit = async () => {
        const orderData = {
            id: uuidv4(),
            circleId: selectedCircleId, // 適切なcircleIdを設定
            orderItems: cart,
            time: new Date(),
            peopleCount: numberOfPeople, // 適切な人数を設定
            totalPrice: getTotalPrice(),
            cashier: selectedCashier, // 適切なcashierを設定
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
                alert('注文が送信されました');
                setCart([]);
                setCurrentView('menu');
            } else {
                alert('注文の送信に失敗しました');
            }
        } catch (error) {
            console.error('Error sending order:', error);
            alert('注文の送信に失敗しました');
        }
    };

    const renderMenu = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        className="flex items-center bg-white rounded-lg shadow p-4 cursor-pointer"
                        onClick={() => {
                            setSelectedItem(item);
                            setTempItem({ ...item, quantity: 1, selectedToppings: [], selectedDiscounts: [] });
                            setCurrentView('details');
                        }}
                    >
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
                        <div>
                            <h3 className="font-semibold text-black">{item.name}</h3>
                            <p className="text-gray-600">¥{item.price}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-white border-t">
                <button
                    onClick={() => setCurrentView('summary')}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center"
                    disabled={cart.length === 0}
                >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Proceed to Order ({cart.length})
                </button>
            </div>
        </div>
    );

    const renderDetails = () => {
        if (!selectedItem || !tempItem) return null;

        return (
            <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50">
                <div className="bg-white w-full md:w-1/2 lg:w-1/3 p-4 rounded-t-lg shadow-lg">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-40 object-cover rounded-lg" />
                        <h2 className="text-2xl font-bold text-black">{selectedItem.name}</h2>
                        <p className="text-xl text-black">¥{selectedItem.price}</p>

                        {selectedItem.toppings && (
                            <div>
                                <h3 className="font-semibold mb-2 text-black">Toppings</h3>
                                {selectedItem.toppings.map(topping => (
                                    <label key={topping.id} className="flex items-center space-x-2 text-black">
                                        <input
                                            type="checkbox"
                                            checked={tempItem.selectedToppings.includes(topping.id)}
                                            onChange={() => {
                                                setTempItem(prev => {
                                                    if (!prev) return null;
                                                    const newToppings = prev.selectedToppings.includes(topping.id)
                                                        ? prev.selectedToppings.filter(id => id !== topping.id)
                                                        : [...prev.selectedToppings, topping.id];
                                                    return { ...prev, selectedToppings: newToppings };
                                                });
                                            }}
                                        />
                                        <span>{topping.name} (+¥{topping.price})</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {selectedItem.discounts && (
                            <div>
                                <h3 className="font-semibold mb-2 text-black">Discounts</h3>
                                {selectedItem.discounts.map(discount => (
                                    <label key={discount.id} className="flex items-center space-x-2 text-black">
                                        <input
                                            type="checkbox"
                                            checked={tempItem.selectedDiscounts.includes(discount.id)}
                                            onChange={() => {
                                                setTempItem(prev => {
                                                    if (!prev) return null;
                                                    const newDiscounts = prev.selectedDiscounts.includes(discount.id)
                                                        ? prev.selectedDiscounts.filter(id => id !== discount.id)
                                                        : [...prev.selectedDiscounts, discount.id];
                                                    return { ...prev, selectedDiscounts: newDiscounts };
                                                });
                                            }}
                                        />
                                        <span>{discount.name} (-¥{discount.value})</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {selectedItem.notes && (
                            <div>
                                <h3 className="font-semibold mb-2 text-black">Notes</h3>
                                <ul className="list-disc list-inside text-black">
                                    {selectedItem.notes.map((note, index) => (
                                        <li key={index} className="text-sm text-gray-600">{note}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex items-center justify-center space-x-4">
                            <button
                                onClick={() => setTempItem(prev => prev && { ...prev, quantity: Math.max(1, prev.quantity - 1) })}
                                className="bg-gray-200 p-2 rounded-full"
                            >
                                <Minus className="w-6 h-6" />
                            </button>
                            <span className="text-xl font-semibold text-black">{tempItem.quantity}</span>
                            <button
                                onClick={() => setTempItem(prev => prev && { ...prev, quantity: prev.quantity + 1 })}
                                className="bg-gray-200 p-2 rounded-full"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-white border-t flex justify-between">
                        <button
                            onClick={() => {
                                setSelectedItem(null);
                                setTempItem(null);
                                setCurrentView('menu');
                            }}
                            className="bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={addToCart}
                            className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSummary = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-black">Order Summary</h2>
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white rounded-lg shadow p-4">
                        <div>
                            <h3 className="font-semibold text-black">{item.name}</h3>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            {item.selectedToppings.length > 0 && (
                                <p className="text-sm text-gray-600">
                                    Toppings: {item.selectedToppings.map(t => item.toppings?.find(topping => topping.id === t)?.name).join(', ')}
                                </p>
                            )}
                            {item.selectedDiscounts.length > 0 && (
                                <p className="text-sm text-gray-600">
                                    Discounts: {item.selectedDiscounts.map(d => item.discounts?.find(discount => discount.id === d)?.name).join(', ')}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center">
                            <p className="font-semibold mr-4 text-black">¥{item.price * item.quantity}</p>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500"
                                aria-label={`Remove ${item.name} from cart`}
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-white border-t">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold text-black">Total:</span>
                    <span className="text-xl font-semibold text-black">¥{getTotalPrice()}</span>
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold"
                >
                    Confirm Order
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <header className="bg-blue-500 text-white p-4 flex items-center">
                {currentView !== 'menu' && (
                    <button onClick={() => setCurrentView('menu')} className="mr-4">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
                <h1 className="text-xl font-bold">
                    {currentView === 'menu' ? 'Menu' : currentView === 'details' ? 'Item Details' : 'Order Summary'}
                </h1>
            </header>
            <main className="flex-1 overflow-hidden">
                {currentView === 'menu' && renderMenu()}
                {currentView === 'details' && renderDetails()}
                {currentView === 'summary' && renderSummary()}
            </main>
        </div>
    );
};

export default OrderPage;
