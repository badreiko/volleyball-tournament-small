import { useState, useEffect } from 'react';
import { FaUsers, FaExchangeAlt, FaCheck, FaTimes, FaRandom } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { t } from '../localization';

const TeamCompositionModal = ({
  teams,
  onCompositionChange,
  onCancel,
  isVisible,
  currentSet
}) => {
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [draggedPlayer, setDraggedPlayer] = useState(null);

  useEffect(() => {
    if (teams && teams.length === 2) {
      setTeam1Players([...teams[0].players]);
      setTeam2Players([...teams[1].players]);
    }
  }, [teams]);

  const allPlayers = [...team1Players, ...team2Players];

  // Перемешать игроков между командами
  const shuffleTeams = () => {
    const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    setTeam1Players(shuffled.slice(0, mid));
    setTeam2Players(shuffled.slice(mid));
  };

  // Поменять команды местами
  const swapTeams = () => {
    const temp = [...team1Players];
    setTeam1Players([...team2Players]);
    setTeam2Players(temp);
  };

  // Drag and drop handlers
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
      setTeam1Players(prev => prev.filter(p => p !== player));
    } else {
      setTeam2Players(prev => prev.filter(p => p !== player));
    }

    // Добавляем игрока в целевую команду
    if (target === 'team1') {
      setTeam1Players(prev => [...prev, player]);
    } else {
      setTeam2Players(prev => [...prev, player]);
    }

    setDraggedPlayer(null);
  };

  // Перемещение игрока кнопкой
  const movePlayer = (player, from, to) => {
    if (from === 'team1') {
      setTeam1Players(prev => prev.filter(p => p !== player));
      setTeam2Players(prev => [...prev, player]);
    } else {
      setTeam2Players(prev => prev.filter(p => p !== player));
      setTeam1Players(prev => [...prev, player]);
    }
  };

  const handleConfirm = () => {
    onCompositionChange(team1Players, team2Players);
  };

  const isCompositionChanged = () => {
    if (!teams || teams.length !== 2) return false;

    const originalTeam1 = teams[0].players.sort();
    const originalTeam2 = teams[1].players.sort();
    const currentTeam1 = team1Players.sort();
    const currentTeam2 = team2Players.sort();

    return JSON.stringify(originalTeam1) !== JSON.stringify(currentTeam1) ||
           JSON.stringify(originalTeam2) !== JSON.stringify(currentTeam2);
  };

  if (!isVisible || !teams) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-[70] backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-darkBlue to-cyan text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <FaUsers className="mr-3" />
              {t('teamComposition.title')}
            </h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-accent transition-colors text-3xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="mt-2 text-white/90">
            {t('teamComposition.beforeSetDescription', { set: currentSet + 1 })}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Control buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={shuffleTeams}
              className="btn bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center"
            >
              <FaRandom className="mr-2" />
              {t('teamComposition.shuffle')}
            </button>
            <button
              onClick={swapTeams}
              className="btn bg-green-100 text-green-600 hover:bg-green-200 flex items-center"
            >
              <FaExchangeAlt className="mr-2" />
              {t('teamComposition.swapTeams')}
            </button>
          </div>

          {/* Teams */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Team 1 */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'team1')}
              className="card bg-blue-50 border-blue-200"
            >
              <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center">
                <FaUsers className="mr-2" />
                {teams[0].name} ({team1Players.length})
              </h3>

              <div className="space-y-2">
                {team1Players.map((player) => (
                  <motion.div
                    key={player}
                    layout
                    draggable
                    onDragStart={(e) => handleDragStart(e, player, 'team1')}
                    className="bg-white rounded-lg p-3 shadow-sm border border-blue-200 cursor-move hover:shadow-md transition-all group flex items-center justify-between"
                  >
                    <span className="font-medium text-darkBlue">{player}</span>
                    <button
                      onClick={() => movePlayer(player, 'team1', 'team2')}
                      className="opacity-0 group-hover:opacity-100 btn btn-sm bg-green-100 text-green-600 hover:bg-green-200 transition-opacity"
                      title={t('teamComposition.moveToTeam2')}
                    >
                      →
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Team 2 */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'team2')}
              className="card bg-green-50 border-green-200"
            >
              <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center">
                <FaUsers className="mr-2" />
                {teams[1].name} ({team2Players.length})
              </h3>

              <div className="space-y-2">
                {team2Players.map((player) => (
                  <motion.div
                    key={player}
                    layout
                    draggable
                    onDragStart={(e) => handleDragStart(e, player, 'team2')}
                    className="bg-white rounded-lg p-3 shadow-sm border border-green-200 cursor-move hover:shadow-md transition-all group flex items-center justify-between"
                  >
                    <span className="font-medium text-darkBlue">{player}</span>
                    <button
                      onClick={() => movePlayer(player, 'team2', 'team1')}
                      className="opacity-0 group-hover:opacity-100 btn btn-sm bg-blue-100 text-blue-600 hover:bg-blue-200 transition-opacity"
                      title={t('teamComposition.moveToTeam1')}
                    >
                      ←
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-darkBlue mb-1">
                  {t('teamComposition.status')}
                </h4>
                <p className="text-sm text-darkBlue/70">
                  {isCompositionChanged()
                    ? t('teamComposition.compositionChanged')
                    : t('teamComposition.noChanges')
                  }
                </p>
              </div>
              <div className="text-sm text-darkBlue/70">
                {t('teamComposition.teamSizes')}: {team1Players.length} vs {team2Players.length}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={team1Players.length === 0 || team2Players.length === 0}
              className="btn btn-accent flex-1 flex items-center justify-center"
            >
              <FaCheck className="mr-2" />
              {t('teamComposition.applyChanges')}
            </button>
            <button
              onClick={onCancel}
              className="btn btn-ghost flex-1 flex items-center justify-center"
            >
              <FaTimes className="mr-2" />
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamCompositionModal;