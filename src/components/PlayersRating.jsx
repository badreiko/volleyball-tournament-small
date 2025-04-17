import { useState, useEffect } from 'react';
import { FaTrophy, FaSearch, FaUser, FaStar, FaGamepad, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { getPlayerRatings } from '../utils/storage';

const PlayersRating = ({ onViewPlayerStats }) => {
  const [playersData, setPlayersData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ratings = getPlayerRatings();
    
    // Преобразуем объект с рейтингами в массив для удобной сортировки
    const players = Object.entries(ratings).map(([name, data]) => ({
      name,
      ...data,
      winRate: data.totalGames > 0 ? (data.totalWins / data.totalGames) : 0
    }));
    
    setPlayersData(players);
    setLoading(false);
  }, []);

  // Функция сортировки
  const handleSort = (field) => {
    if (sortBy === field) {
      // Меняем направление сортировки при повторном клике
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Новое поле сортировки - устанавливаем направление по умолчанию
      setSortBy(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Функция для получения иконки сортировки
  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="ml-1 text-darkBlue/40" />;
    return sortDirection === 'asc' 
      ? <FaSortUp className="ml-1 text-cyan" /> 
      : <FaSortDown className="ml-1 text-cyan" />;
  };

  // Отфильтрованные и отсортированные данные
  const filteredAndSortedPlayers = playersData
    .filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Сортировка по выбранному полю
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      let comparison = 0;
      if (typeof valueA === 'string') {
        comparison = valueA.localeCompare(valueB);
      } else {
        comparison = valueA - valueB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <div className="animate-pulse text-cyan text-xl">Загрузка рейтингов...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold text-darkBlue mb-6 flex items-center">
        <FaTrophy className="mr-3 text-cyan" /> Рейтинг игроков
      </h2>

      {/* Поиск */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-darkBlue/40" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
            placeholder="Поиск игрока..."
          />
        </div>
      </div>

      {/* Таблица с рейтингами */}
      {playersData.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gradient-to-r from-darkBlue to-cyan text-white">
                <th 
                  className="p-3 cursor-pointer" 
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Игрок {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="p-3 cursor-pointer" 
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center">
                    <FaStar className="mr-1" /> Рейтинг {getSortIcon('rating')}
                  </div>
                </th>
                <th 
                  className="p-3 cursor-pointer hidden md:table-cell" 
                  onClick={() => handleSort('totalGames')}
                >
                  <div className="flex items-center">
                    <FaGamepad className="mr-1" /> Игры {getSortIcon('totalGames')}
                  </div>
                </th>
                <th 
                  className="p-3 cursor-pointer hidden md:table-cell" 
                  onClick={() => handleSort('totalWins')}
                >
                  <div className="flex items-center">
                    <FaTrophy className="mr-1" /> Победы {getSortIcon('totalWins')}
                  </div>
                </th>
                <th 
                  className="p-3 cursor-pointer" 
                  onClick={() => handleSort('winRate')}
                >
                  <div className="flex items-center">
                    WR% {getSortIcon('winRate')}
                  </div>
                </th>
                <th className="p-3 text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPlayers.map((player, index) => (
                <tr 
                  key={player.name} 
                  className={`border-b border-darkBlue/10 hover:bg-cyan/5 transition-colors ${
                    index < 3 ? 'font-semibold' : ''
                  }`}
                >
                  <td className="p-3 flex items-center">
                    {index < 3 && (
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                      }`}>
                        {index + 1}
                      </span>
                    )}
                    <span className={index < 3 ? 'text-darkBlue' : ''}>
                      {player.name}
                    </span>
                  </td>
                  <td className="p-3">{player.rating}</td>
                  <td className="p-3 hidden md:table-cell">{player.totalGames}</td>
                  <td className="p-3 hidden md:table-cell">{player.totalWins}</td>
                  <td className="p-3">{(player.winRate * 100).toFixed(1)}%</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onViewPlayerStats(player.name)}
                      className="inline-flex items-center justify-center p-2 bg-cyan/10 text-cyan rounded-full hover:bg-cyan/20 transition-colors"
                      title="Подробная статистика"
                    >
                      <FaUser />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-darkBlue text-lg">Ещё нет данных о рейтингах игроков</p>
          <p className="text-darkBlue/60 mt-2">Проведите несколько турниров для формирования рейтинга</p>
        </div>
      )}
    </div>
  );
};

export default PlayersRating;