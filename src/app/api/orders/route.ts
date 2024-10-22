//オーダーを送信するAPI

import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { config } from 'dotenv';
import { Order } from '@/types/interfaces';

// 環境変数を読み込む
config();

// Notion クライアントを初期化
const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const NOTION_DATABASE_ORDERS: string = process.env.NOTION_DATABASE_ORDERS || "";

export async function POST(req: NextRequest) {
    try {
        const order: Order = await req.json();

        // Notionページのプロパティを作成
        const properties: any = {
            id: {
                title: [
                    {
                        text: {
                            content: order.id,
                        },
                    },
                ],
            },
            circleId: {
                rich_text: [
                    {
                        text: {
                            content: order.circleId,
                        },
                    },
                ],
            },
            totalPrice: {
                number: order.totalPrice,
            },
            peopleCount: {
                number: order.peopleCount,
            },
            time: {
                date: {
                    start: order.time,
                },
            },
            cashier: {
                rich_text: [
                    {
                        text: {
                            content: order.cashier,
                        },
                    },
                ],
            },
        };

        // OrderItemsをプロパティに追加
        order.orderItems.forEach((item, index) => {
            properties[`orderItem_${index}_menuItemId`] = {
                rich_text: [
                    {
                        text: {
                            content: item.menuItemId,
                        },
                    },
                ],
            };
            properties[`orderItem_${index}_quantity`] = {
                number: item.quantity,
            };
            properties[`orderItem_${index}_toppings`] = {
                multi_select: item.toppingIds.map((toppingIds) => ({
                    name: toppingIds,
                })),
            };
            properties[`orderItem_${index}_options`] = {
                multi_select: item.options.map((option) => ({
                    name: option,
                })),
            };
        });

        // Notionページを作成
        await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_ORDERS },
            properties,
        });

        return NextResponse.json({ message: 'Order created successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ message: 'Error creating order' }, { status: 500 });
    }
}