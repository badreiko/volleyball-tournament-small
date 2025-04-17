import { useState } from 'react';
import { FaVolleyballBall } from 'react-icons/fa';

const PlayerInput = ({ onStartTournament }) => {
  const [playerCount, setPlayerCount] = useState('');
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  const handleCountChange = (e) => {
    const count = parseInt(e.target.value);
    setPlayerCount(count);
    if (count < 12 || count > 18) {
      setError('Количество участников должно быть от 12 до 18');
      setPlayers([]);
    } else {
      setError('');
      setPlayers(Array(count).fill(''));
    }
  };

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = () => {
    if (players.some((p) => !p.trim())) {
      setError('Все имена должны быть заполнены');
      return;
    }
    if (new Set(players).size !== players.length) {
      setError('Имена должны быть уникальными');
      return;
    }
    onStartTournament(players);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="card max-w-md mx-auto fade-in">
        <h2 className="text-2xl font-bold text-darkBlue flex items-center mb-6">
          <FaVolleyballBall className="mr-3 text-cyan" /> Начать турнир
        </h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-darkBlue mb-2">
            Количество участников
          </label>
          <input
            type="number"
            value={playerCount}
            onChange={handleCountChange}
            className="input-field"
            placeholder="12–18"
          />
        </div>
        {error && (
          <p className="text-accent mb-6 text-center bg-accent/10 p-2 rounded-md">
            {error}
          </p>
        )}
        {players.length > 0 && (
          <div className="mb-6 max-h-64 overflow-y-auto pr-2">
            {players.map((player, index) => (
              <input
                key={index}
                type="text"
                value={player}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                className="input-field mb-3"
                placeholder={`Имя игрока ${index + 1}`}
              />
            ))}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={players.length === 0 || error}
          className="btn btn-accent w-full glow"
        >
          Начать турнир
        </button>
      </div>
    </div>
  );
};

export default PlayerInput;