import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";

import { Order } from "@/types/interfaces";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_ORDERS = process.env.NOTION_DATABASE_ORDERS!;

export async function GET(
    req: NextRequest,
    { params }: { params: { circleId: string } }
) {
    const { circleId } = params;

    if (!circleId) {
        return NextResponse.json(
            { error: "circleId is required" },
            { status: 400 }
        );
    }

    async function fetchAllOrders(cursor?: string): Promise<Order[]> {
        const response = await notion.databases.query({
            database_id: NOTION_DATABASE_ORDERS,
            filter: {
                property: "circle",
                relation: {
                    contains: circleId,
                },
            },
            start_cursor: cursor,
            page_size: 100, // Adjust the page size as needed
        });

        const orders: Order[] = (response.results || []).map((result: any) => {
            const properties = result.properties;
            return {
                id: result.id,
                orderId: properties.orderId.title[0]?.text?.content || "",
                orderItems:
                    properties.orderItems.rich_text[0]?.text?.content || "",
                totalPrice: properties.totalPrice.number,
                peopleCount: properties.peopleCount.number,
                time: properties.time.date.start,
                cashier: properties.cashier.rich_text[0]?.text?.content || "",
                orderState:
                    properties.orderState.rich_text[0]?.text?.content || "",
            };
        });

        if (response.has_more && response.next_cursor) {
            const nextOrders = await fetchAllOrders(response.next_cursor);
            return orders.concat(nextOrders);
        }

        return orders;
    }

    try {
        const orders = await fetchAllOrders();
        return NextResponse.json(orders);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while fetching data" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        // Example POST request body
        // {
        //     "orderId": "12345",
        //     "circleId": "circle123",
        //     "orderItems": [
        //         { "item": "item1", "quantity": 2 },
        //         { "item": "item2", "quantity": 1 }
        //     ],
        //     "totalPrice": 100,
        //     "peopleCount": 3,
        //     "time": "2023-10-01T10:00:00Z",
        //     "cashier": "John Doe",
        //     "orderState": "pending"
        // }
        const {
            orderId,
            circleId,
            orderItems,
            totalPrice,
            peopleCount,
            time,
            cashier,
            orderState,
        } = await req.json();
        const orderItemsText = JSON.stringify(orderItems);

        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_ORDERS },
            properties: {
                orderId: {
                    title: [
                        {
                            text: {
                                content: orderId,
                            },
                        },
                    ],
                },
                circle: {
                    relation: [{ id: circleId }],
                },
                orderItems: {
                    rich_text: [
                        {
                            text: {
                                content: orderItemsText,
                            },
                        },
                    ],
                },
                totalPrice: {
                    number: totalPrice,
                },
                peopleCount: {
                    number: peopleCount,
                },
                time: {
                    date: {
                        start: time,
                    },
                },
                cashier: {
                    rich_text: [
                        {
                            text: {
                                content: cashier,
                            },
                        },
                    ],
                },
                orderState: {
                    rich_text: [
                        {
                            text: {
                                content: orderState,
                            },
                        },
                    ],
                },
            },
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while creating data" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { circleId: string } }
) {
    const { circleId } = params;

    if (!circleId) {
        return NextResponse.json(
            { error: "circleId is required" },
            { status: 400 }
        );
    }

    try {
        const {
            id,
            orderId,
            orderItems,
            totalPrice,
            peopleCount,
            time,
            cashier,
            orderState,
        } = await req.json();

        const response = await notion.pages.update({
            page_id: id,
            properties: {
                circle: {
                    relation: [{ id: circleId }],
                },
                orderId: {
                    title: [
                        {
                            text: {
                                content: orderId,
                            },
                        },
                    ],
                },
                orderItems: {
                    rich_text: [
                        {
                            text: {
                                content: orderItems,
                            },
                        },
                    ],
                },
                totalPrice: {
                    number: totalPrice,
                },
                peopleCount: {
                    number: peopleCount,
                },
                time: {
                    date: {
                        start: time,
                    },
                },
                cashier: {
                    rich_text: [
                        {
                            text: {
                                content: cashier,
                            },
                        },
                    ],
                },
                orderState: {
                    rich_text: [
                        {
                            text: {
                                content: orderState,
                            },
                        },
                    ],
                },
            },
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while updating data" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params: _params }: { params: { circleId: string } }
) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json(
            { error: "Page ID is required" },
            { status: 400 }
        );
    }
    try {
        await notion.pages.update({
            page_id: id,
            archived: true,
        });

        return NextResponse.json({ message: "Page deleted successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while deleting data" },
            { status: 500 }
        );
    }
}
