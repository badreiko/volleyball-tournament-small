const ResultsTable = ({ results }) => {
  const sortedResults = [...results].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-darkPurple p-4">
      <div className="card mx-auto max-w-3xl">
        <h2 className="text-xl font-bold text-darkBlue mb-4">Итоговые результаты</h2>
        {sortedResults.length === 0 ? (
          <p className="text-darkBlue">Пока нет результатов.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-darkBlue">
                  <th className="p-2 text-darkBlue">Место</th>
                  <th className="p-2 text-darkBlue">Команда</th>
                  <th className="p-2 text-darkBlue">Очки</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result, index) => (
                  <tr key={result.name} className="border-b border-darkBlue/50">
                    <td className="p-2 text-darkBlue">{index + 1}</td>
                    <td className="p-2 text-darkBlue">{result.name}</td>
                    <td className="p-2 text-darkBlue">{result.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsTable;