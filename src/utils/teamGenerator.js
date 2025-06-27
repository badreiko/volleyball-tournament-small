import { getPlayerRatings } from './storage';

/**
 * Генерирует команды из списка игроков.
 * @param {Array<string>} players - Массив имен игроков.
 * @param {boolean} useBalancing - Использовать ли балансировку команд по рейтингу.
 * @returns {Array<object>} - Массив объектов команд.
 */
export const generateTeams = async (players, useBalancing = true) => {
  const playerRatings = await getPlayerRatings();
  
  // Создаем массив объектов игроков с их рейтингами
  const playersWithRatings = players.map(name => ({
    name,
    rating: playerRatings[name]?.rating || 1000 // Если рейтинга нет, используем 1000
  }));

  // Перемешиваем игроков
  const shuffledPlayers = [...playersWithRatings].sort(() => Math.random() - 0.5);

  let teams = [];
  let teamSize;
  let numTeams;

  if (players.length >= 12 && players.length <= 14) {
    // Полные команды (6x6)
    numTeams = 2;
    teamSize = 6;
  } else if (players.length >= 15 && players.length <= 18) {
    // Тройки (5x5x5)
    numTeams = 3;
    teamSize = 5;
  } else {
    // Двойки (4x4x4x4)
    numTeams = 4;
    teamSize = 4;
  }

  // Распределяем игроков по командам
  for (let i = 0; i < numTeams; i++) {
    teams.push({ name: `Команда ${i + 1}`, players: [], teamRating: 0 });
  }

  if (useBalancing) {
    // Сортируем игроков по рейтингу (от сильных к слабым)
    playersWithRatings.sort((a, b) => b.rating - a.rating);

    // Распределяем игроков "змейкой" для балансировки
    for (let i = 0; i < playersWithRatings.length; i++) {
      const player = playersWithRatings[i];
      const teamIndex = i % numTeams;
      teams[teamIndex].players.push(player.name);
    }
  } else {
    // Просто распределяем перемешанных игроков
    for (let i = 0; i < shuffledPlayers.length; i++) {
      const player = shuffledPlayers[i];
      const teamIndex = i % numTeams;
      teams[teamIndex].players.push(player.name);
    }
  }

  // Вычисляем средний рейтинг для каждой команды
  teams = teams.map(team => {
    const totalRating = team.players.reduce((sum, playerName) => {
      return sum + (playerRatings[playerName]?.rating || 1000);
    }, 0);
    return {
      ...team,
      teamRating: Math.round(totalRating / team.players.length)
    };
  });

  return teams;
};

/**
 * Выбирает команды для следующей игры.
 * @param {Array<object>} teams - Массив всех команд.
 * @param {Array<object>} playedGames - Массив уже сыгранных игр.
 * @returns {object} - Объект с командами для игры и отдыхающими командами.
 */
export const selectGameTeams = (teams, playedGames) => {
  // Логика выбора команд для игры (пока простая, можно усложнить)
  // Например, выбирать команды, которые давно не играли
  const availableTeams = teams.filter(team => {
    // Простая проверка: команда не играла в последней игре
    const lastGame = playedGames[playedGames.length - 1];
    return !lastGame || (!lastGame.teams[0].name.includes(team.name) && !lastGame.teams[1].name.includes(team.name));
  });

  if (availableTeams.length < 2) {
    // Если не хватает команд, просто берем первые две
    return { gameTeams: [teams[0], teams[1]], resting: teams.slice(2) };
  }

  // В будущем здесь можно реализовать более сложную логику выбора
  // Например, учитывать рейтинг, чтобы сильные команды играли с сильными, слабые со слабыми
  // Или чтобы все команды сыграли друг с другом
  return { gameTeams: [availableTeams[0], availableTeams[1]], resting: availableTeams.slice(2) };
};

/**
 * Генерирует полное расписание турнира.
 * @param {Array<object>} teams - Массив всех команд.
 * @param {string} format - Формат турнира ('full', 'triples', 'doubles').
 * @returns {Array<object>} - Массив объектов раундов с командами для игры и отдыхающими.
 */
export const generateFullSchedule = (teams, format) => {
  const schedule = [];
  const numTeams = teams.length;

  if (numTeams < 2) return []; // Недостаточно команд для турнира

  // Создаем пары команд для игр
  const allPairs = [];
  for (let i = 0; i < numTeams; i++) {
    for (let j = i + 1; j < numTeams; j++) {
      allPairs.push([teams[i], teams[j]]);
    }
  }

  // Перемешиваем пары для случайного порядка игр
  allPairs.sort(() => Math.random() - 0.5);

  // Распределяем пары по раундам
  let currentRoundTeams = new Set();
  let round = 1;
  let pairsInCurrentRound = [];

  for (const pair of allPairs) {
    const team1Name = pair[0].name;
    const team2Name = pair[1].name;

    // Проверяем, участвуют ли команды из текущей пары уже в этом раунде
    if (!currentRoundTeams.has(team1Name) && !currentRoundTeams.has(team2Name)) {
      pairsInCurrentRound.push(pair);
      currentRoundTeams.add(team1Name);
      currentRoundTeams.add(team2Name);
    }

    // Если набралось достаточно игр для раунда или это последняя пара
    if (pairsInCurrentRound.length === Math.floor(numTeams / 2) || (pair === allPairs[allPairs.length - 1] && pairsInCurrentRound.length > 0)) {
      const playingTeamNames = new Set();
      pairsInCurrentRound.forEach(p => {
        playingTeamNames.add(p[0].name);
        playingTeamNames.add(p[1].name);
      });

      const resting = teams.filter(team => !playingTeamNames.has(team.name));

      schedule.push({
        round: round,
        gameTeams: pairsInCurrentRound[0], // Берем первую пару для игры
        resting: resting
      });

      // Подготавливаемся к следующему раунду
      round++;
      currentRoundTeams = new Set();
      pairsInCurrentRound = [];
    }
  }
  
  // Если осталась последняя пара, которая не была добавлена в раунд
  if (pairsInCurrentRound.length > 0) {
    const playingTeamNames = new Set();
    pairsInCurrentRound.forEach(p => {
      playingTeamNames.add(p[0].name);
      playingTeamNames.add(p[1].name);
    });

    const resting = teams.filter(team => !playingTeamNames.has(team.name));

    schedule.push({
      round: round,
      gameTeams: pairsInCurrentRound[0],
      resting: resting
    });
  }

  return schedule;
};

/**
 * Вычисляет рейтинг команды на основе среднего рейтинга игроков.
 * @param {Array<string>} playerNames - Массив имен игроков в команде.
 * @returns {number} - Рейтинг команды.
 */
export const calculateTeamRating = async (playerNames) => {
  const playerRatings = await getPlayerRatings();
  if (!playerNames || playerNames.length === 0) return 1000; // Базовый рейтинг для пустой команды

  const totalRating = playerNames.reduce((sum, name) => {
    return sum + (playerRatings[name]?.rating || 1000);
  }, 0);

  return Math.round(totalRating / playerNames.length);
};

/**
 * Прогнозирует результат игры на основе рейтингов команд.
 * @param {object} team1 - Объект первой команды.
 * @param {object} team2 - Объект второй команды.
 * @returns {object} - Объект с вероятностями победы и предсказанным счетом.
 */
export const predictGameResult = (team1, team2) => {
  const R1 = team1.teamRating || 1000;
  const R2 = team2.teamRating || 1000;

  // Вероятность победы по формуле Эло
  const team1WinProbability = 1 / (1 + Math.pow(10, (R2 - R1) / 400));
  const team2WinProbability = 1 - team1WinProbability;

  // Прогнозирование счета (упрощенное)
  let predictedScore1, predictedScore2;
  const scoreDifference = Math.abs(R1 - R2) / 20; // Каждые 20 очков рейтинга = 1 очко разницы в счете

  if (R1 > R2) {
    predictedScore1 = Math.round(25 + scoreDifference);
    predictedScore2 = Math.round(25 - scoreDifference);
  } else if (R2 > R1) {
    predictedScore1 = Math.round(25 - scoreDifference);
    predictedScore2 = Math.round(25 + scoreDifference);
  } else {
    predictedScore1 = 25;
    predictedScore2 = 25;
  }

  // Убедимся, что счет не отрицательный и не слишком низкий
  predictedScore1 = Math.max(0, predictedScore1);
  predictedScore2 = Math.max(0, predictedScore2);

  // Определяем, насколько матч будет близким
  const isCloseMatch = Math.abs(team1WinProbability - 0.5) < 0.1; // Если вероятность близка к 50%

  return {
    team1WinProbability,
    team2WinProbability,
    predictedScore1: Math.max(15, predictedScore1), // Минимальный счет 15
    predictedScore2: Math.max(15, predictedScore2),
    isCloseMatch,
    favoredTeam: team1WinProbability > team2WinProbability ? 1 : 2
  };
};