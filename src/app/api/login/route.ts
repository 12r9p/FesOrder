// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { eventName, circleName, password } = req.body;

  // 簡単なバリデーション
  if (!eventName || !circleName || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // 仮の認証ロジック: データベースなどで認証を行う
  // ここでの例はプレースホルダーとしてハードコーディングしています
  if (eventName === 'exampleEvent' && circleName === 'exampleCircle' && password === 'password123') {
    // 認証成功: サークルIDを返す
    const circleId = '12345'; // 実際にはDBから取得
    return res.status(200).json({ circleId });
  } else {
    // 認証失敗
    return res.status(401).json({ message: 'Invalid credentials' });
  }
}
