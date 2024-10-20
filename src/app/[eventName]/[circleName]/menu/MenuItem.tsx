import React from 'react';

// トッピングのインターフェースを定義
interface Topping {
    id: string;
    circleId: string;
    name: string;
    price: number;
    description: string;
}

interface MenuItemProps {
    id: string;
    circleId: string;
    name: string;
    price: number;
    imagePath: string;
    description: string;
    toppingIds: Topping[];
    additionalInfo: string;
    soldOut: boolean;
    toppings?: Topping[];
    options?: {
        label: string;
        value: string | number | string[];
    }[];
}

const MenuItem: React.FC<MenuItemProps> = ({ name, price, imagePath, description, toppingIds = [], additionalInfo, soldOut, toppings = [], options = [] }) => {
    return (
        <div className={`menu-item p-4 border rounded-lg shadow-lg relative ${soldOut ? 'opacity-50' : ''}`}>
            <div className="relative">
                <img src={imagePath} alt={name} className="w-full h-48 object-cover mb-4" />
                {soldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <p className="text-red-500 text-4xl font-bold">売り切れ</p>
                    </div>
                )}
            </div>
            <h2 className="text-xl font-bold mb-2">{name}</h2>
            <p className="mb-2">{description}</p>
            <p className="text-lg font-semibold mb-2">価格: {price}円</p>
            <div className="toppings mt-4 pl-4 border-l-2 border-gray-300">
                <h3 className="text-lg font-semibold mb-1">トッピング:</h3>
                <div className="flex overflow-x-auto space-x-2">
                    {toppingIds.map((topping, idx) => (
                        <div key={idx} className="bg-white text-black p-2 rounded min-w-max shadow-md">
                            <p className="font-bold">{topping.name}</p>
                            <p>{topping.description}</p>
                            <p className="text-sm text-gray-600">価格: {topping.price}円</p>
                        </div>
                    ))}
                </div>
            </div>
            <p className="mt-4">{additionalInfo}</p>
        </div>
    );
};

export default MenuItem;