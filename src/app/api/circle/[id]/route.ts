import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";

import { Circle } from "@/types/interfaces";


dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_CIRCLES = process.env.NOTION_DATABASE_CIRCLES;

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    // if (!params) {
    //     return NextResponse.json({ error: "id is required" }, { status: 400 });
    // }
    const { id } = params;

    try {
        const response: any = await notion.pages.retrieve({ page_id: id });
        const properties = response.properties;

        const circle: Circle = {
            id: response.id,
            name: properties.circleName.title[0].text.content,
            description: properties.description?.rich_text[0].text.content,
            iconImagePath: properties.iconImagePath?.rich_text[0].text.content,
            backgroundImagePath:
                properties.backgroundImagePath?.rich_text[0].text.content,
        };

        return NextResponse.json(circle);
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
        const { name, description, iconImagePath, backgroundImagePath } =
            await req.json();

        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_CIRCLES! },
            properties: {
                circleName: {
                    title: [
                        {
                            text: {
                                content: name,
                            },
                        },
                    ],
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
                iconImagePath: {
                    url: iconImagePath,
                },
                backgroundImagePath: {
                    url: backgroundImagePath,
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
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const { name, description, iconImagePath, backgroundImagePath } =
            await req.json();

        const response = await notion.pages.update({
            page_id: id,
            properties: {
                circleName: {
                    title: [
                        {
                            text: {
                                content: name,
                            },
                        },
                    ],
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
                iconImagePath: {
                    url: iconImagePath,
                },
                backgroundImagePath: {
                    url: backgroundImagePath,
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
    { params }: { params: { id: string } }
) {
    const { id } = params;

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
