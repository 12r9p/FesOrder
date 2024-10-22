//イベント名とサークル名があった場合はそのサークルのIDを含めた情報を返す
//イベント名だけがあった場合はそのイベントに参加しているサークルの情報を返す

import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import { Event } from "@/types/interfaces";

// 環境変数を読み込む
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_EVENTS = process.env.NOTION_DATABASE_EVENTS!;


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const eventName = searchParams.get("eventName");
    const circleName = searchParams.get("circleName");

  if (!eventName) {
    return NextResponse.json(
      { error: "circleId is required" },
      { status: 400 }
    );
  }
    
    try {

    const filters: any[] = [
        {
            property: "eventName",
            rich_text: {
                equals: eventName,
            },
        },
    ];

    if (circleName) {
        filters.push({
            property: "circleName",
            rich_text: {
                equals: circleName,
            },
        });
    }
        // イベントデータを取得
        const eventResponse = await notion.databases.query({
            database_id: NOTION_DATABASE_EVENTS!,
            filter: {
                and: filters,
            },
        });

        const eventResults = eventResponse.results || [];
        const events: Event[] = eventResults.map((eventPage: any) => ({
            eventName: eventPage.properties.eventName.title?.[0]?.text?.content || "",
            circleName: eventPage.properties.circleName.rich_text?.[0]?.text?.content || "",
            circleId: eventPage.properties.circleId.rich_text?.[0]?.text?.content || "",
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
