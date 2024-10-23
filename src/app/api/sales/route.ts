import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config();

interface Order {
    id: string;
    circleId: string;
    orderItems: any[]; // Replace with appropriate type
    totalPrice: number;
    peopleCount: number;
    time: string;
    cashier: string;
    createdAt: string; // added
    amount: number; // added
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
        let hasMore = true;
        let startCursor: string | null = null;
        let orders: any[] = [];

        while (hasMore) {
            // Fetch up to 100 records at a time
            const orderResponse = await notion.databases.query({
                database_id: NOTION_DATABASE_ORDERS,
                filter: {
                    property: "circleId",
                    rich_text: {
                        equals: circleId,
                    },
                },
                start_cursor: startCursor || undefined,
                page_size: 100, // Limit to 100 items
            });

            const orderResults = orderResponse.results || [];
            orders = orders.concat(
                orderResults.map((orderPage: any) => ({
                    id:
                        orderPage.properties.id.title?.[0]?.text?.content || "",
                    orderItems:
                        orderPage.properties.orderItems.rich_text?.[0]?.text
                            ?.content || "",
                    peopleCount: orderPage.properties.peopleCount?.number || "",
                    amount: orderPage.properties.totalPrice?.number || 0,
                    createdAt: orderPage.properties.time?.date?.start || "",
                }))
            );

            // Check if there are more records to fetch
            startCursor = orderResponse.next_cursor;
            hasMore = orderResponse.has_more;
        }

        // Calculate total amount
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
