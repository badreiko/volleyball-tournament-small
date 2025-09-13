import { useState, useEffect } from 'react';
import { FaVolleyballBall } from 'react-icons/fa';
import { t } from '../localization';
import { getPlayerRatings } from '../utils/storage';

const PlayerInput = ({ onStartTournament }) => {
  const [playerCount, setPlayerCount] = useState('');
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [allPlayerNames, setAllPlayerNames] = useState([]); // Для автозаполнения
  const [suggestions, setSuggestions] = useState([]);
  const [componentKey, setComponentKey] = useState(0); // Force re-render key
  const [focusedInput, setFocusedInput] = useState(-1); // Track which input is focused

  // Reset component state when mounted
  useEffect(() => {
    setPlayerCount('');
    setPlayers([]);
    setError('');
    setSuggestions([]);
    setFocusedInput(-1);
    setComponentKey(prev => prev + 1);
  }, []);

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
    
    // Always clear suggestions and focus when changing count
    setSuggestions([]);
    setFocusedInput(-1);
    
    if (count < 8 || count > 18) {
      setError(t('playerInput.playerCountError'));
      setPlayers([]);
    } else {
      setError('');
      setPlayers(Array(count).fill(''));
      // Force component key update to ensure fresh input fields
      setComponentKey(prev => prev + 1);
    }
  };

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);

    // Set focused input
    setFocusedInput(index);

    // Clear suggestions first to prevent interference
    setSuggestions([]);

    // Логика автозаполнения - only show for current field
    if (value.length > 0) {
      const filteredSuggestions = allPlayerNames.filter(name =>
        name.toLowerCase().startsWith(value.toLowerCase()) &&
        !newPlayers.includes(name) // Don't suggest already entered names
      );
      setSuggestions(filteredSuggestions);
    }
  };

  const handleSuggestionClick = (index, suggestion) => {
    const newPlayers = [...players];
    newPlayers[index] = suggestion;
    setPlayers(newPlayers);
    setSuggestions([]); // Очистить предложения после выбора
    setFocusedInput(-1); // Clear focus after selection
  };

  const handleInputFocus = (index) => {
    setFocusedInput(index);
  };

  const handleInputBlur = () => {
    // Delay clearing suggestions to allow click on suggestions
    setTimeout(() => {
      setSuggestions([]);
      setFocusedInput(-1);
    }, 150);
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
        <div className="mb-6 px-1">
          <label className="block text-sm font-medium text-darkBlue mb-2">
            {t('playerInput.playerCount')}
          </label>
          <input
            type="number"
            value={playerCount}
            onChange={handleCountChange}
            className="input-field"
            placeholder="8–18"
          />
        </div>
        {error && (
          <p className="text-accent mb-6 text-center bg-accent/10 p-2 rounded-md">
            {error}
          </p>
        )}
        {players.length > 0 && (
          <div className="mb-6 max-h-64 overflow-y-auto pr-2 px-1">
            {players.map((player, index) => (
              <div key={`${componentKey}-player-${index}`} className="relative mb-3 px-1">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => handlePlayerChange(index, e.target.value)}
                  onFocus={() => handleInputFocus(index)}
                  onBlur={handleInputBlur}
                  className="input-field"
                  placeholder={`${t('playerInput.playerNamePlaceholder')} ${index + 1}`}
                  autoComplete="off"
                />
                {suggestions.length > 0 && player.length > 0 && focusedInput === index && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                    {suggestions.map((suggestion, sIndex) => (
                      <li
                        key={`suggestion-${sIndex}-${suggestion}`}
                        onClick={() => handleSuggestionClick(index, suggestion)}
                        className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-darkBlue dark:text-white"
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