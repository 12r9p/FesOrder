import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import { MenuItem } from "@/types/interfaces";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_MENUS = process.env.NOTION_DATABASE_MENUS!;

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

    try {
        const menuResponse = await notion.databases.query({
            database_id: NOTION_DATABASE_MENUS,
            filter: {
                property: "circle",
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
                    imagePath:
                        properties.imagePath?.rich_text[0]?.text?.content || "",
                    toppingIds:
                        properties.toppingIds?.relation.map(
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

export async function POST(
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
            menuName,
            price,
            imagePath,
            toppingIds,
            description,
            additionalInfo,
            soldOut,
        } = await req.json();

        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_MENUS },
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
                circle: {
                    relation: [{ id: circleId }],
                },
                price: {
                    number: price,
                },
                imagePath: {
                    rich_text: [
                        {
                            text: {
                                content: imagePath,
                            },
                        },
                    ],
                },
                toppingIds: {
                    relation: toppingIds.map((id: string) => ({ id })),
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

export async function PATCH(
    req: NextRequest,
    { params: _params }: { params: { circleId: string } }
) {
    try {
        const {
            id,
            circleId,
            menuName,
            price,
            imagePath,
            toppingIds,
            description,
            additionalInfo,
            soldOut,
        } = await req.json();

        const response = await notion.pages.update({
            page_id: id,
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
                circle: {
                    relation: [
                        {
                            id: circleId,
                        },
                    ],
                },
                price: {
                    number: price,
                },
                imagePath: {
                    rich_text: [
                        {
                            text: {
                                content: imagePath,
                            },
                        },
                    ],
                },
                toppingIds: {
                    relation: toppingIds.map((id: string) => ({ id })),
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
            {
                error: error,
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { circleId: string } }
) {
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
