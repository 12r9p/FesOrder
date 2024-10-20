import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";

// 環境変数を読み込む
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_TOPPINGS = process.env.NOTION_DATABASE_TOPPINGS!;

interface Topping {
  id: string;
  circleId: string;
  name: string;
  price: number;
  description?: string;
  soldOut: boolean; // 売り切れ表示
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
    // トッピングデータを取得
    const toppingResponse = await notion.databases.query({
      database_id: NOTION_DATABASE_TOPPINGS,
      filter: {
        property: "circleId",
        rich_text: {
          equals: circleId,
        },
      },
    });

    const toppingResults = toppingResponse.results || [];
    const toppings: Topping[] = toppingResults.map((toppingPage: any) => ({
      id: toppingPage.properties.id.title?.[0]?.text?.content,
      circleId:
        toppingPage.properties.circleId.rich_text?.[0]?.text?.content || "",
      name: toppingPage.properties.name.rich_text?.[0]?.text?.content || "",
      price: toppingPage.properties.price.number,
      description:
        toppingPage.properties.description?.rich_text?.[0]?.text?.content || "",
      soldOut: toppingPage.properties.soldOut?.checkbox || false, // 売り切れ表示
    }));


    return NextResponse.json(toppings);
  } catch (error) {
    console.error("Error querying database:", error);
    return NextResponse.json(
      { error: "Error querying database" },
      { status: 500 }
    );
  }
}