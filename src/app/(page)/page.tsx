import React from 'react';

const Page: React.FC = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Link Page</h1>
            <ul className="space-y-2">
                <li>
                    <a href="/testevent/circles" className="text-blue-500 hover:underline">Circle list</a>
                </li>
                <li>
                    <a href="/dashboard/sales" className="text-blue-500 hover:underline">Dashboard Sales</a>
                </li>
                <li>
                    <a href="/dashboard/orders" className="text-blue-500 hover:underline">❌Dashboard Orders</a>
                </li>
                <li>
                    <a href="/dashboard/menus" className="text-blue-500 hover:underline">❌Dashboard Menus</a>
                </li>
                <li>
                    <a href="/dashboard/circle" className="text-blue-500 hover:underline">❌Dashboard circle</a>
                </li>
                <li>
                    <a href="/testevent/test/menus" className="text-blue-500 hover:underline">Menus</a>
                </li>
                <li>
                    <a href="/orders" className="text-blue-500 hover:underline">❌Orders</a>
                </li>
                <li>
                    <a href="/register" className="text-blue-500 hover:underline">Register</a>
                </li>
                <li>
                    <a href="/backyard" className="text-blue-500 hover:underline">❌backyard</a>
                </li>
            </ul>
        </div>
    );
};

export default Page;