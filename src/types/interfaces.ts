export interface Event {
    eventName: string;
    circleName: string;
    circleId: string;
}

export interface Circle {
    id: string;
    name: string;
    description?: string;
    iconImagePath?: string;
    backgroundImagePath?: string;
}

export interface MenuItem {
    id: string;
    circleId: string;
    name: string;
    price: number;
    imagePath: string;
    description: string;
    toppings?: Topping[];
    additionalInfo?: string[];
    soldOut: boolean;
}

export interface Topping {
    id: string;
    circleId: string;
    name: string;
    price: number;
    description?: string;
    soldOut: boolean;
}


export interface Order {
    id: string;
    circleId: string;
    orderItems: OrderItem[];
    totalPrice: number;
    peopleCount: number;
    time: string;
    cashier: string;
}

export interface OrderItem {
    menuItemId: string;
    quantity: number;
    toppingIds: string[];
    options: string[];
}