// src/utils/storage.js
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore';

// Firestore Collection References
const tournamentStateRef = doc(db, 'tournamentState', 'current'); // Single document for current state
const tournamentHistoryCol = collection(db, 'tournamentHistory');
const playerRatingsCol = collection(db, 'playerRatings');

/**
 * Сохраняет текущее состояние турнира в Firestore.
 * @param {object} state - Объект состояния турнира.
 */
export const saveTournamentState = async (state) => {
  try {
    console.log('💾 Saving tournament state to Firestore:', state);
    await setDoc(tournamentStateRef, state);
    console.log("✅ Состояние турнира успешно сохранено в Firestore.");
  } catch (e) {
    console.error("❌ Ошибка сохранения состояния турнира в Firestore:", e);
    // Fallback to localStorage
    console.log('🔄 Falling back to localStorage...');
    localStorage.setItem('tournamentState', JSON.stringify(state));
    console.log("✅ Состояние турнира сохранено в localStorage.");
  }
};

/**
 * Загружает состояние турнира из Firestore.
 * @returns {object|null} - Сохраненное состояние турнира или null, если его нет.
 */
export const loadTournamentState = async () => {
  try {
    console.log('🔍 Attempting to load tournament state from Firestore...');
    const docSnap = await getDoc(tournamentStateRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Tournament state loaded from Firestore:', data);
      
      // Check if the data is actually meaningful (not just an empty object from clearTournamentState)
      const hasData = data && !data.cleared && (
        (data.players && data.players.length > 0) ||
        (data.teams && data.teams.length > 0) ||
        (data.games && data.games.length > 0) ||
        data.screen !== 'input'
      );
      
      if (hasData) {
        return data;
      } else {
        console.log('ℹ️ Firestore document exists but contains no meaningful tournament data');
        return undefined;
      }
    } else {
      console.log("ℹ️ Состояние турнира не найдено в Firestore.");
      return undefined;
    }
  } catch (e) {
    console.error("❌ Ошибка загрузки состояния турнира из Firestore:", e);
    // Fallback to localStorage
    console.log('🔄 Falling back to localStorage...');
    const localData = localStorage.getItem('tournamentState');
    if (localData) {
      console.log('✅ Tournament state loaded from localStorage');
      return JSON.parse(localData);
    } else {
      console.log('ℹ️ No tournament state found in localStorage either');
      return undefined;
    }
  }
};

/**
 * Очищает текущее состояние турнира из Firestore.
 */
export const clearTournamentState = async () => {
  try {
    console.log('🗑️ Clearing tournament state from Firestore...');
    // Clear by setting an empty object with a flag to indicate it's cleared
    await setDoc(tournamentStateRef, { cleared: true, timestamp: new Date().toISOString() });
    console.log("✅ Состояние турнира успешно очищено в Firestore.");
    
    // Also clear localStorage
    localStorage.removeItem('tournamentState');
    console.log("✅ Состояние турнира очищено из localStorage.");
  } catch (e) {
    console.error("❌ Ошибка очистки состояния турнира в Firestore:", e);
    // Still try to clear localStorage
    localStorage.removeItem('tournamentState');
    console.log("✅ Состояние турнира очищено из localStorage.");
  }
};

/**
 * Сохраняет завершенный турнир в историю Firestore и обновляет рейтинги игроков.
 * @param {object} tournamentData - Данные завершенного турнира (команды, игры, результаты).
 */
export const saveTournamentToHistory = async (tournamentData) => {
  try {
    const newHistoryEntry = {
      date: new Date().toISOString(),
      ...tournamentData
    };
    await addDoc(tournamentHistoryCol, newHistoryEntry);
    console.log("Турнир успешно добавлен в историю Firestore.");

    await updatePlayerRatings(tournamentData);
  } catch (e) {
    console.error("Ошибка сохранения истории турнира или обновления рейтингов в Firestore:", e);
  }
};

/**
 * Загружает историю турниров из Firestore.
 * @returns {Array} - Массив объектов истории турниров.
 */
export const loadTournamentHistory = async () => {
  try {
    const q = query(tournamentHistoryCol, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });
    return history;
  } catch (e) {
    console.error("Ошибка загрузки истории турниров из Firestore:", e);
    return [];
  }
};

/**
 * Обновляет рейтинги игроков на основе результатов завершенного турнира.
 * @param {object} tournamentData - Данные завершенного турнира.
 */
const updatePlayerRatings = async (tournamentData) => {
  let playerRatings = await getPlayerRatings(); // Get current ratings from Firestore

  for (const game of tournamentData.games) {
    const team1 = game.teams[0];
    const team2 = game.teams[1];
    const score1 = game.score1;
    const score2 = game.score2;
    const points1 = game.points1;
    const points2 = game.points2;
    const gameDate = game.timestamp;

    // Update stats for players in Team 1
    for (const playerName of team1.players) {
      playerRatings[playerName] = playerRatings[playerName] || {
        rating: 1000,
        totalGames: 0,
        totalWins: 0,
        totalPoints: 0,
        totalScores: 0,
        lastActive: null,
        gameHistory: [],
        teammates: {},
        opponents: {}
      };

      const player = playerRatings[playerName];
      player.totalGames++;
      player.totalPoints += points1;
      player.totalScores += score1;
      player.lastActive = gameDate;

      if (score1 > score2) {
        player.totalWins++;
        player.gameHistory.push({
          date: gameDate,
          team: team1.name,
          opponents: team2.name,
          score: `${score1}:${score2}`,
          result: 'Победа',
          points: points1
        });
      } else {
        player.gameHistory.push({
          date: gameDate,
          team: team1.name,
          opponents: team2.name,
          score: `${score1}:${score2}`,
          result: 'Поражение',
          points: points1
        });
      }

      // Update teammates and opponents
      team1.players.forEach(p => {
        if (p !== playerName) {
          player.teammates[p] = (player.teammates[p] || 0) + 1;
        }
      });
      team2.players.forEach(p => {
        player.opponents[p] = (player.opponents[p] || 0) + 1;
      });
    }

    // Update stats for players in Team 2
    for (const playerName of team2.players) {
      playerRatings[playerName] = playerRatings[playerName] || {
        rating: 1000,
        totalGames: 0,
        totalWins: 0,
        totalPoints: 0,
        totalScores: 0,
        lastActive: null,
        gameHistory: [],
        teammates: {},
        opponents: {}
      };

      const player = playerRatings[playerName];
      player.totalGames++;
      player.totalPoints += points2;
      player.totalScores += score2;
      player.lastActive = gameDate;

      if (score2 > score1) {
        player.totalWins++;
        player.gameHistory.push({
          date: gameDate,
          team: team2.name,
          opponents: team1.name,
          score: `${score2}:${score1}`,
          result: 'Победа',
          points: points2
        });
      } else {
        player.gameHistory.push({
          date: gameDate,
          team: team2.name,
          opponents: team1.name,
          score: `${score2}:${score1}`,
          result: 'Поражение',
          points: points2
        });
      }

      // Update teammates and opponents
      team2.players.forEach(p => {
        if (p !== playerName) {
          player.teammates[p] = (player.teammates[p] || 0) + 1;
        }
      });
      team1.players.forEach(p => {
        player.opponents[p] = (player.opponents[p] || 0) + 1;
      });
    }

    // Update Elo rating
    const K = 32;
    const R1 = team1.teamRating || 1000;
    const R2 = team2.teamRating || 1000;

    const E1 = 1 / (1 + Math.pow(10, (R2 - R1) / 400));
    const E2 = 1 / (1 + Math.pow(10, (R1 - R2) / 400));

    let S1, S2;
    if (score1 > score2) {
      S1 = 1; S2 = 0;
    } else if (score2 > score1) {
      S1 = 0; S2 = 1;
    } else {
      S1 = 0.5; S2 = 0.5;
    }

    const newR1 = R1 + K * (S1 - E1);
    const newR2 = R2 + K * (S2 - E2);

    const deltaR1 = newR1 - R1;
    const deltaR2 = newR2 - R2;

    team1.players.forEach(playerName => {
      playerRatings[playerName].rating = (playerRatings[playerName].rating || 1000) + (deltaR1 / team1.players.length);
    });
    team2.players.forEach(playerName => {
      playerRatings[playerName].rating = (playerRatings[playerName].rating || 1000) + (deltaR2 / team2.players.length);
    });
  }

  // Save updated ratings to Firestore
  for (const playerName in playerRatings) {
    playerRatings[playerName].rating = Math.round(playerRatings[playerName].rating);
    playerRatings[playerName].winRate = playerRatings[playerName].totalGames > 0
      ? playerRatings[playerName].totalWins / playerRatings[playerName].totalGames
      : 0;
    playerRatings[playerName].averageScorePerGame = playerRatings[playerName].totalGames > 0
      ? playerRatings[playerName].totalScores / playerRatings[playerName].totalGames
      : 0;
    
    playerRatings[playerName].uniqueTeammates = Object.keys(playerRatings[playerName].teammates);
    playerRatings[playerName].uniqueOpponents = Object.keys(playerRatings[playerName].opponents);

    await setDoc(doc(playerRatingsCol, playerName), playerRatings[playerName]);
  }
  console.log("Рейтинги игроков успешно обновлены в Firestore.");
};

/**
 * Возвращает рейтинг всех игроков из Firestore.
 * @returns {object} - Объект с рейтингами игроков.
 */
export const getPlayerRatings = async () => {
  try {
    const querySnapshot = await getDocs(playerRatingsCol);
    const ratings = {};
    querySnapshot.forEach((doc) => {
      ratings[doc.id] = doc.data();
    });
    return ratings;
  } catch (e) {
    console.error("Ошибка загрузки рейтингов игроков из Firestore:", e);
    // Fallback to localStorage
    const localRatings = localStorage.getItem('playerRatings');
    return localRatings ? JSON.parse(localRatings) : {};
  }
};

/**
 * Возвращает статистику для конкретного игрока из Firestore.
 * @param {string} playerName - Имя игрока.
 * @returns {object|null} - Объект статистики игрока или null, если игрок не найден.
 */
export const getPlayerStats = async (playerName) => {
  try {
    const docSnap = await getDoc(doc(playerRatingsCol, playerName));
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("Статистика игрока не найдена в Firestore:", playerName);
      return null;
    }
  } catch (e) {
    console.error("Ошибка загрузки статистики игрока из Firestore:", e);
    return null;
  }
};

/**
 * Экспортирует все данные турнира в JSON файл.
 * @returns {boolean} - true, если экспорт успешен, false в противном случае.
 */
export const exportData = async () => {
  try {
    const data = {
      tournamentState: await loadTournamentState(),
      tournamentHistory: await loadTournamentHistory(),
      playerRatings: await getPlayerRatings(),
      tournamentSettings: JSON.parse(localStorage.getItem('tournamentSettings')) // Settings still in localStorage
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volleyball_tournament_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.error("Ошибка экспорта данных:", e);
    return false;
  }
};

/**
 * Импортирует данные турнира из JSON строки в Firestore.
 * @param {string} jsonData - JSON строка с данными турнира.
 * @returns {boolean} - true, если импорт успешен, false в противном случае.
 */
export const importData = async (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.tournamentState) {
      await saveTournamentState(data.tournamentState);
    }
    
    if (data.tournamentHistory) {
      // Clear existing history and add new ones
      const existingHistory = await getDocs(tournamentHistoryCol);
      for (const doc of existingHistory.docs) {
        await deleteDoc(doc(tournamentHistoryCol, doc.id));
      }
      for (const historyEntry of data.tournamentHistory) {
        await addDoc(tournamentHistoryCol, historyEntry);
      }
    }
    
    if (data.playerRatings) {
      // Clear existing player ratings and add new ones
      const existingPlayerRatings = await getDocs(playerRatingsCol);
      for (const doc of existingPlayerRatings.docs) {
        await deleteDoc(doc(playerRatingsCol, doc.id));
      }
      for (const playerName in data.playerRatings) {
        await setDoc(doc(playerRatingsCol, playerName), data.playerRatings[playerName]);
      }
    }
    
    if (data.tournamentSettings) {
      localStorage.setItem('tournamentSettings', JSON.stringify(data.tournamentSettings));
    }
    return true;
  } catch (e) {
    console.error("Ошибка импорта данных:", e);
    return false;
  }
};
