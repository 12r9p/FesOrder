import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import { Topping } from "@/types/interfaces";

// 環境変数を読み込む
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_TOPPINGS = process.env.NOTION_DATABASE_TOPPINGS!;


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
            database_id: NOTION_DATABASE_TOPPINGS,
            filter: {
                property: "circle",
                relation: {
                    contains: circleId,
                },
            },
        });

        const toppings: Topping[] = (response.results || []).map((result: any) => {
            const properties = result.properties;
            return {
                id: result.id,
                toppingName: properties.toppingName.title[0]?.text?.content || "",
                price: properties.price.number,
                description: properties.description?.rich_text[0]?.text?.content || "",
                soldOut: properties.soldOut.checkbox,
            };
        });

        return NextResponse.json(toppings);
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
        const { circleId, toppingName, price, description, soldOut } = await req.json();

        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_TOPPINGS },
            properties: {
                circleId: {
                    rich_text: [
                        {
                            text: {
                                content: circleId,
                            },
                        },
                    ],
                },
                toppingName: {
                    title: [
                        {
                            text: {
                                content: toppingName,
                            },
                        },
                    ],
                },
                price: {
                    number: price,
                },
                description: {
                    rich_text: [
                        {
                            text: {
                                content: description,
                            },
                        },
                    ],
                },
                soldOut: {
                    checkbox: soldOut,
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
        const { toppingName, price, description, soldOut } = await req.json();

        const response = await notion.pages.update({
            page_id: circleId,
            properties: {
                toppingName: {
                    title: [
                        {
                            text: {
                                content: toppingName,
                            },
                        },
                    ],
                },
                price: {
                    number: price,
                },
                description: {
                    rich_text: [
                        {
                            text: {
                                content: description,
                            },
                        },
                    ],
                },
                soldOut: {
                    checkbox: soldOut,
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