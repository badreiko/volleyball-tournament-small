// Сохранение текущего состояния турнира
const saveTournamentState = (state) => {
  try {
    localStorage.setItem('tournamentState', JSON.stringify(state));
  } catch (error) {
    console.error('Ошибка сохранения состояния турнира:', error);
  }
};

// Загрузка текущего состояния турнира
const loadTournamentState = () => {
  try {
    const state = localStorage.getItem('tournamentState');
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Ошибка загрузки состояния турнира:', error);
    return null;
  }
};

// Сохранение завершённого турнира в историю
const saveTournamentToHistory = (tournament) => {
  try {
    const history = JSON.parse(localStorage.getItem('tournamentHistory')) || [];
    history.push({ ...tournament, date: new Date() });
    localStorage.setItem('tournamentHistory', JSON.stringify(history));
    
    // Обновляем рейтинги игроков после турнира
    updatePlayerRatings(tournament);
  } catch (error) {
    console.error('Ошибка сохранения турнира в историю:', error);
  }
};

// Очистка текущего состояния турнира
const clearTournamentState = () => {
  try {
    localStorage.removeItem('tournamentState');
  } catch (error) {
    console.error('Ошибка очистки состояния турнира:', error);
  }
};

// Получение рейтингов игроков
const getPlayerRatings = () => {
  try {
    const ratings = localStorage.getItem('playerRatings');
    return ratings ? JSON.parse(ratings) : {};
  } catch (error) {
    console.error('Ошибка загрузки рейтингов игроков:', error);
    return {};
  }
};

// Обновление рейтингов игроков после турнира
const updatePlayerRatings = (tournament) => {
  try {
    const playerRatings = getPlayerRatings();
    const { teams, results, games } = tournament;
    
    // Собираем данные по всем игрокам из всех команд
    const allPlayers = teams.reduce((acc, team) => {
      team.players.forEach(player => {
        if (!acc[player]) {
          acc[player] = {
            gamesPlayed: 0,
            points: 0,
            wins: 0,
            scoreDifference: 0
          };
        }
      });
      return acc;
    }, {});
    
    // Обрабатываем каждую игру для расчета статистики
    games.forEach(game => {
      const team1 = game.teams[0];
      const team2 = game.teams[1];
      const score1 = game.score1;
      const score2 = game.score2;
      const winner = score1 > score2 ? 0 : 1;
      
      // Обновляем статистику для игроков первой команды
      team1.players.forEach(player => {
        allPlayers[player].gamesPlayed += 1;
        allPlayers[player].points += game.points1;
        allPlayers[player].wins += winner === 0 ? 1 : 0;
        allPlayers[player].scoreDifference += score1 - score2;
      });
      
      // Обновляем статистику для игроков второй команды
      team2.players.forEach(player => {
        allPlayers[player].gamesPlayed += 1;
        allPlayers[player].points += game.points2;
        allPlayers[player].wins += winner === 1 ? 1 : 0;
        allPlayers[player].scoreDifference += score2 - score1;
      });
    });
    
    // Обновляем или создаем рейтинг каждого игрока
    Object.entries(allPlayers).forEach(([player, stats]) => {
      const currentRating = playerRatings[player] || { 
        rating: 1000, 
        totalGames: 0, 
        totalPoints: 0,
        totalWins: 0
      };
      
      // Расчет нового рейтинга (простой алгоритм ELO с весом на основе результатов)
      const winRate = stats.wins / stats.gamesPlayed;
      const pointsPerGame = stats.points / stats.gamesPlayed;
      const performanceRating = 1000 + (winRate * 200) + (pointsPerGame * 50) + (stats.scoreDifference * 0.5);
      
      // Обновляем рейтинг с учетом истории (более новые результаты имеют больший вес)
      const gamesWeight = Math.min(stats.gamesPlayed / 10, 0.7); // Максимальный вес новых игр - 70%
      const newRating = currentRating.rating * (1 - gamesWeight) + performanceRating * gamesWeight;
      
      playerRatings[player] = {
        rating: Math.round(newRating),
        totalGames: currentRating.totalGames + stats.gamesPlayed,
        totalPoints: currentRating.totalPoints + stats.points,
        totalWins: currentRating.totalWins + stats.wins,
        lastActive: new Date().toISOString()
      };
    });
    
    localStorage.setItem('playerRatings', JSON.stringify(playerRatings));
  } catch (error) {
    console.error('Ошибка обновления рейтингов игроков:', error);
  }
};

// Экспорт данных в JSON
const exportData = () => {
  try {
    const tournamentState = localStorage.getItem('tournamentState');
    const tournamentHistory = localStorage.getItem('tournamentHistory');
    const playerRatings = localStorage.getItem('playerRatings');
    
    const dataToExport = {
      tournamentState: tournamentState ? JSON.parse(tournamentState) : null,
      tournamentHistory: tournamentHistory ? JSON.parse(tournamentHistory) : [],
      playerRatings: playerRatings ? JSON.parse(playerRatings) : {}
    };
    
    const jsonData = JSON.stringify(dataToExport);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Создаем временную ссылку для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = `volleyball-tournament-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Очищаем
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    return true;
  } catch (error) {
    console.error('Ошибка экспорта данных:', error);
    return false;
  }
};

// Импорт данных из JSON
const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.tournamentState) {
      localStorage.setItem('tournamentState', JSON.stringify(data.tournamentState));
    }
    
    if (data.tournamentHistory) {
      localStorage.setItem('tournamentHistory', JSON.stringify(data.tournamentHistory));
    }
    
    if (data.playerRatings) {
      localStorage.setItem('playerRatings', JSON.stringify(data.playerRatings));
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка импорта данных:', error);
    return false;
  }
};

// Получение статистики по игроку
const getPlayerStats = (playerName) => {
  try {
    const playerRatings = getPlayerRatings();
    const history = JSON.parse(localStorage.getItem('tournamentHistory')) || [];
    
    // Базовая статистика из рейтингов
    const baseStats = playerRatings[playerName] || { 
      rating: 1000, 
      totalGames: 0, 
      totalPoints: 0,
      totalWins: 0,
      lastActive: null
    };
    
    // Расширенная статистика из истории
    let totalScores = 0;
    let totalTeammates = new Set();
    let totalOpponents = new Set();
    let gameHistory = [];
    
    history.forEach(tournament => {
      const { games } = tournament;
      
      games.forEach(game => {
        const team1 = game.teams[0];
        const team2 = game.teams[1];
        
        // Игрок в первой команде
        if (team1.players.includes(playerName)) {
          team1.players.forEach(player => {
            if (player !== playerName) totalTeammates.add(player);
          });
          team2.players.forEach(player => totalOpponents.add(player));
          
          totalScores += game.score1;
          
          gameHistory.push({
            date: new Date(game.timestamp),
            team: team1.name,
            opponents: team2.name,
            score: `${game.score1}:${game.score2}`,
            result: game.score1 > game.score2 ? 'победа' : 'поражение',
            points: game.points1
          });
        } 
        // Игрок во второй команде
        else if (team2.players.includes(playerName)) {
          team2.players.forEach(player => {
            if (player !== playerName) totalTeammates.add(player);
          });
          team1.players.forEach(player => totalOpponents.add(player));
          
          totalScores += game.score2;
          
          gameHistory.push({
            date: new Date(game.timestamp),
            team: team2.name,
            opponents: team1.name,
            score: `${game.score2}:${game.score1}`,
            result: game.score2 > game.score1 ? 'победа' : 'поражение',
            points: game.points2
          });
        }
      });
    });
    
    return {
      ...baseStats,
      totalScores,
      averageScorePerGame: baseStats.totalGames > 0 ? totalScores / baseStats.totalGames : 0,
      winRate: baseStats.totalGames > 0 ? baseStats.totalWins / baseStats.totalGames : 0,
      uniqueTeammates: Array.from(totalTeammates),
      uniqueOpponents: Array.from(totalOpponents),
      lastGames: gameHistory.sort((a, b) => b.date - a.date).slice(0, 10)
    };
  } catch (error) {
    console.error('Ошибка получения статистики игрока:', error);
    return null;
  }
};

export { 
  saveTournamentState, 
  loadTournamentState, 
  saveTournamentToHistory, 
  clearTournamentState,
  getPlayerRatings,
  updatePlayerRatings,
  exportData,
  importData,
  getPlayerStats
};