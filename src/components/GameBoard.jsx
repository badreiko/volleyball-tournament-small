import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaMinus, FaVolleyballBall, FaCheck, FaUndo, FaChartLine, FaExchangeAlt, FaHandPointUp } from 'react-icons/fa';
import { MdSwipe } from 'react-icons/md';
import { motion } from 'framer-motion';
import { calculateTeamRating, predictGameResult } from '../utils/teamGenerator';

const GameBoard = ({ teams, resting, onGameEnd, settings }) => {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [timer, setTimer] = useState(settings?.roundDuration * 60 || 600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Ref для хранения таймера автоматического завершения игры
  const autoFinishTimerRef = useRef(null);
  
  // Получаем настройки из пропсов
  const maxScore = settings?.maxScoreRounds?.[teams.length === 2 ? 'full' : 'triples'] || 25;
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
    // Если игра завершена, не позволяем менять счет
    if (gameFinished) {
      setErrorMessage(`Игра завершена! Счёт: ${score1}:${score2}`);
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    if (team === 1) {
      setScore1((prev) => Math.max(0, prev + delta));
    } else {
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
      let message = "Игра не может быть завершена: ";
      
      if (score1 < maxScore && score2 < maxScore) {
        message += `необходимо набрать ${maxScore} очков.`;
      } else if (Math.abs(score1 - score2) < minPointDifference) {
        message += `разница в счете должна быть не менее ${minPointDifference} очков.`;
      }
      
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const resetScores = () => {
    setScore1(0);
    setScore2(0);
    setTimer(settings?.roundDuration * 60 || 600);
    setIsTimerRunning(false);
    setGameFinished(false);
    setErrorMessage("");
  };
  
  // Форматирование таймера
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="card max-w-md mx-auto fade-in overflow-hidden">
      <h2 className="text-2xl font-bold text-darkBlue flex items-center mb-6">
        <FaVolleyballBall className="mr-3 text-cyan" /> Текущая игра
      </h2>
      
      {/* Информация о счете и условиях завершения */}
      <div className="mb-4 text-center bg-gradient-to-r from-cyan/10 to-darkBlue/10 p-3 rounded-lg">
        <p className="text-darkBlue">
          Игра до <span className="font-bold">{maxScore}</span> очков 
          с минимальной разницей в <span className="font-bold">{minPointDifference}</span> очка
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
          Игра завершена! Нажмите кнопку "Завершить игру" для продолжения.
        </div>
      )}
      
      {/* Прогноз игры */}
      {prediction && settings?.showPredictions && (
        <div className="card mb-4 p-4 bg-gradient-to-r from-cyan/5 to-darkBlue/5">
          <h3 className="font-semibold text-darkBlue text-lg mb-2 flex items-center">
            <FaChartLine className="mr-2 text-cyan" /> Прогноз матча
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col items-center md:items-start">
              <div className="text-sm text-darkBlue/70 mb-1">Шансы на победу:</div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="font-semibold">{teams[0].name}</div>
                  <div className={`text-xl font-bold ${prediction.team1WinProbability > 0.55 ? 'text-green-600' : 'text-darkBlue'}`}>
                    {Math.round(prediction.team1WinProbability * 100)}%
                  </div>
                </div>
                <div className="text-xl font-semibold text-darkBlue/60">VS</div>
                <div className="flex flex-col items-center">
                  <div className="font-semibold">{teams[1].name}</div>
                  <div className={`text-xl font-bold ${prediction.team2WinProbability > 0.55 ? 'text-green-600' : 'text-darkBlue'}`}>
                    {Math.round(prediction.team2WinProbability * 100)}%
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="text-sm text-darkBlue/70 mb-1">Характеристика матча:</div>
              <div className="flex gap-2">
                {prediction.isCloseMatch ? (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    Близкая игра
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {prediction.favoredTeam === 1 ? teams[0].name : teams[1].name} имеет преимущество
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
          <MdSwipe className="mr-2" /> {swipeMode ? 'Режим свайпов включен' : 'Включить режим свайпов'}
        </button>
      </div>
      
      <div className="flex flex-col mb-6">
        {/* Счёт матча - вынесен в отдельную карточку для лучшей эргономики */}
        <div className="p-4 rounded-xl glass-effect mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-darkBlue text-lg">
              {teams[0].name}
            </h3>
            <h3 className="font-semibold text-darkBlue text-lg">
              {teams[1].name}
            </h3>
          </div>
          
          <div className="flex justify-between items-center">
            <div 
              className={`flex-1 ${swipeMode ? 'relative' : ''}`}
              onTouchStart={swipeMode ? handleTouchStart : undefined}
              onTouchEnd={swipeMode ? (e) => handleTouchEnd(e, 1) : undefined}
            >
              <div className="flex flex-col items-center">
                {!swipeMode && (
                  <button
                    onClick={() => handleScoreChange(1, -1)}
                    className="btn btn-accent w-16 h-16 rounded-full mb-2"
                    disabled={gameFinished || score1 <= 0}
                  >
                    <FaMinus className="text-xl" />
                  </button>
                )}
                <motion.span
                  key={score1}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className={`text-6xl font-bold ${gameFinished && score1 > score2 ? 'text-green-600' : 'text-darkBlue'} ${swipeMode ? 'text-7xl' : ''}`}
                >
                  {score1}
                </motion.span>
                {!swipeMode && (
                  <button
                    onClick={() => handleScoreChange(1, 1)}
                    className="btn btn-cyan glow w-16 h-16 rounded-full mt-2"
                    disabled={gameFinished}
                  >
                    <FaPlus className="text-xl" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-5xl font-bold text-darkBlue/40 mx-4">:</div>
            
            <div 
              className={`flex-1 ${swipeMode ? 'relative' : ''}`}
              onTouchStart={swipeMode ? handleTouchStart : undefined}
              onTouchEnd={swipeMode ? (e) => handleTouchEnd(e, 2) : undefined}
            >
              <div className="flex flex-col items-center">
                {!swipeMode && (
                  <button
                    onClick={() => handleScoreChange(2, -1)}
                    className="btn btn-accent w-16 h-16 rounded-full mb-2"
                    disabled={gameFinished || score2 <= 0}
                  >
                    <FaMinus className="text-xl" />
                  </button>
                )}
                <motion.span
                  key={score2}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className={`text-6xl font-bold ${gameFinished && score2 > score1 ? 'text-green-600' : 'text-darkBlue'} ${swipeMode ? 'text-7xl' : ''}`}
                >
                  {score2}
                </motion.span>
                {!swipeMode && (
                  <button
                    onClick={() => handleScoreChange(2, 1)}
                    className="btn btn-cyan glow w-16 h-16 rounded-full mt-2"
                    disabled={gameFinished}
                  >
                    <FaPlus className="text-xl" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {swipeMode && (
            <div className="mt-3 text-sm text-gray-500 text-center">
              <FaHandPointUp className="inline mr-1" /> Свайп влево/вправо для изменения счёта
            </div>
          )}
        </div>
        
        {/* Информация о командах - вынесена в отдельные карточки */}
        <div className="p-4 rounded-xl glass-effect mb-4">
          <h3 className="font-semibold text-darkBlue text-lg mb-2">
            Команда 1: {teams[0].name}
          </h3>
          <p className="text-darkBlue mb-2">{teams[0].players.join(', ')}</p>
          
          {settings?.showTeamRatings && teams[0].teamRating && (
            <div className="flex items-center text-sm text-darkBlue/70">
              <FaExchangeAlt className="mr-1 text-cyan" /> Рейтинг команды: {teams[0].teamRating}
            </div>
          )}
        </div>
        
        <div className="p-4 rounded-xl glass-effect mb-4">
          <h3 className="font-semibold text-darkBlue text-lg mb-2">
            Команда 2: {teams[1].name}
          </h3>
          <p className="text-darkBlue mb-2">{teams[1].players.join(', ')}</p>
          
          {settings?.showTeamRatings && teams[1].teamRating && (
            <div className="flex items-center text-sm text-darkBlue/70">
              <FaExchangeAlt className="mr-1 text-cyan" /> Рейтинг команды: {teams[1].teamRating}
            </div>
          )}
        </div>
      </div>
      
      {/* Таймер для формата двоек */}
      {teams.length === 2 && (
        <div className="p-4 rounded-xl glass-effect mb-6">
          <h3 className="font-semibold text-darkBlue text-lg mb-2 text-center">
            Таймер
          </h3>
          <p className="text-darkBlue text-4xl mb-4 text-center font-bold">
            {formatTime(timer)}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="btn btn-accent w-full"
              disabled={gameFinished}
            >
              {isTimerRunning ? 'Пауза' : 'Старт'}
            </button>
            <button
              onClick={() => setTimer(settings?.roundDuration * 60 || 600)}
              className="btn btn-cyan w-full"
              disabled={gameFinished}
            >
              Сбросить
            </button>
          </div>
        </div>
      )}
      
      {/* Отображение отдыхающих команд */}
      {resting.length > 0 && (
        <div className="mb-6 p-4 rounded-xl glass-effect">
          <h3 className="font-semibold text-darkBlue text-lg mb-2">Отдыхают:</h3>
          <div className="grid grid-cols-1 gap-2">
            {resting.map((team, index) => (
              <div key={index} className="bg-white/70 rounded-lg p-2 text-center">
                <p className="font-semibold text-darkBlue">{team.name}</p>
                <p className="text-sm text-darkBlue/70">{team.players.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-3 mt-6">
        <button 
          onClick={() => setShowModal(true)} 
          className={`btn ${gameFinished ? 'btn-cyan' : 'btn-accent'} glow ${gameFinished ? 'animate-pulse' : ''} w-full py-4`}
        >
          <FaCheck className="mr-2" /> Завершить игру
        </button>
        
        <button 
          onClick={resetScores} 
          className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors w-full py-3"
          disabled={gameFinished && showModal}
        >
          <FaUndo className="mr-2" /> Сбросить счёт
        </button>
      </div>
      </div>

      {/* Modal for confirming game end */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-[70] backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg overflow-hidden">
            <div className="modal-header">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Подтверждение завершения игры</h2>
                <button onClick={() => setShowModal(false)} className="text-white hover:text-accent transition-colors duration-150 text-3xl leading-none">
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="bg-gradient-to-r from-peach/30 to-darkBlue/10 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div className="text-center w-5/12">
                    <div className="text-lg font-bold text-darkBlue">{teams[0].name}</div>
                    <div className={`text-2xl font-bold ${score1 > score2 ? 'text-green-600' : 'text-red-600'}`}>
                      {score1}
                    </div>
                  </div>
                  <div className="text-center w-2/12">
                    <div className="text-xl font-bold text-darkBlue/60">vs</div>
                  </div>
                  <div className="text-center w-5/12">
                    <div className="text-lg font-bold text-darkBlue">{teams[1].name}</div>
                    <div className={`text-2xl font-bold ${score2 > score1 ? 'text-green-600' : 'text-red-600'}`}>
                      {score2}
                    </div>
                  </div>
                </div>
              </div>
              
              {!gameFinished && (
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium">
                    Внимание! Игра не соответствует условиям завершения:
                  </p>
                  <ul className="list-disc pl-5 text-sm mt-1">
                    {score1 < maxScore && score2 < maxScore && (
                      <li>Ни одна из команд не достигла {maxScore} очков</li>
                    )}
                    {Math.abs(score1 - score2) < minPointDifference && (
                      <li>Разница в счете меньше {minPointDifference} очков</li>
                    )}
                  </ul>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-darkBlue/20">
                  <label className="block text-sm font-medium text-darkBlue mb-2">Счёт</label>
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      value={score1}
                      onChange={(e) => setScore1(Math.max(0, parseInt(e.target.value) || 0))}
                      className={`w-20 p-2 border ${gameFinished ? 'border-green-500' : 'border-darkBlue/30'} rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-cyan focus:border-cyan`}
                    />
                    <span className="text-darkBlue/60 text-xl font-bold">:</span>
                    <input
                      type="number"
                      value={score2}
                      onChange={(e) => setScore2(Math.max(0, parseInt(e.target.value) || 0))}
                      className={`w-20 p-2 border ${gameFinished ? 'border-green-500' : 'border-darkBlue/30'} rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-cyan focus:border-cyan`}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    resetScores();
                    setShowModal(false);
                  }}
                  className="w-full sm:w-auto bg-accent/10 text-accent py-2 px-4 rounded-lg hover:bg-accent/20 transition-all duration-200 shadow-sm border border-accent/20 flex items-center justify-center text-sm"
                >
                  <FaUndo className="mr-2" /> Сбросить
                </button>
                <button
                  onClick={handleEndGame}
                  className={`w-full sm:w-auto btn ${gameFinished ? 'btn-cyan' : 'btn-accent'} flex items-center justify-center text-sm`}
                >
                  <FaCheck className="mr-2" /> Завершить
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