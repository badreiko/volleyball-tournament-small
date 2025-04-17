import { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaTrophy, 
  FaGamepad, 
  FaChartLine, 
  FaUsers, 
  FaHistory,
  FaStar,
  FaArrowLeft,
  FaCalendarAlt,
  FaExchangeAlt,
  FaBullseye
} from 'react-icons/fa';
import { getPlayerStats } from '../utils/storage';

const PlayerStats = ({ playerName, onBack }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    if (playerName) {
      const playerStats = getPlayerStats(playerName);
      setStats(playerStats);
      setLoading(false);
    }
  }, [playerName]);
  
  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-pulse text-cyan text-xl">Загрузка статистики...</div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="p-4 text-center">
        <div className="text-darkBlue text-xl mb-4">Статистика не найдена</div>
        <button onClick={onBack} className="btn btn-accent">
          <FaArrowLeft className="mr-2" /> Вернуться
        </button>
      </div>
    );
  }
  
  const winRatePercentage = Math.round(stats.winRate * 100);
  const lastActive = stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'Неизвестно';
  
  return (
    <div className="p-4 md:p-6">
      <button onClick={onBack} className="mb-4 flex items-center text-darkBlue hover:text-cyan transition-colors">
        <FaArrowLeft className="mr-2" /> Назад
      </button>
      
      <div className="card mx-auto max-w-4xl fade-in">
        {/* Шапка с основной информацией */}
        <div className="mb-6 flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-darkBlue to-cyan rounded-full flex items-center justify-center text-white text-3xl md:text-4xl">
            {playerName.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-darkBlue mb-2">{playerName}</h2>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="bg-cyan/10 px-3 py-1 rounded-full text-sm flex items-center">
                <FaStar className="text-cyan mr-1" /> Рейтинг: {stats.rating}
              </div>
              <div className="bg-cyan/10 px-3 py-1 rounded-full text-sm flex items-center">
                <FaGamepad className="text-cyan mr-1" /> Игр: {stats.totalGames}
              </div>
              <div className="bg-cyan/10 px-3 py-1 rounded-full text-sm flex items-center">
                <FaTrophy className="text-cyan mr-1" /> Побед: {stats.totalWins}
              </div>
              <div className="bg-cyan/10 px-3 py-1 rounded-full text-sm flex items-center">
                <FaChartLine className="text-cyan mr-1" /> Винрейт: {winRatePercentage}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Вкладки */}
        <div className="border-b border-darkBlue/20 mb-4">
          <div className="flex overflow-x-auto">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-cyan text-cyan font-semibold' : 'text-darkBlue/70'}`}
            >
              Обзор
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'history' ? 'border-b-2 border-cyan text-cyan font-semibold' : 'text-darkBlue/70'}`}
            >
              История игр
            </button>
            <button 
              onClick={() => setActiveTab('partners')}
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'partners' ? 'border-b-2 border-cyan text-cyan font-semibold' : 'text-darkBlue/70'}`}
            >
              Партнеры
            </button>
          </div>
        </div>
        
        {/* Содержимое вкладки "Обзор" */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-cyan/10 to-darkBlue/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-darkBlue mb-3 flex items-center">
                  <FaChartLine className="mr-2 text-cyan" /> Статистика игр
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-darkBlue/70">Всего игр:</span>
                    <span className="font-semibold">{stats.totalGames}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-darkBlue/70">Победы:</span>
                    <span className="font-semibold">{stats.totalWins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-darkBlue/70">Процент побед:</span>
                    <span className="font-semibold">{winRatePercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-darkBlue/70">Всего очков:</span>
                    <span className="font-semibold">{stats.totalPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-darkBlue/70">Очков за игру (в среднем):</span>
                    <span className="font-semibold">{stats.totalGames > 0 ? (stats.totalPoints / stats.totalGames).toFixed(1) : '0'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-cyan/10 to-darkBlue/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-darkBlue mb-3 flex items-center">
                  <FaBullseye className="mr-2 text-cyan" /> Показатели
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-darkBlue/70">Текущий рейтинг:</span>
                    <span className="font-semibold">{stats.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-darkBlue/70">Всего набрано:</span>
                    <span className="font-semibold">{stats.totalScores || 0} очков</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-darkBlue/70">Средний счет за игру:</span>
                    <span className="font-semibold">{stats.averageScorePerGame ? stats.averageScorePerGame.toFixed(1) : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-darkBlue/70">Последняя активность:</span>
                    <span className="font-semibold">{lastActive}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-cyan/10 to-darkBlue/5 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-darkBlue mb-3 flex items-center">
                <FaExchangeAlt className="mr-2 text-cyan" /> Совместимость
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-darkBlue/70">Уникальных партнеров по команде:</span>
                  <span className="font-semibold">{stats.uniqueTeammates?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-darkBlue/70">Уникальных противников:</span>
                  <span className="font-semibold">{stats.uniqueOpponents?.length || 0}</span>
                </div>
              </div>
            </div>
            
            {stats.lastGames && stats.lastGames.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-darkBlue mb-3 flex items-center">
                  <FaHistory className="mr-2 text-cyan" /> Последние игры
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-darkBlue/20">
                        <th className="p-2">Дата</th>
                        <th className="p-2">Команда</th>
                        <th className="p-2">Счет</th>
                        <th className="p-2">Результат</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lastGames.slice(0, 5).map((game, index) => (
                        <tr key={index} className="border-b border-darkBlue/10">
                          <td className="p-2">{new Date(game.date).toLocaleDateString()}</td>
                          <td className="p-2">{game.team}</td>
                          <td className="p-2">{game.score}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${game.result === 'победа' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {game.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Содержимое вкладки "История игр" */}
        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-semibold text-darkBlue mb-3 flex items-center">
              <FaHistory className="mr-2 text-cyan" /> История игр
            </h3>
            
            {stats.lastGames && stats.lastGames.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-darkBlue/20">
                      <th className="p-2">Дата</th>
                      <th className="p-2">Команда</th>
                      <th className="p-2">Противник</th>
                      <th className="p-2">Счет</th>
                      <th className="p-2">Результат</th>
                      <th className="p-2">Очки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lastGames.map((game, index) => (
                      <tr key={index} className="border-b border-darkBlue/10">
                        <td className="p-2">{new Date(game.date).toLocaleDateString()}</td>
                        <td className="p-2">{game.team}</td>
                        <td className="p-2">{game.opponents}</td>
                        <td className="p-2">{game.score}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${game.result === 'победа' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {game.result}
                          </span>
                        </td>
                        <td className="p-2">{game.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-4 text-darkBlue/70">История игр не найдена</div>
            )}
          </div>
        )}
        
        {/* Содержимое вкладки "Партнеры" */}
        {activeTab === 'partners' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-darkBlue mb-3 flex items-center">
                  <FaUsers className="mr-2 text-cyan" /> Партнеры по команде
                </h3>
                
                {stats.uniqueTeammates && stats.uniqueTeammates.length > 0 ? (
                  <div className="bg-gradient-to-r from-cyan/10 to-darkBlue/5 p-4 rounded-lg">
                    <ul className="space-y-1">
                      {stats.uniqueTeammates.map((teammate, index) => (
                        <li key={index} className="p-2 border-b border-darkBlue/10 last:border-b-0">
                          {teammate}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center p-4 text-darkBlue/70">Партнеры не найдены</div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-darkBlue mb-3 flex items-center">
                  <FaUsers className="mr-2 text-cyan" /> Противники
                </h3>
                
                {stats.uniqueOpponents && stats.uniqueOpponents.length > 0 ? (
                  <div className="bg-gradient-to-r from-cyan/10 to-darkBlue/5 p-4 rounded-lg">
                    <ul className="space-y-1">
                      {stats.uniqueOpponents.map((opponent, index) => (
                        <li key={index} className="p-2 border-b border-darkBlue/10 last:border-b-0">
                          {opponent}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center p-4 text-darkBlue/70">Противники не найдены</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerStats;