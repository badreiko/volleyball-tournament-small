import { useState } from 'react';
import { FaArrowLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown, FaFilter, FaPlay, FaCheck } from 'react-icons/fa';
import { t } from '../localization';

const GameList = ({ games, onBack, teams, fullSchedule, currentRound, onStartGame }) => {
  const [sortBy, setSortBy] = useState('round');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilter, setShowFilter] = useState(false);
  const [filterTeam, setFilterTeam] = useState('');
  
  // Функция сортировки игр
  const sortGames = (a, b) => {
    switch (sortBy) {
      case 'round':
        return sortDirection === 'asc' 
          ? a.round - b.round
          : b.round - a.round;
      case 'date':
        if (!a.timestamp && !b.timestamp) return 0;
        if (!a.timestamp) return sortDirection === 'desc' ? -1 : 1;
        if (!b.timestamp) return sortDirection === 'desc' ? 1 : -1;
        return sortDirection === 'asc' 
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      case 'score':
        if (a.isUpcoming && b.isUpcoming) return 0;
        if (a.isUpcoming) return sortDirection === 'desc' ? -1 : 1;
        if (b.isUpcoming) return sortDirection === 'desc' ? 1 : -1;
        const scoreA = Math.max(a.score1, a.score2);
        const scoreB = Math.max(b.score1, b.score2);
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      case 'team':
        const teamA = a.teams[0].name;
        const teamB = b.teams[0].name;
        return sortDirection === 'asc' 
          ? teamA.localeCompare(teamB)
          : teamB.localeCompare(teamA);
      default:
        return 0;
    }
  };
  
  // Функция для смены поля сортировки
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection(field === 'round' ? 'asc' : 'desc');
    }
  };
  
  // Функция получения иконки сортировки
  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="ml-1 text-darkBlue/40" />;
    return sortDirection === 'asc' 
      ? <FaSortUp className="ml-1 text-cyan" /> 
      : <FaSortDown className="ml-1 text-cyan" />;
  };
  
  // Формируем полный список игр включая будущие
  const allGames = [...games];
  const playedGameRounds = new Set(games.map(game => game.round));
  
  // Добавляем непроигранные игры из расписания
  if (fullSchedule && fullSchedule.length > 0) {
    fullSchedule.forEach(scheduleItem => {
      if (!playedGameRounds.has(scheduleItem.round)) {
        allGames.push({
          teams: scheduleItem.gameTeams,
          score1: '-',
          score2: '-',
          points1: '-',
          points2: '-',
          timestamp: null,
          round: scheduleItem.round,
          isUpcoming: true,
          resting: scheduleItem.resting
        });
      }
    });
  }
  
  // Фильтрация игр по команде
  const filteredGames = filterTeam
    ? allGames.filter(game => 
        game.teams.some(team => 
          team.name.toLowerCase().includes(filterTeam.toLowerCase()) ||
          team.players.some(player => 
            player.toLowerCase().includes(filterTeam.toLowerCase())
          )
        )
      )
    : allGames;
  
  // Отсортированные игры
  const sortedGames = [...filteredGames].sort(sortGames);
  
  // Формируем информацию о следующей игре, если она предоставлена
  const renderNextGame = () => {
    // Находим первую непроигранную игру
    const nextGame = sortedGames.find(game => game.isUpcoming);
    
    if (!nextGame) return null;
    
    return (
      <div className="p-4 rounded-md bg-gradient-to-r from-cyan/20 to-darkBlue/10 border-l-4 border-cyan mb-6">
        <h3 className="font-semibold text-darkBlue flex items-center">
          <FaChevronRight className="mr-2 text-cyan" /> {t('gameList.nextGame')} ({t('gameList.round')} {nextGame.round})
        </h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="col-span-1 sm:text-right px-2">
            <div className="font-semibold text-darkBlue">{nextGame.teams[0].name}</div>
            <div className="text-sm text-darkBlue/70">
              {nextGame.teams[0].teamRating && `${t('playersRating.rating')}: ${nextGame.teams[0].teamRating}`}
            </div>
          </div>
          <div className="col-span-1 text-center flex items-center justify-center">
            <span className="text-darkBlue/70 text-xl font-bold">vs</span>
          </div>
          <div className="col-span-1 px-2">
            <div className="font-semibold text-darkBlue">{nextGame.teams[1].name}</div>
            <div className="text-sm text-darkBlue/70">
              {nextGame.teams[1].teamRating && `${t('playersRating.rating')}: ${nextGame.teams[1].teamRating}`}
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <p className="text-sm text-darkBlue/70">
            <span className="font-semibold">{t('gameList.lineup')} {nextGame.teams[0].name}:</span> {nextGame.teams[0].players.join(', ')}
          </p>
          <p className="text-sm text-darkBlue/70">
            <span className="font-semibold">{t('gameList.lineup')} {nextGame.teams[1].name}:</span> {nextGame.teams[1].players.join(', ')}
          </p>
          
          {nextGame.resting && nextGame.resting.length > 0 && (
            <p className="text-sm text-darkBlue/70">
              <span className="font-semibold">{t('gameList.restingTeams')}</span> {nextGame.resting.map(team => team.name).join(', ')}
            </p>
          )}
        </div>
        
        {nextGame.round === currentRound + 1 && (
          <div className="mt-4 text-center">
            <button onClick={() => onStartGame(nextGame.round)} className="btn btn-cyan inline-block">
              <FaPlay className="mr-2 inline" /> {t('gameList.startGame')}
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Формирование списка уникальных команд
  const uniqueTeams = new Set();
  allGames.forEach(game => {
    game.teams.forEach(team => {
      uniqueTeams.add(team.name);
      team.players.forEach(player => uniqueTeams.add(player));
    });
  });
  const teamFilterOptions = Array.from(uniqueTeams).sort();

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack} 
          className="p-2 rounded-full bg-darkBlue/10 hover:bg-darkBlue/20 transition-colors mr-3"
          aria-label={t('common.back')}
        >
          <FaArrowLeft className="text-darkBlue" />
        </button>
        <h2 className="text-2xl font-bold text-darkBlue">{t('gameList.scheduleTitle')}</h2>
      </div>
      
      <div className="card mx-auto max-w-4xl fade-in">
        {/* Опции сортировки и фильтрации */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => handleSort('round')} 
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                sortBy === 'round' ? 'bg-cyan/20 text-darkBlue' : 'bg-darkBlue/5 text-darkBlue/70'
              }`}
            >
              {t('gameList.sortByRound')} {getSortIcon('round')}
            </button>
            <button 
              onClick={() => handleSort('date')} 
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                sortBy === 'date' ? 'bg-cyan/20 text-darkBlue' : 'bg-darkBlue/5 text-darkBlue/70'
              }`}
            >
              {t('gameList.sortByDate')} {getSortIcon('date')}
            </button>
            <button 
              onClick={() => handleSort('score')} 
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                sortBy === 'score' ? 'bg-cyan/20 text-darkBlue' : 'bg-darkBlue/5 text-darkBlue/70'
              }`}
            >
              {t('gameList.sortByScore')} {getSortIcon('score')}
            </button>
            <button 
              onClick={() => handleSort('team')} 
              className={`px-3 py-1 rounded-md text-sm flex items-center ${
                sortBy === 'team' ? 'bg-cyan/20 text-darkBlue' : 'bg-darkBlue/5 text-darkBlue/70'
              }`}
            >
              {t('gameList.sortByTeam')} {getSortIcon('team')}
            </button>
          </div>
          <button 
            onClick={() => setShowFilter(!showFilter)} 
            className="px-3 py-1 rounded-md text-sm flex items-center bg-darkBlue/5 text-darkBlue/70"
          >
            <FaFilter className="mr-1" /> {t('gameList.filter')}
          </button>
        </div>
        
        {/* Фильтр по команде */}
        {showFilter && (
          <div className="mb-6 p-3 bg-darkBlue/5 rounded-lg">
            <div className="mb-2 text-sm text-darkBlue/70">{t('gameList.filterByTeamOrPlayer')}:</div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                placeholder={t('gameList.filterPlaceholder')}
                className="flex-1 p-2 text-sm rounded border border-darkBlue/30 focus:outline-none focus:ring-1 focus:ring-cyan"
              />
              <button 
                onClick={() => setFilterTeam('')}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                {t('gameList.resetFilter')}
              </button>
            </div>
            {teamFilterOptions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {teamFilterOptions.slice(0, 10).map((team, index) => (
                  <button 
                    key={index}
                    onClick={() => setFilterTeam(team)}
                    className="px-2 py-1 text-xs bg-cyan/10 text-darkBlue rounded hover:bg-cyan/20 transition-colors"
                  >
                    {team}
                  </button>
                ))}
                {teamFilterOptions.length > 10 && (
                  <span className="px-2 py-1 text-xs text-darkBlue/50">и ещё {teamFilterOptions.length - 10}...</span>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Информация о следующей игре */}
        {renderNextGame()}
        
        {/* Список игр */}
        {allGames.length === 0 ? (
          <div className="p-8 text-center bg-darkBlue/5 rounded-lg">
            <p className="text-darkBlue text-lg">{t('gameList.noSchedule')}</p>
            <p className="text-darkBlue/70 mt-2">{t('gameList.scheduleMessage')}</p>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold text-darkBlue mb-3">{t('gameList.totalGames')}: {sortedGames.length}</h3>
            <div className="space-y-4">
              {sortedGames.map((game, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-md ${
                    game.isUpcoming 
                      ? 'bg-darkBlue/5 border border-darkBlue/10' 
                      : 'bg-cyan/10 border border-cyan/20'
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <h3 className="font-semibold text-darkBlue flex items-center">
                      {t('gameList.game')} {game.round} 
                      {game.isUpcoming && 
                        <span className="ml-2 text-sm bg-darkBlue/10 px-2 py-0.5 rounded-full">
                          {t('gameList.upcoming')}
                        </span>
                      }
                    </h3>
                    <div className="text-sm text-darkBlue/70">
                      {game.timestamp ? new Date(game.timestamp).toLocaleString() : t('gameList.notPlayed')}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 mb-3">
                    <div className="col-span-3 sm:text-right">
                      <div className="font-semibold text-darkBlue">{game.teams[0].name}</div>
                      <div className={`text-xl font-bold ${
                        !game.isUpcoming && game.score1 > game.score2 
                          ? 'text-green-600' 
                          : (!game.isUpcoming ? 'text-red-600' : 'text-darkBlue/50')
                      }`}>
                        {game.score1}
                      </div>
                      <div className="text-sm text-darkBlue/70">
                        {t('gameList.points')} {game.points1}
                      </div>
                    </div>
                    <div className="col-span-1 text-center flex items-center justify-center">
                      <span className="text-darkBlue/70 font-bold">:</span>
                    </div>
                    <div className="col-span-3">
                      <div className="font-semibold text-darkBlue">{game.teams[1].name}</div>
                      <div className={`text-xl font-bold ${
                        !game.isUpcoming && game.score2 > game.score1 
                          ? 'text-green-600' 
                          : (!game.isUpcoming ? 'text-red-600' : 'text-darkBlue/50')
                      }`}>
                        {game.score2}
                      </div>
                      <div className="text-sm text-darkBlue/70">
                        {t('gameList.points')} {game.points2}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2 pt-2 border-t border-darkBlue/10">
                    <p className="text-sm text-darkBlue/70">
                      <span className="font-semibold">{t('gameList.lineup')} {game.teams[0].name}:</span> {game.teams[0].players.join(', ')}
                    </p>
                    <p className="text-sm text-darkBlue/70">
                      <span className="font-semibold">{t('gameList.lineup')} {game.teams[1].name}:</span> {game.teams[1].players.join(', ')}
                    </p>
                    
                    {/* Отдыхающие команды */}
                    {game.resting && game.resting.length > 0 && (
                      <p className="text-sm text-darkBlue/70 mt-2">
                        <span className="font-semibold">{t('gameList.restingTeams')}</span> {game.resting.map(team => team.name).join(', ')}
                      </p>
                    )}
                  </div>
                  
                  {/* Кнопка начать игру для предстоящего матча */}
                  {game.isUpcoming && game.round === currentRound + 1 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => onStartGame(game.round)}
                        className="btn btn-cyan inline-flex items-center"
                      >
                        <FaPlay className="mr-2" /> {t('gameList.startGame')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <button onClick={onBack} className="btn btn-accent w-full">
            {t('gameList.returnToGame')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameList;