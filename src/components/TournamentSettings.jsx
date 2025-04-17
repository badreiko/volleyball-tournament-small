import { useState, useEffect } from 'react';
import { FaCog, FaToggleOn, FaToggleOff, FaArrowLeft, FaSave } from 'react-icons/fa';

const TournamentSettings = ({ onBack, onSave }) => {
  const [settings, setSettings] = useState({
    useBalancing: true,
    maxScoreRounds: {
      full: 25,
      triples: 15,
      doubles: 25
    },
    minPointDifference: 2,
    roundDuration: 10, // длительность раунда в минутах (для двоек)
    showTeamRatings: true,
    showPredictions: true,
    pointsForWin: 3,
    pointsForLoseGood: 2, // при 10+ очках
    pointsForLoseBad: 1 // при менее 10 очках
  });
  
  // Загружаем настройки из localStorage при монтировании
  useEffect(() => {
    const savedSettings = localStorage.getItem('tournamentSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleMaxScoreChange = (format, value) => {
    setSettings(prev => ({
      ...prev,
      maxScoreRounds: {
        ...prev.maxScoreRounds,
        [format]: parseInt(value, 10)
      }
    }));
  };
  
  const handlePointsChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: parseInt(value, 10)
    }));
  };
  
  const handleSave = () => {
    // Сохраняем настройки в localStorage
    localStorage.setItem('tournamentSettings', JSON.stringify(settings));
    onSave(settings);
  };
  
  return (
    <div className="p-4 md:p-6">
      <button onClick={onBack} className="mb-4 flex items-center text-darkBlue hover:text-cyan transition-colors">
        <FaArrowLeft className="mr-2" /> Назад
      </button>
      
      <div className="card mx-auto max-w-4xl fade-in">
        <h2 className="text-2xl font-bold text-darkBlue mb-6 flex items-center">
          <FaCog className="mr-3 text-cyan" /> Настройки турнира
        </h2>
        
        <div className="space-y-8">
          {/* Основные настройки */}
          <div>
            <h3 className="text-lg font-semibold text-darkBlue mb-4 border-b border-darkBlue/20 pb-2">
              Основные настройки
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <div>
                  <h4 className="font-medium text-darkBlue">Использовать балансировку команд</h4>
                  <p className="text-sm text-darkBlue/70">Команды будут формироваться с учётом рейтинга игроков</p>
                </div>
                <button 
                  onClick={() => handleToggle('useBalancing')}
                  className="text-2xl text-cyan"
                >
                  {settings.useBalancing ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <div>
                  <h4 className="font-medium text-darkBlue">Показывать рейтинг команд</h4>
                  <p className="text-sm text-darkBlue/70">Отображать средний рейтинг команд во время игры</p>
                </div>
                <button 
                  onClick={() => handleToggle('showTeamRatings')}
                  className="text-2xl text-cyan"
                >
                  {settings.showTeamRatings ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <div>
                  <h4 className="font-medium text-darkBlue">Показывать прогнозы</h4>
                  <p className="text-sm text-darkBlue/70">Отображать вероятность победы команд перед игрой</p>
                </div>
                <button 
                  onClick={() => handleToggle('showPredictions')}
                  className="text-2xl text-cyan"
                >
                  {settings.showPredictions ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <div>
                  <h4 className="font-medium text-darkBlue">Минимальная разница в очках для победы</h4>
                  <p className="text-sm text-darkBlue/70">Необходимое преимущество для завершения игры</p>
                </div>
                <div className="w-20">
                  <input 
                    type="number" 
                    min="1" 
                    max="5"
                    value={settings.minPointDifference} 
                    onChange={(e) => handlePointsChange('minPointDifference', e.target.value)}
                    className="w-full p-2 border border-darkBlue/30 rounded-lg bg-white text-darkBlue text-center"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <div>
                  <h4 className="font-medium text-darkBlue">Длительность раунда для двоек (минут)</h4>
                  <p className="text-sm text-darkBlue/70">Время на один раунд в формате двоек</p>
                </div>
                <div className="w-20">
                  <input 
                    type="number" 
                    min="5" 
                    max="20"
                    value={settings.roundDuration} 
                    onChange={(e) => handlePointsChange('roundDuration', e.target.value)}
                    className="w-full p-2 border border-darkBlue/30 rounded-lg bg-white text-darkBlue text-center"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Настройки счета для форматов */}
          <div>
            <h3 className="text-lg font-semibold text-darkBlue mb-4 border-b border-darkBlue/20 pb-2">
              Настройки игры по форматам
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <h4 className="font-medium text-darkBlue mb-2">Полные команды</h4>
                <div className="flex items-center mb-2">
                  <span className="text-sm text-darkBlue/70 mr-2">Макс. счёт:</span>
                  <input 
                    type="number" 
                    min="15" 
                    max="30"
                    value={settings.maxScoreRounds.full} 
                    onChange={(e) => handleMaxScoreChange('full', e.target.value)}
                    className="w-16 p-2 border border-darkBlue/30 rounded-lg bg-white text-darkBlue text-center"
                  />
                </div>
                <p className="text-xs text-darkBlue/60">Формат для 12-14 игроков</p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <h4 className="font-medium text-darkBlue mb-2">Тройки</h4>
                <div className="flex items-center mb-2">
                  <span className="text-sm text-darkBlue/70 mr-2">Макс. счёт:</span>
                  <input 
                    type="number" 
                    min="15" 
                    max="25"
                    value={settings.maxScoreRounds.triples} 
                    onChange={(e) => handleMaxScoreChange('triples', e.target.value)}
                    className="w-16 p-2 border border-darkBlue/30 rounded-lg bg-white text-darkBlue text-center"
                  />
                </div>
                <p className="text-xs text-darkBlue/60">Формат для 15 или 18 игроков</p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <h4 className="font-medium text-darkBlue mb-2">Двойки</h4>
                <div className="flex items-center mb-2">
                  <span className="text-sm text-darkBlue/70 mr-2">Макс. счёт:</span>
                  <input 
                    type="number" 
                    min="15" 
                    max="25"
                    value={settings.maxScoreRounds.doubles} 
                    onChange={(e) => handleMaxScoreChange('doubles', e.target.value)}
                    className="w-16 p-2 border border-darkBlue/30 rounded-lg bg-white text-darkBlue text-center"
                  />
                </div>
                <p className="text-xs text-darkBlue/60">Формат для 16-17 игроков</p>
              </div>
            </div>
          </div>
          
          {/* Настройки очков */}
          <div>
            <h3 className="text-lg font-semibold text-darkBlue mb-4 border-b border-darkBlue/20 pb-2">
              Начисление очков
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <h4 className="font-medium text-darkBlue mb-2">За победу</h4>
                <div className="flex items-center">
                  <span className="text-sm text-darkBlue/70 mr-2">Очки:</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="5"
                    value={settings.pointsForWin} 
                    onChange={(e) => handlePointsChange('pointsForWin', e.target.value)}
                    className="w-16 p-2 border border-darkBlue/30 rounded-lg bg-white text-darkBlue text-center"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <h4 className="font-medium text-darkBlue mb-2">За поражение (10+ очков)</h4>
                <div className="flex items-center">
                  <span className="text-sm text-darkBlue/70 mr-2">Очки:</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="3"
                    value={settings.pointsForLoseGood} 
                    onChange={(e) => handlePointsChange('pointsForLoseGood', e.target.value)}
                    className="w-16 p-2 border border-darkBlue/30 rounded-lg bg-white text-darkBlue text-center"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-cyan/10 to-darkBlue/5 rounded-lg">
                <h4 className="font-medium text-darkBlue mb-2">За поражение (менее 10 очков)</h4>
                <div className="flex items-center">
                    <span className="text-sm text-darkBlue/70 mr-2">Очки:</span>
                    <input 
                    type="number" 
                    min="0" 
                    max="2"
                    value={settings.pointsForLoseBad} 
                    onChange={(e) => handlePointsChange('pointsForLoseBad', e.target.value)}
                    className="w-16 p-2 border border-darkBlue/30 rounded-lg bg-white text-darkBlue text-center"
                    />
                </div>
             </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-darkBlue/20">
            <button onClick={handleSave} className="btn btn-accent flex items-center">
              <FaSave className="mr-2" /> Сохранить настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentSettings;