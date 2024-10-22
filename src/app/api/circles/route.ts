import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import dotenv from "dotenv";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_EVENTS :string= process.env.NOTION_DATABASE_CIRCLES || "";

interface Events {
  id: string;
  name: string;
  description?: string;
  iconImagePath?: string;
  backgroundImagePath?: string;
}

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
    // イベントデータを取得
    const eventResponse = await notion.databases.query({
      database_id: NOTION_DATABASE_EVENTS,
      filter: {
        property: "id",
        rich_text: {
          equals: circleId,
        },
      },
    });

    const eventResults = eventResponse.results || [];
    const events: Events[] = eventResults.map((eventPage: any) => ({
      id: eventPage.properties.id.title?.[0]?.text?.content || "",
      name: eventPage.properties.name.rich_text?.[0]?.text?.content || "",
      description:
        eventPage.properties.description?.rich_text?.[0]?.text?.content || "",
      iconImagePath: eventPage.properties.iconImagePath?.url || "",
      backgroundImagePath: eventPage.properties.backgroundImagePath?.url || "",
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
