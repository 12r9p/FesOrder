import React from 'react';

const Page: React.FC = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Link Page</h1>
            <ul className="space-y-2">
                <li>
                    <p>no login</p>
                </li>
                <li>
                    <a href="/testevent/circles" className="text-blue-500 hover:underline">❌Circle list</a>
                </li>
                <li>
                    <a href="/testevent/test/" className="text-blue-500 hover:underline">❌Circle menu</a>
                </li>
                <li>
                    <a href="/setCookies" className="text-blue-500 hover:underline">dev: setCookie</a>
                </li>
                <li>
                    <p>need login</p>
                </li>
                <li>
                    <a href="/register" className="text-blue-500 hover:underline">Register</a>
                </li>
                <li>
                    <a href="/backyard" className="text-blue-500 hover:underline">❌backyard</a>
                </li>
                <li>
                    <a href="/dashboard/circle" className="text-blue-500 hover:underline">❌Dashboard circle</a>
                </li>
                <li>
                    <a href="/dashboard/menus" className="text-blue-500 hover:underline">Dashboard Menus</a>
                </li>
                <li>
                    <a href="/dashboard/sales" className="text-blue-500 hover:underline">Dashboard Sales</a>
                </li>
                <li>
                    <a href="/dashboard/orders" className="text-blue-500 hover:underline">△ Dashboard Orders</a>
                </li>
            </ul>
        </div>
    );
};

export default Page;