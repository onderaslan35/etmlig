// Tam İsabet Skor Puan Tablosu
function calculateMatchPoints(correctGuessCount) {
  if (correctGuessCount === 1) return 12;
  if (correctGuessCount === 2) return 6;
  if (correctGuessCount === 3) return 5;
  if (correctGuessCount === 4) return 4;
  if (correctGuessCount === 5) return 3;
  if (correctGuessCount === 6) return 2;
  if (correctGuessCount >= 7) return 1;
  return 0;
}

// Haftalık Bonusların İlave Edilmesi (+3 Puanlar)
function applyWeeklyBonuses(players) {
  let maxPoints = -1;
  let maxScores = -1;

  // En yüksek puanı ve en çok skor bileni tespit et
  players.forEach(p => {
    if (p.raw_pts > maxPoints) maxPoints = p.raw_pts;
    if (p.scores > maxScores) maxScores = p.scores;
  });

  // +3 Puan Bonuslarını uygula
  return players.map(p => {
    let bonus = 0;
    if (p.raw_pts === maxPoints && maxPoints > 0) bonus += 3;
    if (p.scores === maxScores && maxScores > 0) bonus += 3;

    return {
      ...p,
      final_pts: p.raw_pts + bonus
    };
  });
}