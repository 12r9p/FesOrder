import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { MenuItem, Topping } from "@/types/interfaces";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_MENUS = process.env.NOTION_DATABASE_MENUS!;

export async function GET(req: NextRequest) {
    // リクエストからURLの検索パラメータを取得
    const { searchParams } = new URL(req.url);
    // 検索パラメータからcircleIdを取得
    const circleId = searchParams.get("circleId");

    // circleIdが存在しない場合はエラーレスポンスを返す
    if (!circleId) {
        return NextResponse.json(
            { error: "circleId is required" }, // エラーメッセージ
            { status: 400 } // ステータスコード400（Bad Request）
        );
    }

    try {
        // メニューアイテムデータをNotionデータベースから取得
        const menuResponse = await notion.databases.query({
            database_id: NOTION_DATABASE_MENUS, // データベースID
            filter: {
                property: "circleId", // フィルタ条件：circleIdプロパティ
                rich_text: {
                    equals: circleId, // フィルタ条件：circleIdが一致する
                },
            },
        });

        // 取得したメニューアイテムデータをマッピング
        const menuItems = menuResponse.results.map((page: any) => {
            // トッピングIDを取得
            const toppingIds =
                page.properties.toppingIds?.rich_text?.[0]?.text?.content.split(
                    ","
                ) || [];

            return {
                id: page.properties.id.title?.[0]?.text?.content || "", // メニューアイテムのID
                circleId:
                    page.properties.circleId.rich_text?.[0]?.text?.content ||
                    "", // サークルのID
                name: page.properties.name.rich_text?.[0]?.text?.content || "", // メニューアイテムの名前
                price: page.properties.price.number, // メニューアイテムの価格
                imagePath:
                    page.properties.imagePath?.rich_text?.[0]?.text?.content ||
                    "", // メニューアイテムの画像パス
                description:
                    page.properties.description?.rich_text?.[0]?.text
                        ?.content || "", // メニューアイテムの説明
                additionalInfo:
                    page.properties.additionalInfo?.rich_text?.[0]?.text
                        ?.content || "", // 追加情報
                soldOut: page.properties.soldOut?.checkbox || false, // 売り切れ表示
                toppingIds: toppingIds, // トッピングIDの配列
            };
        });

        // トッピングデータを別のAPIから取得
        const toppingResponse = await fetch(
            `http://localhost:3000/api/menus/toppings?circleId=${circleId}`
        );
        const toppings: Topping[] = await toppingResponse.json();

        // メニューアイテムに関連するトッピングを設定
        const menuItemsWithToppings = menuItems.map((menuItem) => {
            const relatedToppings = toppings.filter((topping) =>
                menuItem.toppingIds.includes(topping.id)
            );
            return { ...menuItem, toppings: relatedToppings };
        });

        return NextResponse.json(menuItemsWithToppings);
    } catch (error) {
        console.error("Error querying database:", error);
        return NextResponse.json(
            { error: "Error querying database" },
            { status: 500 }
        );
    }
}


export async function POST(req: NextRequest) {
    const menuItem = await req.json();

    try {
        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_MENUS },
            properties: {
                id: { title: [{ text: { content: menuItem.id } }] },
                circleId: {
                    rich_text: [{ text: { content: menuItem.circleId } }],
                },
                name: { rich_text: [{ text: { content: menuItem.name } }] },
                price: { number: menuItem.price },
                imagePath: {
                    rich_text: [{ text: { content: menuItem.imagePath } }],
                },
                description: {
                    rich_text: [{ text: { content: menuItem.description } }],
                },
                additionalInfo: {
                    rich_text: [{ text: { content: menuItem.additionalInfo } }],
                },
                soldOut: { checkbox: menuItem.soldOut },
                toppingIds: {
                    rich_text: [
                        { text: { content: menuItem.toppingIds.join(",") } },
                    ],
                },
            },
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error creating menu item:", error);
        return NextResponse.json(
            { error: "Error creating menu item" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    const { id, ...menuItem } = await req.json();

    try {
        const response = await notion.pages.update({
            page_id: id,
            properties: {
                name: { rich_text: [{ text: { content: menuItem.name } }] },
                price: { number: menuItem.price },
                imagePath: {
                    rich_text: [{ text: { content: menuItem.imagePath } }],
                },
                description: {
                    rich_text: [{ text: { content: menuItem.description } }],
                },
                additionalInfo: {
                    rich_text: [{ text: { content: menuItem.additionalInfo } }],
                },
                soldOut: { checkbox: menuItem.soldOut },
                toppingIds: {
                    rich_text: [
                        { text: { content: menuItem.toppingIds.join(",") } },
                    ],
                },
            },
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error updating menu item:", error);
        return NextResponse.json(
            { error: "Error updating menu item" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Menu item ID is required" },
            { status: 400 }
        );
    }

    try {
        await notion.pages.update({
            page_id: id,
            archived: true,
        });

        return NextResponse.json({ message: "Menu item deleted successfully" });
    } catch (error) {
        console.error("Error deleting menu item:", error);
        return NextResponse.json(
            { error: "Error deleting menu item" },
            { status: 500 }
        );
    }
}
