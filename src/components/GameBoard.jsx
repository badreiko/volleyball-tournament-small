import { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaVolleyballBall, FaCheck, FaUndo, FaChartLine, FaExchangeAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { calculateTeamRating, predictGameResult } from '../utils/teamGenerator';

const GameBoard = ({ teams, resting, onGameEnd, settings }) => {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [timer, setTimer] = useState(settings?.roundDuration * 60 || 600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prediction, setPrediction] = useState(null);
  
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

  const handleScoreChange = (team, delta) => {
    if (team === 1) {
      setScore1((prev) => Math.max(0, prev + delta));
    } else {
      setScore2((prev) => Math.max(0, prev + delta));
    }
  };

  const handleEndGame = () => {
    const maxScore = settings?.maxScoreRounds?.[teams.length === 2 ? 'full' : 'triples'] || 25;
    const minDiff = settings?.minPointDifference || 2;
    
    if (
      (score1 >= maxScore || score2 >= maxScore) &&
      Math.abs(score1 - score2) >= minDiff
    ) {
      onGameEnd({ score1, score2, teams });
      setShowModal(false);
    } else {
      alert(`Игра не может быть завершена: необходимо набрать ${maxScore} очков с разницей не менее ${minDiff}`);
    }
  };

  const resetScores = () => {
    setScore1(0);
    setScore2(0);
    setTimer(settings?.roundDuration * 60 || 600);
    setIsTimerRunning(false);
  };
  
  // Форматирование таймера
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="card max-w-2xl mx-auto fade-in">
      <h2 className="text-2xl font-bold text-darkBlue flex items-center mb-6">
        <FaVolleyballBall className="mr-3 text-cyan" /> Текущая игра
      </h2>
      
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
      
      <div className="card mx-auto max-w-4xl fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 rounded-xl glass-effect">
            <h3 className="font-semibold text-darkBlue text-lg mb-2">
              Команда 1: {teams[0].name}
            </h3>
            <p className="text-darkBlue mb-2">{teams[0].players.join(', ')}</p>
            
            {settings?.showTeamRatings && teams[0].teamRating && (
              <div className="mb-4 flex items-center text-sm text-darkBlue/70">
                <FaExchangeAlt className="mr-1 text-cyan" /> Рейтинг команды: {teams[0].teamRating}
              </div>
            )}
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleScoreChange(1, -1)}
                className="btn btn-accent"
              >
                <FaMinus className="inline mr-1" /> 1
              </button>
              <motion.span
                key={score1}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold text-darkBlue"
              >
                {score1}
              </motion.span>
              <button
                onClick={() => handleScoreChange(1, 1)}
                className="btn btn-cyan glow"
              >
                <FaPlus className="inline mr-1" /> 1
              </button>
            </div>
          </div>
          <div className="p-6 rounded-xl glass-effect">
            <h3 className="font-semibold text-darkBlue text-lg mb-2">
              Команда 2: {teams[1].name}
            </h3>
            <p className="text-darkBlue mb-2">{teams[1].players.join(', ')}</p>
            
            {settings?.showTeamRatings && teams[1].teamRating && (
              <div className="mb-4 flex items-center text-sm text-darkBlue/70">
                <FaExchangeAlt className="mr-1 text-cyan" /> Рейтинг команды: {teams[1].teamRating}
              </div>
            )}
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleScoreChange(2, -1)}
                className="btn btn-accent"
              >
                <FaMinus className="inline mr-1" /> 1
              </button>
              <motion.span
                key={score2}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold text-darkBlue"
              >
                {score2}
              </motion.span>
              <button
                onClick={() => handleScoreChange(2, 1)}
                className="btn btn-cyan glow"
              >
                <FaPlus className="inline mr-1" /> 1
              </button>
            </div>
          </div>
        </div>
        
        {/* Таймер для формата двоек */}
        {teams.length === 2 && (
          <div className="mb-6 text-center">
            <h3 className="font-semibold text-darkBlue text-lg mb-2">
              Таймер:
            </h3>
            <p className="text-darkBlue text-3xl mb-4">
              {formatTime(timer)}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="btn btn-accent"
              >
                {isTimerRunning ? 'Пауза' : 'Старт'}
              </button>
              <button
                onClick={() => setTimer(settings?.roundDuration * 60 || 600)}
                className="btn btn-cyan"
              >
                Сбросить
              </button>
            </div>
          </div>
        )}
        
        {/* Отображение отдыхающих команд */}
        {resting.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-peach/30 to-darkBlue/10 p-4 rounded-lg">
            <h3 className="font-semibold text-darkBlue text-lg mb-2">Отдыхают:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {resting.map((team, index) => (
                <div key={index} className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="font-semibold text-darkBlue">{team.name}</p>
                  <p className="text-sm text-darkBlue/70">{team.players.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Информация о формате игры */}
        <div className="mb-6 text-center bg-gradient-to-r from-cyan/10 to-darkBlue/10 p-3 rounded-lg">
          <p className="text-darkBlue">
            Игра до {settings?.maxScoreRounds?.[teams.length === 2 ? 'full' : 'triples'] || 25} очков 
            с минимальной разницей в {settings?.minPointDifference || 2} очка
          </p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="btn btn-accent w-full glow">
          Завершить игру
        </button>
      </div>

      {/* Modal for confirming game end */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-[70] backdrop-blur-sm">
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
                  </div>
                  <div className="text-center w-2/12">
                    <div className="text-xl font-bold text-darkBlue/60">vs</div>
                  </div>
                  <div className="text-center w-5/12">
                    <div className="text-lg font-bold text-darkBlue">{teams[1].name}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-darkBlue/20">
                  <label className="block text-sm font-medium text-darkBlue mb-2">Счёт</label>
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      value={score1}
                      onChange={(e) => setScore1(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 p-2 border border-darkBlue/30 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-cyan focus:border-cyan"
                    />
                    <span className="text-darkBlue/60 text-xl font-bold">:</span>
                    <input
                      type="number"
                      value={score2}
                      onChange={(e) => setScore2(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 p-2 border border-darkBlue/30 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-cyan focus:border-cyan"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={resetScores}
                  className="w-full sm:w-auto bg-accent/10 text-accent py-2 px-4 rounded-lg hover:bg-accent/20 transition-all duration-200 shadow-sm border border-accent/20 flex items-center justify-center text-sm"
                >
                  <FaUndo className="mr-2" /> Сбросить
                </button>
                <button
                  onClick={handleEndGame}
                  className="w-full sm:w-auto btn btn-accent flex items-center justify-center text-sm"
                >
                  <FaCheck className="mr-2" /> Завершить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default GameBoard;