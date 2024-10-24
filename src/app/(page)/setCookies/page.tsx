'use client';
// app/page.tsx

// app/page.tsx

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function HomePage() {
    // セッションの初期状態
    const [allCookies, setAllCookies] = useState<{ [key: string]: string }>({});

    // フォーム入力の初期状態
    const [formData, setFormData] = useState({
        circleId: "",
        circleName: "",
        eventName: ""
    });

    // クッキーから全てのクッキー情報を取得する
    const loadAllCookies = () => {
        const cookies = Cookies.get(); // 全てのクッキーを取得
        setAllCookies(cookies);
    };

    // ページがマウントされたときに全クッキーをロード
    useEffect(() => {
        loadAllCookies();
    }, []);

    // クッキーを手動で設定する関数
    const handleSetCookies = () => {
        Cookies.set("circleId", formData.circleId);
        Cookies.set("circleName", formData.circleName);
        Cookies.set("eventName", formData.eventName);

        // クッキー設定後にフォームデータをクリア
        setFormData({
            circleId: "",
            circleName: "",
            eventName: ""
        });

        alert("Cookies have been set!");
        loadAllCookies(); // 設定したクッキーを再度読み込む
    };

    // フォーム入力を処理する関数
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Welcome to the Circle App</h1>

            {/* クッキーを手動で設定するボタン */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Set Cookies Manually:</h2>
                <input
                    type="text"
                    name="circleId"
                    value={formData.circleId}
                    placeholder="Circle ID"
                    onChange={handleInputChange}
                    className="px-4 py-2 border rounded mb-2"
                />
                <input
                    type="text"
                    name="circleName"
                    value={formData.circleName}
                    placeholder="Circle Name"
                    onChange={handleInputChange}
                    className="px-4 py-2 border rounded mb-2"
                />
                <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    placeholder="Event Name"
                    onChange={handleInputChange}
                    className="px-4 py-2 border rounded mb-4"
                />
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={handleSetCookies}
                >
                    Set Cookies
                </button>
            </div>

            {/* 全てのクッキー情報を表示 */}
            <div className="p-4 bg-white rounded shadow-md mb-4 w-80">
                <h2 className="text-2xl font-semibold mb-2">All Cookies:</h2>
                <ul>
                    {Object.entries(allCookies).map(([key, value]) => (
                        <li key={key} className="mb-1">
                            <strong>{key}:</strong> {value}
                        </li>
                    ))}
                </ul>
            </div>

            {/* クッキーを再読み込みするボタン */}
            <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={loadAllCookies}
            >
                Reload Cookies
            </button>
        </div>
    );
}
