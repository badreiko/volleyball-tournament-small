import { useState, useEffect } from 'react';
import { FaHistory, FaTrophy, FaUsers, FaGamepad, FaCalendarAlt, FaEye, FaChevronDown, FaChevronUp, FaSearch, FaFilter } from 'react-icons/fa';
import { t } from '../localization';
import { loadTournamentHistory } from '../utils/storage';

const HistoryView = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTournaments, setExpandedTournaments] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, teams, games

  useEffect(() => {
    const fetchHistory = async () => {
      const savedHistory = await loadTournamentHistory();
      setHistory(savedHistory);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedTournaments);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTournaments(newExpanded);
  };

  const filteredAndSortedHistory = history
    .filter(tournament => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return tournament.teams?.some(team => team.name.toLowerCase().includes(searchLower)) ||
             new Date(tournament.date).toLocaleDateString().includes(searchLower);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'teams':
          return (b.teams?.length || 0) - (a.teams?.length || 0);
        case 'games':
          return (b.games?.length || 0) - (a.games?.length || 0);
        default:
          return 0;
      }
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getWinnerInfo = (results) => {
    if (!results || results.length === 0) return null;
    const sortedResults = [...results].sort((a, b) => b.points - a.points);
    return sortedResults[0];
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 pb-16">
        <div className="card mx-auto max-w-4xl fade-in">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-cyan text-xl flex items-center gap-3">
              <FaHistory className="animate-spin" />
              {t('common.loading')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-16">
      <div className="card mx-auto max-w-6xl fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-darkBlue flex items-center mb-4 sm:mb-0">
            <FaHistory className="mr-3 text-cyan" />
            {t('historyView.title')}
          </h2>
          
          {history.length > 0 && (
            <div className="text-sm md:text-base text-darkBlue/70">
              {history.length} {t('historyView.tournamentsCount')}
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="mx-auto text-6xl text-darkBlue/30 mb-4" />
            <p className="text-lg md:text-xl text-darkBlue/70 mb-2">{t('historyView.noHistory')}</p>
            <p className="text-sm md:text-base text-darkBlue/50">{t('historyView.noHistoryDesc')}</p>
          </div>
        ) : (
          <>
            {/* Поиск и фильтры */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-peach/20 rounded-lg">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-darkBlue/50" />
                  <input
                    type="text"
                    placeholder={t('historyView.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-darkBlue/30 rounded-lg bg-white text-darkBlue placeholder-darkBlue/50 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-darkBlue/50" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-darkBlue/30 rounded-lg bg-white text-darkBlue focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                  >
                    <option value="newest">{t('historyView.sortNewest')}</option>
                    <option value="oldest">{t('historyView.sortOldest')}</option>
                    <option value="teams">{t('historyView.sortByTeams')}</option>
                    <option value="games">{t('historyView.sortByGames')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Список турниров */}
            <div className="space-y-4">
              {filteredAndSortedHistory.map((tournament, index) => {
                const isExpanded = expandedTournaments.has(index);
                const dateInfo = formatDate(tournament.date);
                const winner = getWinnerInfo(tournament.results);
                
                return (
                  <div key={tournament.id || index} className="border border-darkBlue/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Заголовок турнира */}
                    <div 
                      onClick={() => toggleExpanded(index)}
                      className="p-4 md:p-6 bg-gradient-to-r from-peach/30 to-peach/10 cursor-pointer hover:from-peach/40 hover:to-peach/20 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FaCalendarAlt className="text-cyan text-lg md:text-xl" />
                            <h3 className="font-bold text-lg md:text-xl text-darkBlue">
                              {t('historyView.tournament')} #{history.length - index}
                            </h3>
                            {winner && (
                              <div className="flex items-center gap-2 text-sm bg-yellow-100 px-2 py-1 rounded-full">
                                <FaTrophy className="text-yellow-600" />
                                <span className="text-darkBlue font-medium">{winner.name}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm md:text-base text-darkBlue/70">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-darkBlue/50" />
                              <span>{dateInfo.date} в {dateInfo.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaUsers className="text-darkBlue/50" />
                              <span>{tournament.teams?.length || 0} {t('historyView.teams')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaGamepad className="text-darkBlue/50" />
                              <span>{tournament.games?.length || 0} {t('historyView.games')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-3 sm:mt-0">
                          <button className="flex items-center gap-2 text-cyan hover:text-cyan/80 transition-colors">
                            <FaEye />
                            <span className="text-sm">{isExpanded ? t('common.hide') : t('common.show')}</span>
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Детали турнира */}
                    {isExpanded && (
                      <div className="p-4 md:p-6 bg-white border-t border-darkBlue/10">
                        {tournament.results && tournament.results.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-bold text-lg md:text-xl text-darkBlue mb-4 flex items-center gap-2">
                              <FaTrophy className="text-cyan" />
                              {t('historyView.results')}
                            </h4>
                            
                            {/* Мобильная версия результатов - карточки */}
                            <div className="block sm:hidden space-y-2">
                              {tournament.results
                                .sort((a, b) => b.points - a.points)
                                .map((result, i) => (
                                  <div 
                                    key={i} 
                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                      i === 0 ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                                      i === 1 ? 'bg-gray-100 border-l-4 border-gray-400' :
                                      i === 2 ? 'bg-amber-100 border-l-4 border-amber-600' :
                                      'bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="font-bold text-lg text-darkBlue">#{i + 1}</span>
                                      <span className="font-semibold text-darkBlue">{result.name}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-lg text-darkBlue">{result.points}</div>
                                      <div className="text-xs text-darkBlue/60">{t('resultsTable.points')}</div>
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {/* Десктопная версия результатов - таблица */}
                            <div className="hidden sm:block overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b-2 border-darkBlue/20">
                                    <th className="text-left p-2 text-darkBlue font-bold">{t('resultsTable.place')}</th>
                                    <th className="text-left p-2 text-darkBlue font-bold">{t('resultsTable.team')}</th>
                                    <th className="text-center p-2 text-darkBlue font-bold">{t('resultsTable.points')}</th>
                                    <th className="text-center p-2 text-darkBlue font-bold">{t('resultsTable.wins')}</th>
                                    <th className="text-center p-2 text-darkBlue font-bold">{t('resultsTable.losses')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tournament.results
                                    .sort((a, b) => b.points - a.points)
                                    .map((result, i) => (
                                      <tr 
                                        key={i} 
                                        className={`border-b border-darkBlue/10 ${
                                          i === 0 ? 'bg-yellow-50' :
                                          i === 1 ? 'bg-gray-50' :
                                          i === 2 ? 'bg-amber-50' : ''
                                        }`}
                                      >
                                        <td className="p-2">
                                          <span className="font-bold text-darkBlue">#{i + 1}</span>
                                        </td>
                                        <td className="p-2">
                                          <span className="font-semibold text-darkBlue">{result.name}</span>
                                        </td>
                                        <td className="p-2 text-center">
                                          <span className="font-bold text-darkBlue">{result.points}</span>
                                        </td>
                                        <td className="p-2 text-center">
                                          <span className="text-green-600 font-medium">{result.wins || 0}</span>
                                        </td>
                                        <td className="p-2 text-center">
                                          <span className="text-red-600 font-medium">{result.losses || 0}</span>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Список команд */}
                        {tournament.teams && tournament.teams.length > 0 && (
                          <div>
                            <h4 className="font-bold text-lg md:text-xl text-darkBlue mb-3 flex items-center gap-2">
                              <FaUsers className="text-cyan" />
                              {t('historyView.teams')} ({tournament.teams.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {tournament.teams.map((team, i) => (
                                <div key={i} className="p-3 bg-peach/20 rounded-lg">
                                  <h5 className="font-semibold text-darkBlue mb-2">{team.name}</h5>
                                  <div className="text-sm text-darkBlue/70">
                                    {team.players.map((player, j) => (
                                      <span key={j} className="inline-block bg-white px-2 py-1 rounded mr-1 mb-1">
                                        {player}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Нет результатов поиска */}
            {filteredAndSortedHistory.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <FaSearch className="mx-auto text-4xl text-darkBlue/30 mb-4" />
                <p className="text-lg text-darkBlue/70">{t('historyView.noSearchResults')}</p>
                <p className="text-sm text-darkBlue/50">{t('historyView.tryDifferentSearch')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryView;