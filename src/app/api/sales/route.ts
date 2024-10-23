import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config();

interface Order {
    id: string;
    circleId: string;
    orderItems: any[]; // 適切な型に置き換えてください
    totalPrice: number;
    peopleCount: number;
    time: string;
    cashier: string;
    createdAt: string; // 追加
    amount: number; // 追加
}

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_ORDERS: string = process.env.NOTION_DATABASE_ORDERS || "";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const circleId = searchParams.get("circleId");

    if (!circleId) {
        return NextResponse.json(
            { error: "circleId is required" },
            { status: 400 }
        );
    }

    try {
        // オーダーデータを取得
        const orderResponse = await notion.databases.query({
            database_id: NOTION_DATABASE_ORDERS,
            filter: {
                property: "circleId",
                rich_text: {
                    equals: circleId,
                },
            },
        });

        const orderResults = orderResponse.results || [];
        const orders: any = orderResults.map((orderPage: any) => ({
            id: orderPage.id,
            orderItems:
                orderPage.properties.orderItems.rich_text?.[0]?.text?.content ||
                "",
            peopleCount:
                orderPage.properties.peopleCount.number || "",
            amount: orderPage.properties.totalPrice.number || 0,
            createdAt: orderPage.properties.time.date?.start || "",
        }));

        // 合計金額を計算
        const totalAmount = orders.reduce(
            (sum, order) => sum + order.amount,
            0
        );

        return NextResponse.json({
            totalAmount,
            orders,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error querying database" },
            { status: 500 }
        );
    }
}
