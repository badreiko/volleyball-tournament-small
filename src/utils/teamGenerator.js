// Импортируем функции для работы с рейтингами игроков
import { getPlayerRatings } from './storage';

// Функция для перемешивания массива (алгоритм Фишера-Йетса)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Список прозвищ для команд
const nicknames = [
  'Молния',
  'Титаны',
  'Огонь',
  'Вихрь',
  'Феникс',
  'Гром',
  'Звезда',
  'Альфа',
  'Омега',
  'Ураган',
  'Пантера',
  'Орлы',
  'Драконы',
  'Тайфун',
  'Торнадо',
  'Цунами'
];

// Получаем рейтинг игрока или стандартный рейтинг новичка
const getPlayerRating = async (player) => {
  const ratings = await getPlayerRatings();
  return ratings[player]?.rating || 1000;
};

// Функция для балансировки команд на основе рейтинга
const balanceTeams = async (players, teamCount = 2) => {
  // Получаем рейтинги всех игроков
  const playerRatings = await getPlayerRatings();
  
  // Сортируем игроков по рейтингу (от высокого к низкому)
  const sortedPlayers = [...players].sort((a, b) => 
    (playerRatings[b]?.rating || 1000) - (playerRatings[a]?.rating || 1000)
  );
  
  // Создаем пустые команды
  const teams = Array.from({ length: teamCount }, () => []);
  
  // Распределяем игроков по командам "змейкой"
  // Пример: для 4 игроков с рейтингами [1200, 1100, 1050, 1000] и 2 команд
  // Команда 1: [1200, 1050], Команда 2: [1100, 1000]
  sortedPlayers.forEach((player, index) => {
    // Если индекс четный - добавляем в прямом порядке, если нечетный - в обратном
    const teamIndex = index % (2 * teamCount);
    const actualTeamIndex = teamIndex < teamCount ? teamIndex : (2 * teamCount - 1 - teamIndex);
    teams[actualTeamIndex].push(player);
  });
  
  return teams;
};

// Функция для создания команд в ручном режиме
export const createManualTeams = (team1Players, team2Players) => {
  return [
    { name: 'Команда 1', players: team1Players, teamRating: 0 },
    { name: 'Команда 2', players: team2Players, teamRating: 0 }
  ];
};

// Функция для модификации составов команд между сетами
export const modifyTeamComposition = (currentTeams, newTeam1Players, newTeam2Players) => {
  return [
    { ...currentTeams[0], players: newTeam1Players },
    { ...currentTeams[1], players: newTeam2Players }
  ];
};

// Основная функция для генерации команд
export const generateTeams = async (players, useBalancing = true, manualTeams = null) => {
  const count = players.length;

  // Если переданы готовые команды из ручного режима
  if (manualTeams) {
    return manualTeams;
  }

  // Если используем балансировку по рейтингу
  if (useBalancing) {
    if (count <= 14) {
      // Полные команды (12–14 участников)
      const [team1Players, team2Players] = await balanceTeams(players, 2);
      
      return [
        { name: 'Команда 1', players: team1Players, teamRating: 0 },
        { name: 'Команда 2', players: team2Players, teamRating: 0 },
      ];
    } else if (count === 15 || count === 18) {
      // Тройки (15 или 18 участников)
      const teamCount = count === 15 ? 5 : 6;
      const balancedPlayers = await balanceTeams(players, teamCount);
      
      return balancedPlayers.map((teamPlayers, index) => ({
        name: nicknames[index] || `Тройка ${index + 1}`,
        players: teamPlayers,
        teamRating: 0
      }));
    } else {
      // Двойки (16–17 участников)
      const teamCount = Math.floor(count / 2);
      const balancedPlayers = await balanceTeams(players, teamCount);
      
      // Обрабатываем случай с нечетным количеством игроков
      if (count % 2 === 1 && balancedPlayers.length > 0) {
        // Добавляем последнего игрока к последней двойке
        const lastPlayer = players[count - 1];
        const lastTeamIndex = balancedPlayers.length - 1;
        
        if (balancedPlayers[lastTeamIndex]) {
          balancedPlayers[lastTeamIndex].push(lastPlayer);
        }
      }
      
      return balancedPlayers.map((teamPlayers, index) => ({
        name: nicknames[index] || `Двойка ${index + 1}`,
        players: teamPlayers,
        teamRating: 0
      }));
    }
  } else {
    // Использование предыдущей логики случайного распределения
    const shuffledPlayers = shuffleArray(players);
    let teams = [];

    if (count <= 14) {
      // Полные команды (12–14 участников)
      const midPoint = Math.ceil(count / 2);
      const team1Players = shuffledPlayers.slice(0, midPoint);
      const team2Players = shuffledPlayers.slice(midPoint);
      teams = [
        { name: 'Команда 1', players: team1Players, teamRating: 0 },
        { name: 'Команда 2', players: team2Players, teamRating: 0 },
      ];
    } else if (count === 15 || count === 18) {
      // Тройки (15 или 18 участников)
      for (let i = 0; i < shuffledPlayers.length; i += 3) {
        teams.push({
          name: nicknames[i / 3] || `Тройка ${i / 3 + 1}`,
          players: shuffledPlayers.slice(i, i + 3),
          teamRating: 0
        });
      }
    } else {
      // Двойки (16–17 участников)
      for (let i = 0; i < shuffledPlayers.length; i += 2) {
        const remainingPlayers = shuffledPlayers.length - i;
        if (remainingPlayers >= 2) {
          teams.push({
            name: nicknames[i / 2] || `Двойка ${i / 2 + 1}`,
            players: shuffledPlayers.slice(i, i + 2),
            teamRating: 0
          });
        } else if (remainingPlayers === 1) {
          // Если остался один игрок (нечётное количество), добавляем его к последней двойке
          teams[teams.length - 1].players.push(shuffledPlayers[i]);
        }
      }
    }

    return teams;
  }
};


// Функция для выбора команд на игру и отдыхающих
const selectGameTeams = (teams, format) => {
  // Сначала перемешиваем команды
  const shuffledTeams = shuffleArray(teams);
  let gameTeams = [];
  let resting = [];

  if (format === 'full') {
    // Для полных команд (12–14 участников) играют все
    if (shuffledTeams.length === 2) {
      gameTeams = [shuffledTeams[0], shuffledTeams[1]];
      resting = [];
    } else {
      // Если команд больше двух — делим пополам
      const mid = Math.ceil(shuffledTeams.length / 2);
      const team1 = {
        name: shuffledTeams.slice(0, mid).map((t) => t.name).join(' + '),
        players: shuffledTeams.slice(0, mid).flatMap((t) => t.players),
        teamRating: 0
      };
      
      const team2 = {
        name: shuffledTeams.slice(mid).map((t) => t.name).join(' + '),
        players: shuffledTeams.slice(mid).flatMap((t) => t.players),
        teamRating: 0
      };
      
      gameTeams = [team1, team2];
      resting = [];
    }
  } else if (format === 'triples') {
    // Для троек (15 или 18 участников) 
    if (shuffledTeams.length >= 4) {
      // 2 тройки против 2 троек (6 на 6)
      const team1 = {
        name: shuffledTeams.slice(0, 2).map((t) => t.name).join(' + '),
        players: shuffledTeams.slice(0, 2).flatMap((t) => t.players),
        originalTeams: shuffledTeams.slice(0, 2),
        teamRating: 0
      };
      
      const team2 = {
        name: shuffledTeams.slice(2, 4).map((t) => t.name).join(' + '),
        players: shuffledTeams.slice(2, 4).flatMap((t) => t.players),
        originalTeams: shuffledTeams.slice(2, 4),
        teamRating: 0
      };
      
      gameTeams = [team1, team2];
      
      // Остальные тройки отдыхают
      resting = shuffledTeams.slice(4);
    } else {
      // Если троек меньше 4, то игра невозможна по правилам
      gameTeams = shuffledTeams;
      resting = [];
    }
  } else if (format === 'doubles') {
    // Для двоек (16–17 участников) две двойки отдыхают
    if (shuffledTeams.length >= 6) {
      // Берём 6 двоек, делим на две команды по 3 двойки (6 человек)
      const team1 = {
        name: shuffledTeams.slice(0, 3).map((t) => t.name).join(' + '),
        players: shuffledTeams.slice(0, 3).flatMap((t) => t.players),
        originalTeams: shuffledTeams.slice(0, 3),
        teamRating: 0
      };
      
      const team2 = {
        name: shuffledTeams.slice(3, 6).map((t) => t.name).join(' + '),
        players: shuffledTeams.slice(3, 6).flatMap((t) => t.players),
        originalTeams: shuffledTeams.slice(3, 6),
        teamRating: 0
      };
      
      gameTeams = [team1, team2];
      resting = shuffledTeams.slice(6);
    } else {
      // Если команд меньше 6, играют все, отдыхающих нет
      const team = {
        name: shuffledTeams.map((t) => t.name).join(' + '),
        players: shuffledTeams.flatMap((t) => t.players),
        originalTeams: shuffledTeams,
        teamRating: 0
      };
      
      gameTeams = [team];
      resting = [];
    }
  }

  return { gameTeams, resting };
};

/**
 * Выбирает команды для следующей игры.
 * @param {Array<object>} teams - Массив всех команд.
 * @param {Array<object>} playedGames - Массив уже сыгранных игр.
 * @returns {object} - Объект с командами для игры и отдыхающими командами.
 */
export { selectGameTeams };

/**
 * Генерирует полное расписание турнира.
 * @param {Array<object>} teams - Массив всех команд.
 * @param {string} format - Формат турнира ('full', 'triples', 'doubles').
 * @returns {Array<object>} - Массив объектов раундов с командами для игры и отдыхающими.
 */
export const generateFullSchedule = (teams, format) => {
  let schedule = [];

  if (format === 'full') {
    // Для полных команд просто чередуем матчи между ними
    // Обычно это 2 команды, и они играют фиксированное число игр (например, 5-10)
    const gamesCount = 7; // Можно параметризовать через настройки
    for (let i = 0; i < gamesCount; i++) {
      schedule.push({
        round: i + 1,
        gameTeams: [teams[0], teams[1]],
        resting: []
      });
    }
  } else if (format === 'triples') {
    // Для троек - круговой турнир, где каждая тройка сыграет с каждой другой
    // В каждом раунде одна тройка отдыхает
    const shuffledTeams = shuffleArray([...teams]);
    let round = 1;

    // Генерируем все возможные комбинации из 4 троек (2 против 2)
    for (let i = 0; i < shuffledTeams.length; i++) {
      for (let j = i + 1; j < shuffledTeams.length; j++) {
        for (let k = j + 1; k < shuffledTeams.length; k++) {
          for (let l = k + 1; l < shuffledTeams.length; l++) {
            // Формируем две команды: первая и вторая тройки против третьей и четвертой
            const team1 = {
              name: `${shuffledTeams[i].name} + ${shuffledTeams[j].name}`,
              players: [...shuffledTeams[i].players, ...shuffledTeams[j].players],
              originalTeams: [shuffledTeams[i], shuffledTeams[j]],
              teamRating: 0
            };
            
            const team2 = {
              name: `${shuffledTeams[k].name} + ${shuffledTeams[l].name}`,
              players: [...shuffledTeams[k].players, ...shuffledTeams[l].players],
              originalTeams: [shuffledTeams[k], shuffledTeams[l]],
              teamRating: 0
            };

            // Отдыхающие - все остальные тройки
            const resting = shuffledTeams.filter(team => 
              team !== shuffledTeams[i] && 
              team !== shuffledTeams[j] && 
              team !== shuffledTeams[k] && 
              team !== shuffledTeams[l]
            );

            schedule.push({
              round,
              gameTeams: [team1, team2],
              resting
            });
            
            round++;
          }
        }
      }
    }
  } else if (format === 'doubles') {
    // Для двоек - все комбинации, где 3 двойки против 3 других двоек
    // В каждом раунде две двойки отдыхают
    const shuffledTeams = shuffleArray([...teams]);
    let round = 1;
    
    // Генерируем комбинации, где каждая двойка сыграет примерно одинаковое число игр
    // Это сложнее, чем просто все комбинации, так как нужно балансировать количество игр
    
    // Используем алгоритм, который гарантирует, что каждая двойка сыграет примерно 10 игр
    // А число раундов будет таким, чтобы все двойки сыграли равное количество игр
    
    let gamesPerTeam = {}; // Отслеживаем, сколько игр сыграла каждая двойка
    shuffledTeams.forEach(team => {
      gamesPerTeam[team.name] = 0;
    });
    
    const targetGamesPerTeam = 10; // Целевое количество игр для каждой двойки
    const maxRounds = Math.ceil(targetGamesPerTeam * shuffledTeams.length / 6); // Примерное число раундов
    
    for (let r = 0; r < maxRounds && Object.values(gamesPerTeam).some(count => count < targetGamesPerTeam); r++) {
      // Сортируем команды по количеству уже сыгранных игр
      const sortedTeams = [...shuffledTeams].sort((a, b) => 
        gamesPerTeam[a.name] - gamesPerTeam[b.name]
      );
      
      // Выбираем 6 команд с наименьшим количеством игр
      const selectedTeams = sortedTeams.slice(0, 6);
      
      // Перемешиваем их и делим на две команды
      const mixedTeams = shuffleArray(selectedTeams);
      
      const team1 = {
        name: `${mixedTeams[0].name} + ${mixedTeams[1].name} + ${mixedTeams[2].name}`,
        players: [...mixedTeams[0].players, ...mixedTeams[1].players, ...mixedTeams[2].players],
        originalTeams: [mixedTeams[0], mixedTeams[1], mixedTeams[2]],
        teamRating: 0
      };
      
      const team2 = {
        name: `${mixedTeams[3].name} + ${mixedTeams[4].name} + ${mixedTeams[5].name}`,
        players: [...mixedTeams[3].players, ...mixedTeams[4].players, ...mixedTeams[5].players],
        originalTeams: [mixedTeams[3], mixedTeams[4], mixedTeams[5]],
        teamRating: 0
      };
      
      // Отдыхающие команды
      const resting = shuffledTeams.filter(team => !selectedTeams.includes(team));
      
      // Увеличиваем счетчик игр для выбранных команд
      selectedTeams.forEach(team => {
        gamesPerTeam[team.name]++;
      });
      
      schedule.push({
        round,
        gameTeams: [team1, team2],
        resting
      });
      
      round++;
    }
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