import { useState, useEffect, useCallback } from 'react';
import { 
  FaVolleyballBall, 
  FaUsers, 
  FaTrophy, 
  FaHistory, 
  FaCalendarAlt,
  FaInfoCircle,
  FaLink,
  FaCog,
  FaDownload,
  FaChartBar,
  FaUserAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaCheck,
  FaRegClock,
  FaExclamationTriangle,
  FaBullhorn,
  FaTable,
  FaGlobe,
  FaSyncAlt,
  FaUndo,
  FaPlay
} from 'react-icons/fa';
import PlayerInput from './components/PlayerInput';
import GameBoard from './components/GameBoard';
import GameList from './components/GameList';
import ResultsTable from './components/ResultsTable';
import HistoryView from './components/HistoryView';
import TournamentSettings from './components/TournamentSettings';
import PlayersRating from './components/PlayersRating';
import PlayerStats from './components/PlayerStats';
import DataManagement from './components/DataManagement';
import { generateTeams, selectGameTeams, predictGameResult, generateFullSchedule } from './utils/teamGenerator';
import { 
  saveTournamentState, 
  loadTournamentState, 
  saveTournamentToHistory, 
  clearTournamentState,
  exportData,
  importData
} from './utils/storage';

const App = () => {
  // --- Основные состояния ---
  const [screen, setScreen] = useState('input');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [results, setResults] = useState([]);
  const [currentGameTeams, setCurrentGameTeams] = useState([]);
  const [restingTeams, setRestingTeams] = useState([]);
  const [format, setFormat] = useState(null);
  const [settings, setSettings] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [fullSchedule, setFullSchedule] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  
  // --- UI состояния ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifications] = useState([]);
  const [showDataImport, setShowDataImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  // --- Состояния для защиты от случайного сброса ---
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingPlayersList, setPendingPlayersList] = useState(null);

  // --- Эффект для настройки темной темы ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // --- Предупреждение о перезагрузке при активном турнире ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Проверяем, есть ли активный турнир
      if (players.length > 0 || teams.length > 0 || games.length > 0) {
        const confirmationMessage = 'У вас есть незавершённый турнир. Если вы покинете страницу, все несохранённые данные будут потеряны. Продолжить?';
        e.preventDefault();
        e.returnValue = confirmationMessage;
        return confirmationMessage;
      }
      // В противном случае не показываем предупреждение
      return undefined;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [players, teams, games]);
  
  // --- Обработчик переключения темы ---
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // --- Загрузка настроек турнира ---
  useEffect(() => {
    const savedSettings = localStorage.getItem('tournamentSettings');
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      const defaultSettings = {
        useBalancing: true,
        maxScoreRounds: {
          full: 25,
          triples: 15,
          doubles: 25
        },
        minPointDifference: 2,
        roundDuration: 10,
        showTeamRatings: true,
        showPredictions: true,
        pointsForWin: 3,
        pointsForLoseGood: 2,
        pointsForLoseBad: 1,
        useTotalPointsForTie: true
      };
      
      setSettings(defaultSettings);
      localStorage.setItem('tournamentSettings', JSON.stringify(defaultSettings));
    }
  }, []);

  // --- Загрузка состояния турнира ---
  useEffect(() => {
    const savedState = loadTournamentState();
    if (savedState) {
      setPlayers(savedState.players || []);
      setTeams(savedState.teams || []);
      setGames(savedState.games || []);
      setResults(savedState.results || []);
      setFormat(savedState.format || null);
      setScreen(savedState.screen || 'input');
      setFullSchedule(savedState.fullSchedule || []);
      setCurrentRound(savedState.currentRound || 0);
      
      if (savedState.currentRound !== undefined && savedState.fullSchedule && savedState.fullSchedule.length > 0) {
        const roundInfo = savedState.fullSchedule[savedState.currentRound];
        if (roundInfo) {
          setCurrentGameTeams(roundInfo.gameTeams);
          setRestingTeams(roundInfo.resting);
        }
      }
    }
  }, []);

  // --- Сохранение состояния турнира ---
  useEffect(() => {
    saveTournamentState({
      screen,
      players,
      teams,
      games,
      results,
      format,
      fullSchedule,
      currentRound
    });
  }, [screen, players, teams, games, results, format, fullSchedule, currentRound]);

  // --- Функция для показа уведомлений ---
  const showNotification = useCallback((title, message, type = 'info') => {
    const id = Date.now();
    const icons = {
      success: <FaCheck className="text-green-500" />,
      warning: <FaExclamationTriangle className="text-amber-500" />,
      error: <FaExclamationTriangle className="text-red-500" />,
      info: <FaInfoCircle className="text-blue-500" />
    };
    
    setNotifications(prev => [...prev, { 
      id, 
      title, 
      message, 
      type, 
      icon: icons[type] || icons.info,
      time: new Date() 
    }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);
  
  // --- Закрыть одно уведомление ---
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // --- Функция для логики запуска нового турнира ---
  const startNewTournament = useCallback((playersList) => {
    clearTournamentState();
    setPlayers(playersList);

    // Генерация команд с балансировкой
    const newTeams = generateTeams(playersList, settings?.useBalancing);
    setTeams(newTeams);

    // Определение формата
    let newFormat;
    if (playersList.length <= 14) newFormat = 'full';
    else if (playersList.length === 15 || playersList.length === 18) newFormat = 'triples';
    else newFormat = 'doubles';
    setFormat(newFormat);

    // Инициализация результатов
    const initialResults = newTeams.map(team => ({
      name: team.name,
      points: 0,
      wins: 0,
      scoreDiff: 0,
      gamesPlayed: 0,
      setsWon: 0,
      setsLost: 0
    }));
    setResults(initialResults);

    // Генерация полного расписания и установка первого раунда
    const schedule = generateFullSchedule(newTeams, newFormat);
    setFullSchedule(schedule);
    setCurrentRound(0);
    if (schedule && schedule.length > 0) {
      setCurrentGameTeams(schedule[0].gameTeams);
      setRestingTeams(schedule[0].resting || []);
    }

    setGames([]);
    setScreen('game');
    
    // Сбрасываем диалог подтверждения
    setShowResetConfirm(false);
    setPendingPlayersList(null);
    
    // Показать уведомление
    showNotification(
      'Турнир создан', 
      `Команды сформированы и расписание готово (${schedule.length} игр). Формат: ${
        newFormat === 'full' ? 'полные команды' : newFormat === 'triples' ? 'тройки' : 'двойки'
      }`,
      'success'
    );
  }, [settings, showNotification]);

  // --- Запуск турнира с проверкой наличия активного турнира ---
  const handleStartTournament = useCallback((playersList) => {
    // Проверка, запущен ли активный турнир (есть ли команды и игроки)
    const isActiveTournament = players.length > 0 && teams.length > 0;
    
    if (isActiveTournament) {
      // Если есть активный турнир, показываем диалог подтверждения
      setPendingPlayersList(playersList);
      setShowResetConfirm(true);
    } else {
      // Если активного турнира нет, сразу запускаем новый
      startNewTournament(playersList);
    }
  }, [players, teams, startNewTournament]);

  // --- Сброс турнира ---
  const handleNewTournament = useCallback(() => {
    // Проверка, есть ли активный турнир
    const isActiveTournament = players.length > 0 && teams.length > 0;
    
    if (isActiveTournament) {
      // Если есть активный турнир, показываем диалог подтверждения
      setShowResetConfirm(true);
      setPendingPlayersList(null); // Это важно! Null означает, что мы просто сбрасываем турнир, а не начинаем новый
    } else {
      // Если активного турнира нет, сразу переходим на экран ввода игроков
      setScreen('input');
    }
  }, [players, teams]);

  // --- Подтверждение сброса турнира ---
  const confirmResetTournament = useCallback(() => {
    if (pendingPlayersList) {
      // Если у нас есть ожидающий список игроков, запускаем новый турнир с ними
      startNewTournament(pendingPlayersList);
    } else {
      // Иначе просто сбрасываем текущий турнир
      clearTournamentState();
      setPlayers([]);
      setTeams([]);
      setGames([]);
      setResults([]);
      setCurrentGameTeams([]);
      setRestingTeams([]);
      setFormat(null);
      setFullSchedule([]);
      setCurrentRound(0);
      setScreen('input');
      setShowResetConfirm(false);
      
      showNotification('Новый турнир', 'Прошлый турнир очищен, можно начинать новый.', 'info');
    }
  }, [pendingPlayersList, startNewTournament, showNotification]);

  // --- Отмена сброса турнира ---
  const cancelResetTournament = useCallback(() => {
    setPendingPlayersList(null);
    setShowResetConfirm(false);
  }, []);

  // --- Начало игры из списка игр ---
  const handleStartGame = useCallback((round) => {
    if (fullSchedule && fullSchedule.length > 0) {
      const gameInfo = fullSchedule[round - 1];
      if (gameInfo) {
        setCurrentRound(round - 1);
        setCurrentGameTeams(gameInfo.gameTeams);
        setRestingTeams(gameInfo.resting || []);
        setScreen('game');
        
        showNotification(
          'Игра начата', 
          `Раунд ${round} начинается. Команда ${gameInfo.gameTeams[0].name} против ${gameInfo.gameTeams[1].name}`, 
          'info'
        );
      }
    }
  }, [fullSchedule, showNotification]);

  // --- Завершение игры ---
  const handleGameEnd = useCallback(({ score1, score2, teams }) => {
    // Используем настройки для максимального счета и очков за игры
    const maxScore = settings?.maxScoreRounds?.[format] || (format === 'triples' ? 15 : 25);
    const winner = score1 > score2 ? 0 : 1;
    const loser = 1 - winner;

    // Определение сетов
    const set1Team1Win = score1 > score2;
    const set1Team2Win = !set1Team1Win;
    
    const team1SetsWon = set1Team1Win ? 1 : 0;
    const team2SetsWon = set1Team2Win ? 1 : 0;

    // Очки на основе настроек
    const pointsForWin = settings?.pointsForWin || 3;
    const pointsForLoseGood = settings?.pointsForLoseGood || 2;
    const pointsForLoseBad = settings?.pointsForLoseBad || 1;
    
    // Определяем очки команд на основе результата
    const loserScore = winner === 0 ? score2 : score1;
    const loserPoints = loserScore >= 10 ? pointsForLoseGood : pointsForLoseBad;
    
    const points1 = winner === 0 ? pointsForWin : loserPoints;
    const points2 = winner === 1 ? pointsForWin : loserPoints;

    const newGame = {
      teams,
      score1,
      score2,
      points1,
      points2,
      timestamp: new Date(),
      round: currentRound + 1,
      set1Team1Win,
      set1Team2Win,
      team1SetsWon,
      team2SetsWon
    };
    setGames((prev) => [...prev, newGame]);

    setResults((prev) =>
      prev.map((r) => {
        const teamIdx = teams.findIndex((t) => t.name === r.name);
        if (teamIdx === -1) return r; // не участвовала в игре
        return {
          ...r,
          points: r.points + (teamIdx === 0 ? points1 : points2),
          wins: r.wins + (teamIdx === winner ? 1 : 0),
          losses: r.losses + (teamIdx === loser ? 1 : 0),
          scoreDiff: r.scoreDiff + (teamIdx === 0 ? score1 - score2 : score2 - score1),
          gamesPlayed: r.gamesPlayed + 1,
          setsWon: r.setsWon + (teamIdx === 0 ? team1SetsWon : team2SetsWon),
          setsLost: r.setsLost + (teamIdx === 0 ? team2SetsWon : team1SetsWon),
        };
      })
    );

    // Проверка завершения турнира по полному расписанию
    const isTournamentOver = currentRound + 1 >= fullSchedule.length;

    if (isTournamentOver) {
      saveTournamentToHistory({
        teams,
        games: [...games, newGame],
        results,
      });
      setScreen('results');
      showNotification(
        'Турнир завершен', 
        'Все игры сыграны! Проверьте итоговую таблицу результатов.', 
        'success'
      );
    } else {
      // Переход к следующему раунду полного расписания
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      const next = fullSchedule[nextRound];
      if (next) {
        setCurrentGameTeams(next.gameTeams);
        setRestingTeams(next.resting || []);
      }
      
      // Переходим к списку игр после завершения матча
      setScreen('games');
      showNotification(
        'Игра завершена', 
        `Раунд ${currentRound + 1} завершён со счётом ${score1}:${score2}.`, 
        'info'
      );
    }
  }, [format, fullSchedule, currentRound, games, results, settings, showNotification]);

  // --- Обработчик обновления настроек ---
  const handleSettingsUpdate = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('tournamentSettings', JSON.stringify(newSettings));
    setScreen('input');
    showNotification('Настройки сохранены', 'Изменения настроек применены к турниру.', 'success');
  }, [showNotification]);

  // --- Просмотр статистики игрока ---
  const handleViewPlayerStats = useCallback((playerName) => {
    setSelectedPlayer(playerName);
    setScreen('playerStats');
  }, []);

  // --- Экспорт данных ---
  const handleExportData = useCallback(() => {
    const success = exportData();
    if (success) {
      showNotification('Экспорт данных', 'Данные успешно экспортированы в файл.', 'success');
    } else {
      showNotification('Ошибка экспорта', 'Произошла ошибка при экспорте данных.', 'error');
    }
  }, [showNotification]);

  // --- Импорт данных ---
  const handleImportData = useCallback(() => {
    if (!importFile) {
      showNotification('Ошибка импорта', 'Файл не выбран.', 'warning');
      return;
    }
    
    setIsDataLoading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = event.target.result;
        const success = importData(jsonData);
        
        if (success) {
          showNotification('Импорт данных', 'Данные успешно импортированы.', 'success');
          // Перезагрузить страницу для применения импортированных данных
          window.location.reload();
        } else {
          showNotification('Ошибка импорта', 'Ошибка при импорте данных.', 'error');
        }
      } catch (error) {
        showNotification('Ошибка импорта', 'Файл содержит неверный формат данных.', 'error');
      } finally {
        setIsDataLoading(false);
        setShowDataImport(false);
        setImportFile(null);
      }
    };
    
    reader.onerror = () => {
      showNotification('Ошибка импорта', 'Не удалось прочитать файл.', 'error');
      setIsDataLoading(false);
      setShowDataImport(false);
      setImportFile(null);
    };
    
    reader.readAsText(importFile);
  }, [importFile, showNotification]);

  // --- Определяем активный элемент меню ---
  const isMenuActive = useCallback((screenName) => {
    if (screenName === 'playerStats' && screen === 'playerStats') return true;
    return screen === screenName;
  }, [screen]);

  // --- Отображение компонента в зависимости от текущего экрана ---
  const renderContent = useCallback(() => {
    switch (screen) {
      case 'input':
        return <PlayerInput onStartTournament={handleStartTournament} />;
      case 'game':
        return currentGameTeams.length > 0 ? (
          <GameBoard
            teams={currentGameTeams}
            resting={restingTeams}
            onGameEnd={handleGameEnd}
            settings={settings}
          />
        ) : null;
      case 'games':
        return <GameList 
          games={games} 
          teams={teams} 
          fullSchedule={fullSchedule}
          currentRound={currentRound}
          onStartGame={handleStartGame}
          onBack={() => setScreen('game')} 
        />;
      case 'results':
        return <ResultsTable results={results} />;
      case 'history':
        return <HistoryView onViewStats={handleViewPlayerStats} />;
      case 'settings':
        return <TournamentSettings 
          settings={settings} 
          onBack={() => setScreen('input')} 
          onSave={handleSettingsUpdate} 
        />;
      case 'players':
        return <PlayersRating onViewPlayerStats={handleViewPlayerStats} />;
      case 'playerStats':
        return <PlayerStats playerName={selectedPlayer} onBack={() => setScreen('players')} />;
      case 'data':
        return <DataManagement 
          onBack={() => setScreen('input')} 
          onExport={handleExportData}
          onShowImport={() => setShowDataImport(true)}
        />;
      default:
        return <PlayerInput onStartTournament={handleStartTournament} />;
    }
  }, [
    screen, handleStartTournament, currentGameTeams, restingTeams, 
    handleGameEnd, settings, games, teams, results, fullSchedule, currentRound,
    handleViewPlayerStats, handleSettingsUpdate, selectedPlayer, handleStartGame,
    handleExportData
  ]);

  // --- Определение классов для темы ---
  const themeClasses = {
    background: darkMode 
      ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
      : 'bg-gray-50 text-[#06324F]',
    sidebar: darkMode 
      ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' 
      : 'bg-white border-[#0B8E8D]/20',
    activeMenu: darkMode 
      ? 'bg-gradient-to-r from-[#0B8E8D] to-[#0B8E8D]/70 text-white shadow-lg' 
      : 'bg-gradient-to-r from-[#0B8E8D] to-[#06324F] text-white shadow-md',
    hoverMenu: darkMode 
      ? 'hover:bg-gray-700' 
      : 'hover:bg-[#0B8E8D]/10',
    cardBg: darkMode 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-[#0B8E8D]/20',
    input: darkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#0B8E8D] focus:ring-[#0B8E8D]'
      : 'bg-white border-gray-300 focus:border-[#0B8E8D] focus:ring-[#0B8E8D]',
    title: darkMode
      ? 'text-white'
      : 'text-[#06324F]',
    subtitle: darkMode
      ? 'text-gray-300'
      : 'text-[#0B8E8D]',
    button: darkMode
      ? 'bg-[#0B8E8D] hover:bg-[#0B8E8D]/90 text-white'
      : 'bg-gradient-to-r from-[#0B8E8D] to-[#06324F] hover:opacity-90 text-white',
    accent: '[#0B8E8D]'
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${themeClasses.background} transition-colors duration-300`}>
      {/* Header для мобильных */}
      <header className="md:hidden flex items-center justify-between p-4 bg-gradient-to-r from-[#0B8E8D] to-[#06324F] text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center">
          <FaVolleyballBall className="mr-2" />
          <h1 className="text-xl font-bold">Volleyball Турнир</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label={darkMode ? "Включить светлую тему" : "Включить тёмную тему"}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className={`w-72 h-full ${themeClasses.sidebar} shadow-xl transform transition-transform p-4`}
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-6 border-b border-[#0B8E8D]/20 pb-4">
              <div className="flex items-center mb-4">
                <FaVolleyballBall className="mr-2 text-[#0B8E8D]" />
                <h2 className="text-xl font-bold">Volleyball Турнир</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={toggleDarkMode}
                  className={`flex-1 flex items-center justify-center p-2 rounded-md ${darkMode ? 'bg-[#0B8E8D]' : 'bg-gray-200 text-gray-800'} transition-colors`}
                >
                  {darkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
                  {darkMode ? 'Светлая тема' : 'Тёмная тема'}
                </button>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
              <button
                onClick={() => {
                  handleNewTournament();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('input') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
              >
                <FaVolleyballBall className="mr-3" /> Новый турнир
              </button>
              <button
                onClick={() => {
                  setScreen('games');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('games') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
              >
                <FaUsers className="mr-3" /> Игры
              </button>
              <button
                onClick={() => {
                  setScreen('results');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('results') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
              >
                <FaTrophy className="mr-3" /> Результаты
              </button>
              <button
                onClick={() => {
                  setScreen('history');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('history') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
              >
                <FaHistory className="mr-3" /> История
              </button>
              <div className="pt-2 border-t border-[#0B8E8D]/10 mt-2"></div>
              <button
                onClick={() => {
                  setScreen('players');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('players') || isMenuActive('playerStats') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
              >
                <FaChartBar className="mr-3" /> Рейтинг игроков
              </button>
              <button
                onClick={() => {
                  setScreen('settings');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('settings') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
              >
                <FaCog className="mr-3" /> Настройки
              </button>
              <button
                onClick={() => {
                  setScreen('data');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('data') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
              >
                <FaDownload className="mr-3" /> Управление данными
              </button>
              <button
                onClick={() => {
                  setShowRules(true);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-[#FDD80F]/10`}
              >
                <FaGlobe className="mr-3 text-[#FDD80F]" /> Правила
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar для desktop */}
      <aside className={`hidden md:block md:w-64 ${themeClasses.sidebar} shadow-md md:h-screen md:sticky md:top-0 z-40 md:border-r shrink-0 transition-colors duration-300`}>
        <div className="p-4 border-b border-[#0B8E8D]/20 flex justify-between items-center">
          <h1 className={`text-xl font-bold ${themeClasses.title} flex items-center`}>
            <FaVolleyballBall className="mr-2 text-[#0B8E8D]" /> Volleyball Турнир
          </h1>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
            title={darkMode ? "Включить светлую тему" : "Включить тёмную тему"}
            aria-label={darkMode ? "Включить светлую тему" : "Включить тёмную тему"}
          >
            {darkMode ? <FaSun className="text-yellow-300" /> : <FaMoon className="text-gray-600" />}
          </button>
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={handleNewTournament}
            className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('input') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
          >
            <FaVolleyballBall className="mr-3" /> Новый турнир
          </button>
          <button
            onClick={() => setScreen('games')}
            className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('games') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
          >
            <FaUsers className="mr-3" /> Игры
          </button>
          <button
            onClick={() => setScreen('results')}
            className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('results') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
          >
            <FaTrophy className="mr-3" /> Результаты
          </button>
          <button
            onClick={() => setScreen('history')}
            className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('history') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
          >
            <FaHistory className="mr-3" /> История
          </button>
          
          <div className="pt-2 border-t border-[#0B8E8D]/10 mt-2"></div>
          
          <button
            onClick={() => setScreen('players')}
            className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('players') || isMenuActive('playerStats') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
          >
            <FaChartBar className="mr-3" /> Рейтинг игроков
          </button>
          <button
            onClick={() => setScreen('settings')}
            className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('settings') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
          >
            <FaCog className="mr-3" /> Настройки
          </button>
          <button
            onClick={() => setScreen('data')}
            className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 ${isMenuActive('data') ? themeClasses.activeMenu : themeClasses.hoverMenu}`}
          >
            <FaDownload className="mr-3" /> Управление данными
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-[#FDD80F]/10 text-[#FDD80F]"
          >
            <FaGlobe className="mr-3" /> Правила
          </button>
        </div>
      </aside>
 
      {/* Основное содержимое */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {renderContent()}
      </main>
 
      {/* Модальное окно импорта данных */}
      {showDataImport && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden bg-white rounded-xl shadow-xl">
            <div className="modal-header">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Импорт данных</h2>
                <button onClick={() => setShowDataImport(false)} className="text-white hover:text-accent transition-colors duration-150 text-3xl leading-none">
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
              <p className="mb-4">Выберите файл JSON для импорта:</p>
              <input 
                type="file" 
                accept=".json" 
                onChange={(e) => setImportFile(e.target.files[0])} 
                className="block w-full mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan file:text-white hover:file:bg-cyan/90"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDataImport(false)}
                  className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Отмена
                </button>
                <button
                  onClick={handleImportData}
                  disabled={!importFile || isDataLoading}
                  className="btn btn-accent flex items-center"
                >
                  {isDataLoading ? (
                    <>
                      <FaSyncAlt className="animate-spin mr-2" /> Импорт...
                    </>
                  ) : (
                    <>
                      <FaDownload className="mr-2" /> Импортировать
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* Модальное окно подтверждения сброса турнира */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden bg-white rounded-xl shadow-xl">
            <div className="modal-header">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Сбросить текущий турнир?</h2>
                <button 
                  onClick={cancelResetTournament} 
                  className="text-white hover:text-accent transition-colors duration-150 text-3xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
              <p className="mb-4">У вас уже запущен турнир. Все данные будут потеряны! Вы уверены, что хотите сбросить его {pendingPlayersList ? "и начать новый" : ""}?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelResetTournament}
                  className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Отмена
                </button>
                <button
                  onClick={pendingPlayersList ? () => startNewTournament(pendingPlayersList) : confirmResetTournament}
                  className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {pendingPlayersList ? "Сбросить и начать новый" : "Сбросить турнир"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* Модальное окно правил */}
      {showRules && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-xl shadow-xl">
            <div className="bg-gradient-to-r from-darkBlue to-cyan text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Правила турнира</h2>
                <button onClick={() => setShowRules(false)} className="text-white hover:text-accent transition-colors duration-150 text-3xl leading-none">
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto bg-white rounded-b-xl">
              <div className="text-darkBlue">
                <h3 className="text-xl font-bold mb-3">Основные принципы турнира</h3>
                <ul className="list-disc pl-5 mb-5 space-y-2">
                  <li><span className="font-semibold">Гибкость формата:</span> Поддержка разных форматов команд — полноценные команды (6–7 человек), тройки или двойки.</li>
                  <li><span className="font-semibold">Рандомизация составов:</span> Составы меняются перед каждым раундом для разнообразия и баланса.</li>
                  <li><span className="font-semibold">Справедливость:</span> Равное игровое время для всех участников.</li>
                  <li><span className="font-semibold">Прозрачность:</span> Доступная история результатов и статистика.</li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3">Форматы турнира</h3>
                <ul className="list-disc pl-5 mb-5 space-y-3">
                  <li>
                    <span className="font-semibold">Полноценные команды (12–14 участников):</span>
                    <ul className="list-circle pl-5 mt-1 space-y-1">
                      <li>Две команды по 6–7 человек</li>
                      <li>Игра до 25 очков с минимальной разницей в 2 очка</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Формат троек (15 или 18 участников):</span>
                    <ul className="list-circle pl-5 mt-1 space-y-1">
                      <li>5–6 троек (по 3 человека)</li>
                      <li>Игра до 15 очков</li>
                      <li>Одна тройка отдыхает в каждом раунде</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Формат двоек (16–17 участников):</span>
                    <ul className="list-circle pl-5 mt-1 space-y-1">
                      <li>8 двоек (по 2 человека)</li>
                      <li>10-минутные матчи до 25 очков с разницей в 2 очка</li>
                      <li>Две двойки отдыхают в каждом раунде</li>
                    </ul>
                  </li>
                </ul>
                
                <h3 className="text-xl font-bold mb-3">Подсчёт очков</h3>
                <p className="mb-2">Очки начисляются по единой системе:</p>
                <ul className="list-disc pl-5 mb-5 space-y-1">
                  <li>3 очка: за победу</li>
                  <li>2 очка: за поражение, если команда набрала 10 или более очков</li>
                  <li>1 очко: за поражение, если команда набрала менее 10 очков</li>
                </ul>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowRules(false)} className="px-4 py-2 bg-gradient-to-r from-[#0B8E8D] to-[#06324F] text-white rounded-lg hover:opacity-90 transition-opacity">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* Уведомления */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 max-w-md z-50">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-3 rounded-lg shadow-lg backdrop-blur-sm flex items-start gap-3 transition-all duration-300 animate-fadeIn
              ${notification.type === 'success' ? 'bg-green-100/90 text-green-800' :
                notification.type === 'warning' ? 'bg-amber-100/90 text-amber-800' :
                notification.type === 'error' ? 'bg-red-100/90 text-red-800' :
                'bg-blue-100/90 text-blue-800'
              }`}
          >
            <div className="mt-1">{notification.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-sm">{notification.message}</p>
            </div>
            <button 
              onClick={() => dismissNotification(notification.id)} 
              className="text-lg leading-none hover:text-accent transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
 
export default App;