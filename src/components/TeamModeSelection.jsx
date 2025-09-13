import { useState } from 'react';
import { FaRandom, FaUsers, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { t } from '../localization';

const TeamModeSelection = ({ players, onModeSelect, onBack }) => {
  const [selectedMode, setSelectedMode] = useState('auto');

  const handleContinue = () => {
    onModeSelect(selectedMode, players);
  };

  return (
    <div className="p-4 md:p-6 pb-16">
      <div className="card max-w-2xl mx-auto fade-in">
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
            {t('teamMode.selectMode')}
          </h2>
          <div></div>
        </div>

        <div className="mb-6">
          <p className="text-center text-darkBlue/70 mb-2">
            {t('teamMode.playersCount')}: <span className="font-semibold">{players.length}</span>
          </p>
          <p className="text-center text-darkBlue/70">
            {t('teamMode.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Автоматический режим */}
          <div
            className={`card cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedMode === 'auto'
                ? 'ring-2 ring-cyan shadow-lg bg-cyan/5'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedMode('auto')}
          >
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                selectedMode === 'auto' ? 'bg-cyan text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <FaRandom className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-darkBlue mb-3">
                {t('teamMode.automatic')}
              </h3>
              <ul className="text-left text-darkBlue/70 space-y-2">
                <li>• {t('teamMode.autoFeature1')}</li>
                <li>• {t('teamMode.autoFeature2')}</li>
                <li>• {t('teamMode.autoFeature3')}</li>
              </ul>
            </div>
          </div>

          {/* Ручной режим */}
          <div
            className={`card cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedMode === 'manual'
                ? 'ring-2 ring-cyan shadow-lg bg-cyan/5'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedMode('manual')}
          >
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                selectedMode === 'manual' ? 'bg-cyan text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <FaUsers className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-darkBlue mb-3">
                {t('teamMode.manual')}
              </h3>
              <ul className="text-left text-darkBlue/70 space-y-2">
                <li>• {t('teamMode.manualFeature1')}</li>
                <li>• {t('teamMode.manualFeature2')}</li>
                <li>• {t('teamMode.manualFeature3')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Информация о выбранном режиме */}
        <div className="mb-6 p-4 bg-gradient-to-r from-cyan/10 to-darkBlue/10 rounded-lg">
          <h4 className="font-semibold text-darkBlue mb-2">
            {selectedMode === 'auto' ? t('teamMode.automatic') : t('teamMode.manual')}
          </h4>
          <p className="text-darkBlue/70 text-sm">
            {selectedMode === 'auto'
              ? t('teamMode.autoDescription')
              : t('teamMode.manualDescription')
            }
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="btn btn-accent w-full glow flex items-center justify-center"
        >
          {t('common.continue')}
          <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default TeamModeSelection;