import { useState, useEffect, useCallback } from 'react';
import { FaVolleyballBall } from 'react-icons/fa';
import { t } from '../localization';
import { getPlayerRatings } from '../utils/storage';

const PlayerInput = ({ onStartTournament }) => {
  const [playerCount, setPlayerCount] = useState('');
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [allPlayerNames, setAllPlayerNames] = useState([]); // Для автозаполнения
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchPlayerNames = async () => {
      const ratings = await getPlayerRatings();
      setAllPlayerNames(Object.keys(ratings));
    };
    fetchPlayerNames();
  }, []);

  const handleCountChange = (e) => {
    const count = parseInt(e.target.value);
    setPlayerCount(count);
    if (count < 12 || count > 18) {
      setError(t('playerInput.playerCountError'));
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

    // Логика автозаполнения
    if (value.length > 0) {
      const filteredSuggestions = allPlayerNames.filter(name =>
        name.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (index, suggestion) => {
    const newPlayers = [...players];
    newPlayers[index] = suggestion;
    setPlayers(newPlayers);
    setSuggestions([]); // Очистить предложения после выбора
  };

  const handleSubmit = () => {
    if (players.some((p) => !p.trim())) {
      setError(t('playerInput.playerNameError'));
      return;
    }
    if (new Set(players).size !== players.length) {
      setError(t('playerInput.uniqueNameError'));
      return;
    }
    onStartTournament(players);
  };

  return (
    <div className="p-4 md:p-6 pb-16">
      <div className="card max-w-md mx-auto fade-in">
        <h2 className="text-2xl font-bold text-darkBlue flex items-center mb-6">
          <FaVolleyballBall className="mr-3 text-cyan" /> {t('playerInput.startTournament')}
        </h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-darkBlue mb-2">
            {t('playerInput.playerCount')}
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
              <div key={index} className="relative mb-3">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => handlePlayerChange(index, e.target.value)}
                  className="input-field"
                  placeholder={`${t('playerInput.playerNamePlaceholder')} ${index + 1}`}
                />
                {suggestions.length > 0 && player.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                    {suggestions.map((suggestion, sIndex) => (
                      <li
                        key={sIndex}
                        onClick={() => handleSuggestionClick(index, suggestion)}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={players.length === 0 || error}
          className="btn btn-accent w-full glow"
        >
          {t('playerInput.startTournament')}
        </button>
      </div>
    </div>
  );
};

export default PlayerInput;