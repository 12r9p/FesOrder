"use client";

import React, { useEffect, useState } from 'react';
import MenuItem from './MenuItem';

// クラス情報のJSONオブジェクトを定義
const classInfo = {
    name: '9f064cea-39dd-4ab6-a357-95069c50f89a',
    image: '/path/to/class-image.jpg',
    introduction: 'クラス紹介文がここに入ります。',
};

// トッピングのインターフェースを定義
interface Topping {
    id: string;
    circleId: string;
    name: string;
    price: number;
    description?: string;
}
// メニューアイテムのインターフェースを定義
interface MenuItemProps {
    id: string;
    circleId: string;
    name: string;
    price: number;
    imagePath: string;
    description?: string;
    toppingIds?: string[];
    additionalInfo?: string;
}

const MenuPage: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItemProps[]>([]);

    useEffect(() => {
        fetch(`/api/menus?circleId=${encodeURIComponent(classInfo.name)}`)
            .then(response => response.json())
            .then(data => setMenuItems(data))
            .catch(error => console.error('Error fetching menu data:', error));
    }, []);

    return (
        <div>
            <header className="text-center mb-8">
                <img src={classInfo.image} alt="クラス画像" className="mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">{classInfo.name}</h1>
                <p className="text-lg">{classInfo.introduction}</p>
            </header>
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {menuItems.map(item => (
                    <MenuItem key={item.id} {...item} />
                ))}
            </main>
        </div>
    );
};

export default MenuPage;