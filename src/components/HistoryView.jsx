import { useState, useEffect } from 'react';

const HistoryView = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Загружаем историю из LocalStorage
    const savedHistory = JSON.parse(localStorage.getItem('tournamentHistory')) || [];
    setHistory(savedHistory);
  }, []);

  return (
    <div className="min-h-screen bg-darkPurple p-4">
      <div className="card mx-auto max-w-3xl">
        <h2 className="text-xl font-bold text-darkBlue mb-4">История турниров</h2>
        {history.length === 0 ? (
          <p className="text-darkBlue">Пока нет завершённых турниров.</p>
        ) : (
          <div className="space-y-4">
            {history.map((tournament, index) => (
              <div key={index} className="p-4 rounded-md bg-cyan/20">
                <h3 className="font-semibold text-darkBlue">
                  Турнир {index + 1} ({new Date(tournament.date).toLocaleString()})
                </h3>
                <p className="text-darkBlue">Команд: {tournament.teams?.length || 0}</p>
                <p className="text-darkBlue">Игр: {tournament.games?.length || 0}</p>
                {tournament.results && (
                  <div>
                    <h4 className="font-semibold text-darkBlue mt-2">Результаты:</h4>
                    {tournament.results.map((result, i) => (
                      <p key={i} className="text-darkBlue">
                        {i + 1}. {result.name}: {result.points} очков
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;