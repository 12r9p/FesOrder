import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_ORDERS = process.env.NOTION_DATABASE_ORDERS!;

interface Order {
    id: string;
    orderId: string;
    orderItems: string[];
    totalPrice: number;
    peopleCount: number;
    time: string;
    cashier: string;
    orderState: string;
}

export async function GET(req: NextRequest, { params }: { params: { circleId: string } }) {
    const { circleId } = params;

    if (!circleId) {
        return NextResponse.json(
            { error: "circleId is required" },
            { status: 400 }
        );
    }

    try {
        const response = await notion.databases.query({
            database_id: NOTION_DATABASE_ORDERS,
            filter: {
                property: 'circle',
                relation: {
                    contains: circleId,
                },
            },
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
        const { circleId, orderId, orderItems, totalPrice, peopleCount, time, cashier, orderState } = await req.json();

        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_ORDERS },
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
                    relation: orderItems.map((id: string) => ({ id })),
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
                    select: {
                        name: orderState,
                    },
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

export async function PATCH(req: NextRequest, { params }: { params: { circleId: string } }) {
    const { circleId } = params;

    try {
        const { orderId, orderItems, totalPrice, peopleCount, time, cashier, orderState } = await req.json();

        const response = await notion.pages.update({
            page_id: circleId,
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
                orderItems: {
                    relation: orderItems.map((id: string) => ({ id })),
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
                    select: {
                        name: orderState,
                    },
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

export async function DELETE(req: NextRequest, { params }: { params: { circleId: string } }) {
    const { circleId } = params;

    try {
        await notion.pages.update({
            page_id: circleId,
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