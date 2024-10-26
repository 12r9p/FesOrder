// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
    const [eventName, setEventName] = useState("");
    const [circleName, setCircleName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [circleConfirm, setCircleConfirm] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    eventName,
                    circleName,
                    password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // クッキーにデータを保存
                Cookies.set("eventName", eventName);
                Cookies.set("circleName", circleName);
                Cookies.set("circleId", data.circleId);

                const queryPage = searchParams.get("page") as string | undefined;
                if (queryPage) {
                    router.push(queryPage);
                } else {
                    router.push("/dashboard/sales");
                }
            } else {
                setError("ログインに失敗しました。正しい情報を入力してください。");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            setError("ログインに失敗しました。正しい情報を入力してください。");
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
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">サークル名</label>
                            <input
                                type="text"
                                value={circleName}
                                onChange={(e) => setCircleName(e.target.value)}
                                placeholder="サークル名"
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">パスワード</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="パスワード"
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                        >
                            ログイン
                        </button>
                    </form>
                </div>
            ) : (
                <div className="w-full max-w-md p-8 bg-white shadow-md rounded-md">
                    <h1 className="text-2xl font-bold text-center mb-6">ログイン成功</h1>
                    <p className="text-center">サークルの確認が完了しました。</p>
                </div>
            )}
        </div>
    );
}
