import { useState, useEffect, useRef } from 'react';
import { 
  FaVolleyballBall, 
  FaCheck, 
  FaUndo, 
  FaChartLine, 
  FaHandPointUp,
  FaHistory,
  FaExchangeAlt as FaSwitch
} from 'react-icons/fa';
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from 'react-icons/io';
import { MdSwipe } from 'react-icons/md';
import { motion } from 'framer-motion';
import { calculateTeamRating, predictGameResult } from '../utils/teamGenerator';
import { t } from '../localization';

const GameBoard = ({ teams, resting, onGameEnd, settings, format, currentRound = 0 }) => {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [timer, setTimer] = useState(settings?.roundDuration * 60 || 600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCourtSwitched, setIsCourtSwitched] = useState(false);
  const [showScoreHistory, setShowScoreHistory] = useState(true);
  
  // История набора очков в правильном формате
  const [scoringHistory, setScoringHistory] = useState([]);

  // Ref для хранения таймера автоматического завершения игры
  const autoFinishTimerRef = useRef(null);

  // Получаем настройки из пропсов
  const maxScore = settings?.maxScoreRounds?.[format] || (format === 'triples' ? 15 : 25);
  const minPointDifference = settings?.minPointDifference || 2;
  
  // Получаем прогноз для текущей игры
  useEffect(() => {
    if (teams && teams.length === 2 && settings?.showPredictions) {
      const gamePrediction = predictGameResult(teams[0], teams[1]);
      setPrediction(gamePrediction);
    }
  }, [teams, settings?.showPredictions]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);
  
  // Проверка условий завершения игры
  useEffect(() => {
    const checkGameFinish = () => {
      // Если одна из команд достигла максимального счета и разница достаточна
      if ((score1 >= maxScore || score2 >= maxScore) && Math.abs(score1 - score2) >= minPointDifference) {
        // Устанавливаем флаг завершения игры
        setGameFinished(true);
        
        // Показываем модальное окно через небольшую задержку
        autoFinishTimerRef.current = setTimeout(() => {
          setShowModal(true);
        }, 1500);
      } else {
        setGameFinished(false);
      }
    };
    
    checkGameFinish();
    
    // Очистка таймера при размонтировании
    return () => {
      if (autoFinishTimerRef.current) {
        clearTimeout(autoFinishTimerRef.current);
      }
    };
  }, [score1, score2, maxScore, minPointDifference]);

  // Обработка свайпов для мобильных устройств
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const [swipeMode, setSwipeMode] = useState(false);
  
  const handleScoreChange = (team, delta) => {
    const actualTeam = isCourtSwitched ? (team === 1 ? 2 : 1) : team;
    // Если игра завершена, не позволяем менять счет
    if (gameFinished) {
      setErrorMessage(t('gameBoard.gameFinished'));
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    // Проверяем, чтобы счет не стал отрицательным
    if (actualTeam === 1) {
      if (delta < 0 && score1 + delta < 0) return; // Предотвращаем отрицательный счет
      
      // При добавлении очка добавляем событие в историю
      if (delta > 0) {
        setScoringHistory(prev => [...prev, { team: 1, score: score1 + 1 }]);
      } else if (delta < 0) {
        // При уменьшении счёта удаляем последнее событие, если оно принадлежит этой команде
        setScoringHistory(prev => {
          const newHistory = [...prev];
          for (let i = newHistory.length - 1; i >= 0; i--) {
            if (newHistory[i].team === 1) {
              newHistory.splice(i, 1);
              break;
            }
          }
          return newHistory;
        });
      }
      
      setScore1((prev) => Math.max(0, prev + delta));
    } else {
      if (delta < 0 && score2 + delta < 0) return; // Предотвращаем отрицательный счет
      
      // При добавлении очка добавляем событие в историю
      if (delta > 0) {
        setScoringHistory(prev => [...prev, { team: 2, score: score2 + 1 }]);
      } else if (delta < 0) {
        // При уменьшении счёта удаляем последнее событие, если оно принадлежит этой команде
        setScoringHistory(prev => {
          const newHistory = [...prev];
          for (let i = newHistory.length - 1; i >= 0; i--) {
            if (newHistory[i].team === 2) {
              newHistory.splice(i, 1);
              break;
            }
          }
          return newHistory;
        });
      }
      
      setScore2((prev) => Math.max(0, prev + delta));
    }
    
    // Сбрасываем сообщение об ошибке при изменении счета
    if (errorMessage) {
      setErrorMessage("");
    }
  };
  
  // Обработчики свайпов для мобильного управления счётом
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e, team) => {
    touchEndX.current = e.changedTouches[0].clientX;
    touchEndY.current = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;
    
    // Проверяем, что свайп был преимущественно горизонтальным
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Свайп вправо - увеличиваем счёт
        handleScoreChange(team, 1);
      } else {
        // Свайп влево - уменьшаем счёт
        handleScoreChange(team, -1);
      }
    }
  };

  const handleEndGame = () => {
    // Проверяем условия завершения игры
    if ((score1 >= maxScore || score2 >= maxScore) && Math.abs(score1 - score2) >= minPointDifference) {
      onGameEnd({ score1, score2, teams });
      setShowModal(false);
    } else {
      // Формируем подробное сообщение об ошибке
      let message = t('gameBoard.gameFinishError') + " ";
      
      if (score1 < maxScore && score2 < maxScore) {
        message += t('gameBoard.needToReachScore', { score: maxScore });
      } else if (Math.abs(score1 - score2) < minPointDifference) {
        message += t('gameBoard.needPointDifference', { diff: minPointDifference });
      }
      
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleCourtSwitch = () => {
    setIsCourtSwitched(!isCourtSwitched);
  };

  const resetScores = () => {
    setScore1(0);
    setScore2(0);
    setTimer(settings?.roundDuration * 60 || 600);
    setIsTimerRunning(false);
    setGameFinished(false);
    setErrorMessage("");
    setScoringHistory([]);
    setIsCourtSwitched(false);
  };
  
  // Форматирование таймера
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6 pb-16">
      <div className="card md:max-w-3xl lg:max-w-4xl mx-auto fade-in overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-darkBlue flex items-center">
            <FaVolleyballBall className="mr-3 text-cyan" /> {t('gameBoard.currentGame')}
          </h2>
          {/* Кнопка смены сторон - перемещена в заголовок */}
          <button
            onClick={handleCourtSwitch}
            className="btn bg-cyan/10 text-cyan hover:bg-cyan/20 transition-all py-2 px-4 flex items-center justify-center gap-2 rounded-lg"
          >
            <FaSwitch className={`transition-transform duration-300 ${isCourtSwitched ? 'rotate-180' : ''}`} />
            <span className="hidden md:inline">{isCourtSwitched ? t('gameBoard.switchBack') : t('gameBoard.switchSides')}</span>
          </button>
        </div>
        
        {/* Информация о счете и условиях завершения */}
        <div className="mb-4 text-center bg-gradient-to-r from-cyan/10 to-darkBlue/10 p-3 rounded-lg">
          <p className="text-darkBlue">
            {t('gameBoard.gameTo')} <span className="font-bold">{maxScore}</span> {t('gameBoard.pointsWithDifference')} <span className="font-bold">{minPointDifference}</span> {t('gameBoard.points')}
          </p>
        </div>
        
        {/* Сообщение об ошибке */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center animate-pulse">
            {errorMessage}
          </div>
        )}
        
        {/* Уведомление о завершении игры */}
        {gameFinished && !showModal && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-center animate-pulse">
            {t('gameBoard.gameFinished')}
          </div>
        )}
        
        {/* Прогноз игры */}
        {prediction && settings?.showPredictions && (
          <div className="card mb-4 p-4 bg-gradient-to-r from-cyan/5 to-darkBlue/5">
            <h3 className="font-semibold text-darkBlue text-lg mb-2 flex items-center">
              <FaChartLine className="mr-2 text-cyan" /> {t('gameBoard.matchPrediction')}
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col items-center md:items-start">
                <div className="text-sm text-darkBlue/70 mb-1">{t('gameBoard.winChances')}</div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">{teams[0].name}</div>
                    <div className={`text-xl font-bold ${prediction.team1WinProbability > 0.55 ? 'text-green-600' : 'text-darkBlue'}`}>
                      {Math.round(prediction.team1WinProbability * 100)}%
                    </div>
                  </div>
                  <div className="text-xl font-semibold text-darkBlue/60">{t('gameBoard.versus')}</div>
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">{teams[1].name}</div>
                    <div className={`text-xl font-bold ${prediction.team2WinProbability > 0.55 ? 'text-green-600' : 'text-darkBlue'}`}>
                      {Math.round(prediction.team2WinProbability * 100)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <div className="text-sm text-darkBlue/70 mb-1">{t('gameBoard.matchCharacteristics')}</div>
                <div className="flex gap-2">
                  {prediction.isCloseMatch ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {t('gameBoard.closeMatch')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {t('gameBoard.hasAdvantage', { team: prediction.favoredTeam === 1 ? teams[0].name : teams[1].name })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Переключатель режима свайпов */}
        <div className="mb-4 flex justify-center">
          <button 
            onClick={() => setSwipeMode(!swipeMode)}
            className={`flex items-center px-4 py-2 rounded-full text-sm transition-all ${swipeMode ? 'bg-cyan text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <MdSwipe className="mr-2" /> {swipeMode ? t('gameBoard.swipeModeEnabled') : t('gameBoard.enableSwipeMode')}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:gap-6 mb-6">
          {/* Счёт матча - вынесен в отдельную карточку для лучшей эргономики */}
          <div className="p-4 rounded-xl glass-effect mb-4 md:flex-grow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-darkBlue text-lg md:text-xl">
                {isCourtSwitched ? teams[1].name : teams[0].name}
              </h3>
              <h3 className="font-semibold text-darkBlue text-lg md:text-xl">
                {isCourtSwitched ? teams[0].name : teams[1].name}
              </h3>
            </div>
            
            <div className="flex justify-between items-center">
              {/* Первая команда - отображаем в зависимости от переключателя */}
              <div 
                className={`flex-1 ${swipeMode ? 'relative' : ''}`}
                onTouchStart={swipeMode ? handleTouchStart : undefined}
                onTouchEnd={swipeMode ? (e) => handleTouchEnd(e, isCourtSwitched ? 2 : 1) : undefined}
              >
                <div className="flex flex-col items-center">
                  {!swipeMode && (
                    <button
                      onClick={() => handleScoreChange(isCourtSwitched ? 2 : 1, -1)}
                      className="btn btn-accent w-12 h-12 md:w-16 md:h-16 rounded-full mb-2 flex items-center justify-center"
                      disabled={gameFinished || score1 <= 0}
                    >
                      <IoMdRemoveCircleOutline className="text-2xl md:text-3xl" />
                    </button>
                  )}
                  <motion.span
                    key={score1}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className={`text-5xl md:text-7xl font-bold ${gameFinished && score1 > score2 ? 'text-green-600' : 'text-darkBlue'} ${swipeMode ? 'text-6xl md:text-8xl' : ''}`}
                  >
                    {score1}
                  </motion.span>
                  {!swipeMode && (
                    <button
                      onClick={() => handleScoreChange(isCourtSwitched ? 2 : 1, 1)}
                      className="btn btn-cyan glow w-12 h-12 md:w-16 md:h-16 rounded-full mt-2 flex items-center justify-center"
                      disabled={gameFinished}
                    >
                      <IoMdAddCircleOutline className="text-2xl md:text-3xl" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-5xl md:text-7xl font-bold text-darkBlue/40 mx-4">:</div>
              
              <div 
                className={`flex-1 ${swipeMode ? 'relative' : ''}`}
                onTouchStart={swipeMode ? handleTouchStart : undefined}
                onTouchEnd={swipeMode ? (e) => handleTouchEnd(e, isCourtSwitched ? 1 : 2) : undefined}
              >
                <div className="flex flex-col items-center">
                  {!swipeMode && (
                    <button
                      onClick={() => handleScoreChange(isCourtSwitched ? 1 : 2, -1)}
                      className="btn btn-accent w-12 h-12 md:w-16 md:h-16 rounded-full mb-2 flex items-center justify-center"
                      disabled={gameFinished || score2 <= 0}
                    >
                      <IoMdRemoveCircleOutline className="text-2xl md:text-3xl" />
                    </button>
                  )}
                  <motion.span
                    key={score2}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className={`text-5xl md:text-7xl font-bold ${gameFinished && score2 > score1 ? 'text-green-600' : 'text-darkBlue'} ${swipeMode ? 'text-6xl md:text-8xl' : ''}`}
                  >
                    {score2}
                  </motion.span>
                  {!swipeMode && (
                    <button
                      onClick={() => handleScoreChange(isCourtSwitched ? 1 : 2, 1)}
                      className="btn btn-cyan glow w-12 h-12 md:w-16 md:h-16 rounded-full mt-2 flex items-center justify-center"
                      disabled={gameFinished}
                    >
                      <IoMdAddCircleOutline className="text-2xl md:text-3xl" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Индикатор свайпа для мобильных устройств */}
            {swipeMode && (
              <div className="mt-6 flex justify-center">
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <FaHandPointUp className="inline-block mr-2 text-darkBlue/60" />
                  <span className="text-sm text-darkBlue/60">{t('gameBoard.swipeHint')}</span>
                </div>
              </div>
            )}
            
            {/* Таймер игры */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm md:text-base text-darkBlue/70">{t('gameBoard.gameTime')}</div>
              <div className="text-xl md:text-2xl font-semibold">{formatTime(timer)}</div>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`btn btn-sm md:btn-md ${isTimerRunning ? 'btn-accent' : 'btn-cyan'}`}
              >
                {isTimerRunning ? t('gameBoard.pause') : t('gameBoard.start')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Улучшенное отображение кнопок "Завершить игру" и "Сбросить счёт" */}
        <div className="flex flex-col md:flex-row gap-3 mt-6 md:mt-8 border-2 border-orange-300 rounded-lg p-4 bg-orange-50/20">
          <button 
            onClick={() => setShowModal(true)} 
            className={`btn flex-1 ${gameFinished ? 'bg-red-500 hover:bg-red-600' : 'bg-red-500 hover:bg-red-600'} text-white w-full py-4 md:py-5 md:text-lg rounded-lg flex items-center justify-center`}
          >
            <FaCheck className="mr-2" />
            <span className="text-lg font-medium">{t('gameBoard.finishGame')}</span>
          </button>
          
          <button 
            onClick={resetScores} 
            className="btn flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors w-full py-4 md:py-5 md:text-lg rounded-lg flex items-center justify-center"
            disabled={gameFinished && showModal}
          >
            <FaUndo className="mr-2" />
            <span className="text-lg font-medium">{t('gameBoard.resetScore')}</span>
          </button>
        </div>

        {/* История счёта в стиле сетки, улучшенная версия */}
        <div className="mt-6 md:mt-8">
          <div className="flex items-center justify-between mb-2 bg-orange-100 p-2 rounded-lg">
            <h3 className="text-lg md:text-xl font-semibold text-orange-800">{t('gameBoard.scoreHistory')}</h3>
            <button
              onClick={() => setShowScoreHistory(!showScoreHistory)}
              className="flex items-center text-orange-700 hover:text-orange-900"
            >
              <FaHistory className="text-xl mr-1" />
              <span className="hidden md:inline">{showScoreHistory ? t('gameBoard.hide') : t('gameBoard.show')}</span>
            </button>
          </div>
          
          {showScoreHistory && (
            <div className="mt-4 overflow-x-auto bg-orange-50 rounded-lg border border-orange-200">
              <div className="p-3">
                <div className="flex justify-between mb-2">
                  <h3 className="text-lg font-semibold text-orange-800">
                    {t('gameBoard.set')} {currentRound + 1}: {score1}-{score2} {gameFinished ? t('gameBoard.completed') : t('gameBoard.inProgress')}
                  </h3>
                  <span className="text-sm text-orange-600">{t('gameBoard.time')}: {formatTime(timer)}</span>
                </div>
                
                <div className="flex">
                  {/* Имена команд - с динамическим размером шрифта */}
                  <div className="w-28 shrink-0 mr-2">
                    {teams.map((team, index) => (
                      <div 
                        key={`team-${index}`}
                        className="h-8 flex items-center"
                      >
                        <span 
                          className={`font-semibold text-orange-900 whitespace-nowrap truncate max-w-full`}
                          style={{ fontSize: Math.max(10, Math.min(16, 100 / (isCourtSwitched ? (index === 0 ? teams[1].name : teams[0].name) : team.name).length)) + 'px' }}
                        >
                          {isCourtSwitched ? (index === 0 ? teams[1].name : teams[0].name) : team.name} +
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Сетка истории счета */}
                  <div className="flex overflow-x-auto">
                    {scoringHistory.map((event, index) => (
                      <div key={`event-${index}`} className="flex flex-col" style={{ minWidth: '24px' }}>
                        {/* Ячейка для первой команды */}
                        <div className="h-8 w-6 flex items-center justify-center">
                          {event.team === 1 && (
                            <span className="bg-gray-200 text-gray-800 w-full h-full flex items-center justify-center">
                              {event.score}
                            </span>
                          )}
                        </div>
                        {/* Ячейка для второй команды */}
                        <div className="h-8 w-6 flex items-center justify-center">
                          {event.team === 2 && (
                            <span className="bg-gray-200 text-gray-800 w-full h-full flex items-center justify-center">
                              {event.score}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Добавляем несколько пустых ячеек справа для эстетики */}
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={`empty-${i}`} className="flex flex-col" style={{ minWidth: '24px' }}>
                        <div className="h-8 w-6"></div>
                        <div className="h-8 w-6"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for confirming game end */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-[70] backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg md:max-w-xl overflow-hidden">
            <div className="modal-header">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('gameBoard.finishGame')}</h2>
                <button onClick={() => setShowModal(false)} className="text-white hover:text-accent transition-colors duration-150 text-3xl leading-none">
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body p-6 bg-white rounded-b-xl">
              <div className="bg-gradient-to-r from-cyan/10 to-darkBlue/5 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl mb-2">{t('gameBoard.finalScore')}</h3>
                    <p className="text-3xl font-bold">{score1} : {score2}</p>
                  </div>
                  {prediction && (
                    <div className="text-right">
                      <p className="text-sm opacity-70 mb-1">{t('gameBoard.prediction')}</p>
                      <p className="text-xl font-bold">{prediction.predictedScore1} : {prediction.predictedScore2}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleEndGame}
                  className="btn btn-accent w-full py-3"
                >
                  {t('common.confirm')}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost w-full py-3"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;