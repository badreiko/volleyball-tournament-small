import { useState, useEffect } from 'react';
import { FaUsers, FaArrowLeft, FaArrowRight, FaExchangeAlt, FaRandom, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { t } from '../localization';

const ManualTeamBuilder = ({ players, onTeamsCreated, onBack }) => {
  const [team1, setTeam1] = useState([]);
  const [team2, setTeam2] = useState([]);
  const [unassigned, setUnassigned] = useState([...players]);
  const [draggedPlayer, setDraggedPlayer] = useState(null);

  // Автоматическое распределение для начального состояния
  const autoDistribute = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);

    setTeam1(shuffled.slice(0, mid));
    setTeam2(shuffled.slice(mid));
    setUnassigned([]);
  };

  // Очистить все команды
  const clearAll = () => {
    setTeam1([]);
    setTeam2([]);
    setUnassigned([...players]);
  };

  // Обработка drag and drop
  const handleDragStart = (e, player, source) => {
    setDraggedPlayer({ player, source });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    if (!draggedPlayer) return;

    const { player, source } = draggedPlayer;

    // Удаляем игрока из источника
    if (source === 'team1') {
      setTeam1(prev => prev.filter(p => p !== player));
    } else if (source === 'team2') {
      setTeam2(prev => prev.filter(p => p !== player));
    } else if (source === 'unassigned') {
      setUnassigned(prev => prev.filter(p => p !== player));
    }

    // Добавляем игрока в целевую область
    if (target === 'team1' && team1.length < Math.ceil(players.length / 2)) {
      setTeam1(prev => [...prev, player]);
    } else if (target === 'team2' && team2.length < Math.ceil(players.length / 2)) {
      setTeam2(prev => [...prev, player]);
    } else if (target === 'unassigned') {
      setUnassigned(prev => [...prev, player]);
    } else {
      // Если нельзя добавить в целевую область, возвращаем в источник
      if (source === 'team1') {
        setTeam1(prev => [...prev, player]);
      } else if (source === 'team2') {
        setTeam2(prev => [...prev, player]);
      } else if (source === 'unassigned') {
        setUnassigned(prev => [...prev, player]);
      }
    }

    setDraggedPlayer(null);
  };

  // Перемещение игрока кнопками
  const movePlayer = (player, from, to) => {
    // Проверяем лимиты команд
    const maxTeamSize = Math.ceil(players.length / 2);
    if ((to === 'team1' && team1.length >= maxTeamSize) ||
        (to === 'team2' && team2.length >= maxTeamSize)) {
      return;
    }

    // Удаляем из источника
    if (from === 'team1') {
      setTeam1(prev => prev.filter(p => p !== player));
    } else if (from === 'team2') {
      setTeam2(prev => prev.filter(p => p !== player));
    } else if (from === 'unassigned') {
      setUnassigned(prev => prev.filter(p => p !== player));
    }

    // Добавляем в целевую область
    if (to === 'team1') {
      setTeam1(prev => [...prev, player]);
    } else if (to === 'team2') {
      setTeam2(prev => [...prev, player]);
    } else if (to === 'unassigned') {
      setUnassigned(prev => [...prev, player]);
    }
  };

  const isValidDistribution = () => {
    return unassigned.length === 0 && team1.length > 0 && team2.length > 0;
  };

  const handleCreateTeams = () => {
    if (!isValidDistribution()) return;

    const teams = [
      { name: 'Команда 1', players: team1, teamRating: 0 },
      { name: 'Команда 2', players: team2, teamRating: 0 }
    ];

    onTeamsCreated(teams);
  };

  // Компонент игрока
  const PlayerCard = ({ player, source, onMove }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      draggable
      onDragStart={(e) => handleDragStart(e, player, source)}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-darkBlue">{player}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {source !== 'team1' && team1.length < Math.ceil(players.length / 2) && (
            <button
              onClick={() => onMove(player, source, 'team1')}
              className="btn btn-sm bg-blue-100 text-blue-600 hover:bg-blue-200 p-1 rounded"
              title={t('manualTeam.moveToTeam1')}
            >
              1
            </button>
          )}
          {source !== 'team2' && team2.length < Math.ceil(players.length / 2) && (
            <button
              onClick={() => onMove(player, source, 'team2')}
              className="btn btn-sm bg-green-100 text-green-600 hover:bg-green-200 p-1 rounded"
              title={t('manualTeam.moveToTeam2')}
            >
              2
            </button>
          )}
          {source !== 'unassigned' && (
            <button
              onClick={() => onMove(player, source, 'unassigned')}
              className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200 p-1 rounded"
              title={t('manualTeam.moveToUnassigned')}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Компонент зоны команды
  const TeamZone = ({ title, players, teamKey, color }) => (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, teamKey)}
      className={`card min-h-64 ${
        draggedPlayer ? 'ring-2 ring-dashed ring-gray-300' : ''
      } transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold flex items-center ${color}`}>
          <FaUsers className="mr-2" />
          {title}
        </h3>
        <span className="text-sm text-gray-500">
          {players.length}/{Math.ceil(players.length / 2)} {t('manualTeam.players')}
        </span>
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <PlayerCard
            key={player}
            player={player}
            source={teamKey}
            onMove={movePlayer}
          />
        ))}

        {players.length === 0 && (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            {t('manualTeam.dropPlayersHere')}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 pb-16">
      <div className="max-w-6xl mx-auto fade-in">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="btn btn-ghost flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            {t('common.back')}
          </button>
          <h2 className="text-2xl font-bold text-darkBlue flex items-center">
            <FaUsers className="mr-3 text-cyan" />
            {t('manualTeam.buildTeams')}
          </h2>
          <div></div>
        </div>

        {/* Инструкции и кнопки управления */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-darkBlue mb-2">
                {t('manualTeam.instructions')}
              </h3>
              <p className="text-darkBlue/70 text-sm">
                {t('manualTeam.dragAndDrop')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={autoDistribute}
                className="btn btn-sm bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center"
              >
                <FaRandom className="mr-2" />
                {t('manualTeam.autoDistribute')}
              </button>
              <button
                onClick={clearAll}
                className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center"
              >
                <FaExchangeAlt className="mr-2" />
                {t('manualTeam.clearAll')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Неназначенные игроки */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'unassigned')}
            className={`card min-h-64 ${
              draggedPlayer ? 'ring-2 ring-dashed ring-gray-300' : ''
            }`}
          >
            <h3 className="text-lg font-bold text-gray-600 mb-4 flex items-center">
              <FaUsers className="mr-2" />
              {t('manualTeam.unassigned')} ({unassigned.length})
            </h3>

            <div className="space-y-2">
              {unassigned.map((player) => (
                <PlayerCard
                  key={player}
                  player={player}
                  source="unassigned"
                  onMove={movePlayer}
                />
              ))}

              {unassigned.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  {t('manualTeam.allPlayersAssigned')}
                </div>
              )}
            </div>
          </div>

          {/* Команда 1 */}
          <TeamZone
            title={t('manualTeam.team1')}
            players={team1}
            teamKey="team1"
            color="text-blue-600"
          />

          {/* Команда 2 */}
          <TeamZone
            title={t('manualTeam.team2')}
            players={team2}
            teamKey="team2"
            color="text-green-600"
          />
        </div>

        {/* Валидация и кнопка создания */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="font-semibold text-darkBlue mb-2">
                {t('manualTeam.teamStatus')}
              </h4>
              <div className="space-y-1 text-sm">
                <div className={`flex items-center ${unassigned.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {unassigned.length === 0 ? '✓' : '×'}
                  <span className="ml-2">
                    {t('manualTeam.allPlayersAssignedStatus')}: {unassigned.length === 0 ? t('common.yes') : t('common.no')}
                  </span>
                </div>
                <div className={`flex items-center ${team1.length > 0 && team2.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {team1.length > 0 && team2.length > 0 ? '✓' : '×'}
                  <span className="ml-2">
                    {t('manualTeam.bothTeamsHavePlayers')}: {team1.length > 0 && team2.length > 0 ? t('common.yes') : t('common.no')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateTeams}
              disabled={!isValidDistribution()}
              className={`btn w-full md:w-auto flex items-center justify-center ${
                isValidDistribution()
                  ? 'btn-accent glow'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaCheck className="mr-2" />
              {t('manualTeam.createTeams')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualTeamBuilder;