import { useState } from 'react';
import { FaTrophy, FaMedal, FaChartLine, FaEye, FaEyeSlash } from 'react-icons/fa';
import { t } from '../localization';

const ResultsTable = ({ results }) => {
  const [showDetailed, setShowDetailed] = useState(false);
  const sortedResults = [...results].sort((a, b) => b.points - a.points);

  const getMedalIcon = (place) => {
    switch (place) {
      case 1: return <FaTrophy className="text-yellow-500 text-lg md:text-xl" />;
      case 2: return <FaMedal className="text-gray-400 text-lg md:text-xl" />;
      case 3: return <FaMedal className="text-amber-600 text-lg md:text-xl" />;
      default: return <span className="text-lg md:text-xl font-bold text-darkBlue">{place}</span>;
    }
  };

  const getMedalBg = (place) => {
    switch (place) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-l-4 border-yellow-500';
      case 2: return 'bg-gradient-to-r from-gray-100 to-gray-50 border-l-4 border-gray-400';
      case 3: return 'bg-gradient-to-r from-amber-100 to-amber-50 border-l-4 border-amber-600';
      default: return 'bg-white border-l-4 border-transparent';
    }
  };

  return (
    <div className="p-4 md:p-6 pb-16">
      <div className="card mx-auto max-w-6xl fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-darkBlue flex items-center mb-4 sm:mb-0">
            <FaTrophy className="mr-3 text-cyan" /> 
            {t('resultsTable.title')}
          </h2>
          
          {sortedResults.length > 0 && (
            <button
              onClick={() => setShowDetailed(!showDetailed)}
              className="btn btn-cyan flex items-center gap-2 w-full sm:w-auto"
            >
              {showDetailed ? <FaEyeSlash /> : <FaEye />}
              <span className="text-sm md:text-base">
                {showDetailed ? t('resultsTable.hideDetails') : t('resultsTable.showDetails')}
              </span>
            </button>
          )}
        </div>

        {sortedResults.length === 0 ? (
          <div className="text-center py-12">
            <FaChartLine className="mx-auto text-6xl text-darkBlue/30 mb-4" />
            <p className="text-lg md:text-xl text-darkBlue/70">{t('resultsTable.noResults')}</p>
          </div>
        ) : (
          <>
            {/* Мобильная версия - карточки */}
            <div className="block md:hidden space-y-3">
              {sortedResults.map((result, index) => (
                <div 
                  key={result.name} 
                  className={`rounded-lg p-4 shadow-md transition-all duration-200 hover:shadow-lg ${getMedalBg(index + 1)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getMedalIcon(index + 1)}
                      <div>
                        <h3 className="font-bold text-lg text-darkBlue">{result.name}</h3>
                        <p className="text-sm text-darkBlue/70">
                          {t('resultsTable.place')} {index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-darkBlue">{result.points}</div>
                      <div className="text-xs text-darkBlue/60">{t('resultsTable.points')}</div>
                    </div>
                  </div>
                  
                  {showDetailed && (
                    <div className="border-t border-darkBlue/20 pt-3 mt-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-darkBlue/70">{t('resultsTable.wins')}:</span>
                          <span className="font-semibold text-green-600">{result.wins || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-darkBlue/70">{t('resultsTable.losses')}:</span>
                          <span className="font-semibold text-red-600">{result.losses || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-darkBlue/70">{t('resultsTable.gamesPlayed')}:</span>
                          <span className="font-semibold text-darkBlue">{result.gamesPlayed || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-darkBlue/70">{t('resultsTable.scoreDiff')}:</span>
                          <span className={`font-semibold ${(result.scoreDiff || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.scoreDiff > 0 ? '+' : ''}{result.scoreDiff || 0}
                          </span>
                        </div>
                        {result.setsWon !== undefined && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-darkBlue/70">{t('resultsTable.setsWon')}:</span>
                              <span className="font-semibold text-darkBlue">{result.setsWon || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-darkBlue/70">{t('resultsTable.setsLost')}:</span>
                              <span className="font-semibold text-darkBlue">{result.setsLost || 0}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Десктопная версия - таблица */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-darkBlue bg-peach/30">
                    <th className="p-3 md:p-4 text-darkBlue font-bold">{t('resultsTable.place')}</th>
                    <th className="p-3 md:p-4 text-darkBlue font-bold">{t('resultsTable.team')}</th>
                    <th className="p-3 md:p-4 text-darkBlue font-bold text-center">{t('resultsTable.points')}</th>
                    {showDetailed && (
                      <>
                        <th className="p-3 md:p-4 text-darkBlue font-bold text-center">{t('resultsTable.wins')}</th>
                        <th className="p-3 md:p-4 text-darkBlue font-bold text-center">{t('resultsTable.losses')}</th>
                        <th className="p-3 md:p-4 text-darkBlue font-bold text-center">{t('resultsTable.gamesPlayed')}</th>
                        <th className="p-3 md:p-4 text-darkBlue font-bold text-center">{t('resultsTable.scoreDiff')}</th>
                        <th className="p-3 md:p-4 text-darkBlue font-bold text-center">{t('resultsTable.setsWon')}</th>
                        <th className="p-3 md:p-4 text-darkBlue font-bold text-center">{t('resultsTable.setsLost')}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((result, index) => (
                    <tr 
                      key={result.name} 
                      className={`border-b border-darkBlue/20 hover:bg-peach/20 transition-colors ${getMedalBg(index + 1)}`}
                    >
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2">
                          {getMedalIcon(index + 1)}
                        </div>
                      </td>
                      <td className="p-3 md:p-4">
                        <span className="font-semibold text-darkBlue text-base md:text-lg">
                          {result.name}
                        </span>
                      </td>
                      <td className="p-3 md:p-4 text-center">
                        <span className="text-xl md:text-2xl font-bold text-darkBlue">
                          {result.points}
                        </span>
                      </td>
                      {showDetailed && (
                        <>
                          <td className="p-3 md:p-4 text-center">
                            <span className="font-semibold text-green-600">{result.wins || 0}</span>
                          </td>
                          <td className="p-3 md:p-4 text-center">
                            <span className="font-semibold text-red-600">{result.losses || 0}</span>
                          </td>
                          <td className="p-3 md:p-4 text-center">
                            <span className="font-semibold text-darkBlue">{result.gamesPlayed || 0}</span>
                          </td>
                          <td className="p-3 md:p-4 text-center">
                            <span className={`font-semibold ${(result.scoreDiff || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.scoreDiff > 0 ? '+' : ''}{result.scoreDiff || 0}
                            </span>
                          </td>
                          <td className="p-3 md:p-4 text-center">
                            <span className="font-semibold text-darkBlue">{result.setsWon || 0}</span>
                          </td>
                          <td className="p-3 md:p-4 text-center">
                            <span className="font-semibold text-darkBlue">{result.setsLost || 0}</span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsTable;