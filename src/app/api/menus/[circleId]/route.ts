import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";


dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_MENUS = process.env.NOTION_DATABASE_MENUS!;

interface MenuItem {
    id: string;
    menuName: string;
    price: number;
    imagePath: string;
    toppings: string[];
    description: string;
    additionalInfo: string;
    soldOut: boolean;
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

        const menuResponse = await notion.databases.query({
            database_id: NOTION_DATABASE_MENUS,
            filter: {
                property: 'circle',
                relation: {
                    contains: circleId,
                },
            },
        });

        const menuItems: MenuItem[] = menuResponse.results.map(
            (result: any) => {
                const properties = result.properties;
                return {
                    id: result.id,
                    menuName: properties.menuName.title[0]?.text?.content || "",
                    price: properties.price.number,
                    imagePath: properties.imagePath?.url || "",
                    toppings:
                        properties.toppings?.relation.map(
                            (relation: any) => relation.id
                        ) || [],
                    description:
                        properties.description?.rich_text[0]?.text?.content ||
                        "",
                    additionalInfo:
                        properties.additionalInfo?.rich_text[0]?.text
                            ?.content || "",
                    soldOut: properties.soldOut.checkbox,
                };
            }
        );

        return NextResponse.json(menuItems);
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
        const { circleId, menuName, price, imagePath, toppings, description, additionalInfo, soldOut } = await req.json();

        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_MENUS },
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
                menuName: {
                    title: [
                        {
                            text: {
                                content: menuName,
                            },
                        },
                    ],
                },
                price: {
                    number: price,
                },
                imagePath: {
                    url: imagePath,
                },
                toppings: {
                    relation: toppings.map((id: string) => ({ id })),
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
                additionalInfo: {
                    rich_text: [
                        {
                            text: {
                                content: additionalInfo,
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
        const { menuName, price, imagePath, toppings, description, additionalInfo, soldOut } = await req.json();

        const response = await notion.pages.update({
            page_id: circleId,
            properties: {
                menuName: {
                    title: [
                        {
                            text: {
                                content: menuName,
                            },
                        },
                    ],
                },
                price: {
                    number: price,
                },
                imagePath: {
                    url: imagePath,
                },
                toppings: {
                    relation: toppings.map((id: string) => ({ id })),
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
                additionalInfo: {
                    rich_text: [
                        {
                            text: {
                                content: additionalInfo,
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
