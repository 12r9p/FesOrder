//イベント名をパラメーターとして受け取り、該当するイベントのIDを配列で返す

import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import { Event } from "@/types/interfaces";

// 環境変数を読み込む
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_EVENTS = process.env.NOTION_DATABASE_EVENTS!;


export async function GET(
    req: NextRequest,
    { params }: { params: { eventName: string } }
) {
    const { eventName } = params;

    if (!eventName) {
        return NextResponse.json(
            { error: "circleId is required" },
            { status: 400 }
        );
    }

    try {
        // イベントデータを取得
        const eventResponse = await notion.databases.query({
            database_id: NOTION_DATABASE_EVENTS!,
            filter: {
                property: "eventName",
                rich_text: {
                    equals: eventName,
                },
            },
        });

        const eventResults = eventResponse.results || [];
        const events: Event[] = eventResults.map((eventPage: any) => ({
            eventName:
                eventPage.properties.eventName.title?.[0]?.text?.content || "",
            circleId:
                eventPage.properties.circle.relation?.map(
                    (relation: any) => relation.id
                ) || [],
        }));

        return NextResponse.json(events);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error querying database" },
            { status: 500 }
        );
    }
}
