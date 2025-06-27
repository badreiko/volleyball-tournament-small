import { useState, useEffect } from 'react';
import { FaTrophy, FaSearch, FaUser, FaStar, FaGamepad, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { getPlayerRatings } from '../utils/storage';
import { t } from '../localization';

const PlayersRating = ({ onViewPlayerStats }) => {
  const [playersData, setPlayersData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = await getPlayerRatings();
      
      // Преобразуем объект с рейтингами в массив для удобной сортировки
      const players = Object.entries(ratings).map(([name, data]) => ({
        name,
        ...data,
        winRate: data.totalGames > 0 ? (data.totalWins / data.totalGames) : 0
      }));
      
      setPlayersData(players);
      setLoading(false);
    };
    fetchRatings();
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
        <div className="animate-pulse text-cyan text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-16">
      <h2 className="text-2xl font-bold text-darkBlue mb-6 flex items-center">
        <FaTrophy className="mr-3 text-cyan" /> {t('playersRating.title')}
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
            placeholder={t('playersRating.searchPlaceholder')}
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
                    {t('playersRating.player')} {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="p-3 cursor-pointer" 
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center">
                    <FaStar className="mr-1" /> {t('playersRating.rating')} {getSortIcon('rating')}
                  </div>
                </th>
                <th 
                  className="p-3 cursor-pointer hidden md:table-cell" 
                  onClick={() => handleSort('totalGames')}
                >
                  <div className="flex items-center">
                    <FaGamepad className="mr-1" /> {t('playersRating.games')} {getSortIcon('totalGames')}
                  </div>
                </th>
                <th 
                  className="p-3 cursor-pointer hidden md:table-cell" 
                  onClick={() => handleSort('totalWins')}
                >
                  <div className="flex items-center">
                    <FaTrophy className="mr-1" /> {t('playersRating.wins')} {getSortIcon('totalWins')}
                  </div>
                </th>
                <th 
                  className="p-3 cursor-pointer" 
                  onClick={() => handleSort('winRate')}
                >
                  <div className="flex items-center">
                    {t('playersRating.winRate')} {getSortIcon('winRate')}
                  </div>
                </th>
                <th className="p-3 text-center">{t('playersRating.actions')}</th>
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
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-700' :
                      'bg-darkBlue'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={index < 3 ? 'text-darkBlue font-semibold' : 'text-darkBlue'}>
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
                      title={t('playersRating.detailedStats')}
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
          <p className="text-darkBlue text-lg">{t('playersRating.noRatings')}</p>
          <p className="text-darkBlue/60 mt-2">{t('playersRating.noRatingsMessage')}</p>
        </div>
      )}
    </div>
  );
};

export default PlayersRating;