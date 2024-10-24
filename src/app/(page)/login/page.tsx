// app/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const [eventName, setEventName] = useState("");
    const [circleName, setCircleName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [circleConfirm, setCircleConfirm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            eventName,
            circleName,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("ログインに失敗しました。正しい情報を入力してください。");
        } else {
            // ログイン成功時に確認画面を表示
            setCircleConfirm(true);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            {!circleConfirm ? (
                <div className="w-full max-w-md p-8 bg-white shadow-md rounded-md">
                    <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">イベント名</label>
                            <input
                                type="text"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                placeholder="イベント名"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">サークル名</label>
                            <input
                                type="text"
                                value={circleName}
                                onChange={(e) => setCircleName(e.target.value)}
                                placeholder="サークル名"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">パスワード</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="パスワード"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                            >
                                ログイン
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="w-full max-w-md p-8 bg-white shadow-md rounded-md">
                    <h1 className="text-2xl font-bold text-center mb-6">サークル名確認</h1>
                    <p className="text-center text-gray-700 mb-4">
                        あなたのサークル名は <strong>{circleName}</strong> です。これでよろしいですか？
                    </p>
                    <div className="flex justify-around">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                            onClick={() => (window.location.href = "/protected")}
                        >
                            はい
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                            onClick={() => setCircleConfirm(false)}
                        >
                            いいえ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
