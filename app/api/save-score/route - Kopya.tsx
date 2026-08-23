import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { matchId, week, score } = await request.json();
    const dataDir = path.join(process.cwd(), 'app', 'data');
    
    // Skor kaydı
    const scoresFilePath = path.join(dataDir, `week${week}_scores.json`);
    let scoresData = fs.existsSync(scoresFilePath) ? JSON.parse(fs.readFileSync(scoresFilePath, 'utf8')) : {};
    scoresData[matchId] = score;
    fs.writeFileSync(scoresFilePath, JSON.stringify(scoresData, null, 2), 'utf8');

    // TAHMİN TARAMA VE PUANLAMA
    const predFilePath = path.join(dataDir, `week${week}_predictions.json`);
    if (fs.existsSync(predFilePath)) {
      let users = JSON.parse(fs.readFileSync(predFilePath, 'utf8'));
      
      // Tahminleri filtrele ve puanı güncelle
      users = users.map((user: any) => {
        // Eğer tahmin eşleşiyorsa puan ver
        if (user.rawPredictions && user.rawPredictions[matchId] === score) {
           user.predictions = user.predictions || {};
           user.predictions[matchId] = 12; // Puan buraya işleniyor
        }
        return user;
      });
      
      fs.writeFileSync(predFilePath, JSON.stringify(users, null, 2), 'utf8');
    }

    return NextResponse.json({ success: true, message: 'İşlem tamamlandı.' });
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}