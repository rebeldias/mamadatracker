import React, { useState, useEffect } from 'react';
import { Clock, Heart, Play, Pause, Square, Download, User, Baby, FileText, Home } from 'lucide-react';

const MamadaTracker = () => {
  // Estados principais
  const [currentView, setCurrentView] = useState('profile');
  const [profile, setProfile] = useState({ motherName: '', babyName: '' });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSide, setSelectedSide] = useState('');
  const [sessions, setSessions] = useState([]);
  const [startTime, setStartTime] = useState(null);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('mamada-profile') || '{}');
    const savedSessions = JSON.parse(localStorage.getItem('mamada-sessions') || '[]');
    
    if (savedProfile.motherName && savedProfile.babyName) {
      setProfile(savedProfile);
      setCurrentView('home');
    }
    setSessions(savedSessions);
  }, []);

  // Timer
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Salvar perfil
  const saveProfile = () => {
    if (profile.motherName.trim() && profile.babyName.trim()) {
      localStorage.setItem('mamada-profile', JSON.stringify(profile));
      setCurrentView('home');
    } else {
      alert('Por favor, preencha todos os campos do perfil!');
    }
  };

  // Controles do timer
  const startTimer = (side) => {
    setSelectedSide(side);
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = () => {
    if (currentTime > 0) {
      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR'),
        side: selectedSide,
        duration: currentTime,
        motherName: profile.motherName,
        babyName: profile.babyName
      };
      
      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem('mamada-sessions', JSON.stringify(updatedSessions));
    }
    
    resetTimer();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(0);
    setSelectedSide('');
    setStartTime(null);
  };

  // Formatação do tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Exportar relatório
  const exportReport = (type) => {
    const today = new Date().toLocaleDateString('pt-BR');
    const todaySessions = sessions.filter(session => session.date === today);
    
    let report = `📊 *Relatório de Mamadas - ${today}*\n`;
    report += `👩 Mãe: ${profile.motherName}\n`;
    report += `👶 Bebê: ${profile.babyName}\n\n`;
    
    if (todaySessions.length === 0) {
      report += "Nenhuma mamada registrada hoje.";
    } else {
      report += `📈 Total de mamadas: ${todaySessions.length}\n\n`;
      todaySessions.forEach((session, index) => {
        report += `${index + 1}. ${session.time} - ${session.side === 'left' ? 'Seio Esquerdo' : 'Seio Direito'} - ${formatTime(session.duration)}\n`;
      });
      
      const totalTime = todaySessions.reduce((acc, session) => acc + session.duration, 0);
      report += `\n⏱️ Tempo total: ${formatTime(totalTime)}`;
    }
    
    report += "\n\n💜 Gerado pelo Mamada Tracker";

    if (type === 'whatsapp') {
      const url = `https://wa.me/?text=${encodeURIComponent(report)}`;
      window.open(url, '_blank');
    } else if (type === 'email') {
      const subject = `Relatório de Mamadas - ${today}`;
      const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(report)}`;
      window.open(url, '_blank');
    }
  };

  // Tela do Perfil
  const ProfileScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-purple-600 fill-current" />
              <Clock className="w-6 h-6 text-purple-600 absolute" />
            </div>
            <h1 className="text-2xl font-bold text-purple-800">Mamada Tracker</h1>
            <p className="text-purple-600">Configure seu perfil para começar</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-purple-700 font-medium mb-2">
                <User className="w-4 h-4 mr-2" />
                Nome da Mãe
              </label>
              <input
                type="text"
                value={profile.motherName}
                onChange={(e) => setProfile({...profile, motherName: e.target.value})}
                className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="Digite seu nome"
              />
            </div>
            
            <div>
              <label className="flex items-center text-purple-700 font-medium mb-2">
                <Baby className="w-4 h-4 mr-2" />
                Nome do Bebê
              </label>
              <input
                type="text"
                value={profile.babyName}
                onChange={(e) => setProfile({...profile, babyName: e.target.value})}
                className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="Digite o nome do bebê"
              />
            </div>
            
            <button
              onClick={saveProfile}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all"
            >
              Salvar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Tela Principal
  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-purple-800">Olá, {profile.motherName}!</h2>
            <p className="text-purple-600">Hora da mamada do {profile.babyName}</p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-purple-700 mb-4">
              {formatTime(currentTime)}
            </div>
            {selectedSide && (
              <div className="text-lg text-purple-600 mb-4">
                {selectedSide === 'left' ? '🤱 Seio Esquerdo' : '🤱 Seio Direito'}
              </div>
            )}
          </div>

          {/* Controles */}
          {!isRunning ? (
            <div className="space-y-3">
              <p className="text-center text-purple-600 font-medium">Selecione o lado:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => startTimer('left')}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all"
                >
                  Seio Esquerdo
                </button>
                <button
                  onClick={() => startTimer('right')}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all"
                >
                  Seio Direito
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={pauseTimer}
                className="flex-1 bg-yellow-500 text-white p-4 rounded-xl font-medium hover:bg-yellow-600 transition-all flex items-center justify-center"
              >
                {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                {isPaused ? 'Retomar' : 'Pausar'}
              </button>
              <button
                onClick={stopTimer}
                className="flex-1 bg-red-500 text-white p-4 rounded-xl font-medium hover:bg-red-600 transition-all flex items-center justify-center"
              >
                <Square className="w-5 h-5 mr-2" />
                Parar
              </button>
            </div>
          )}
        </div>

        {/* Sessões Recentes */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-purple-800 mb-4">Última Mamada</h3>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-purple-700">
                    {sessions[0].side === 'left' ? 'Seio Esquerdo' : 'Seio Direito'}
                  </p>
                  <p className="text-sm text-purple-600">
                    {sessions[0].date} às {sessions[0].time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-700">
                    {formatTime(sessions[0].duration)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Tela de Relatórios
  const ReportsScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
          <h2 className="text-xl font-bold text-purple-800 text-center mb-4">Relatórios</h2>
          
          <div className="space-y-3 mb-6">
            <button
              onClick={() => exportReport('whatsapp')}
              className="w-full bg-green-500 text-white p-4 rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar para WhatsApp
            </button>
            
            <button
              onClick={() => exportReport('email')}
              className="w-full bg-blue-500 text-white p-4 rounded-xl font-medium hover:bg-blue-600 transition-all flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar por Email
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h3 className="font-bold text-purple-800">Histórico de Hoje</h3>
            {sessions
              .filter(session => session.date === new Date().toLocaleDateString('pt-BR'))
              .map(session => (
                <div key={session.id} className="bg-purple-50 p-3 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-purple-700">
                        {session.side === 'left' ? 'Seio Esquerdo' : 'Seio Direito'}
                      </p>
                      <p className="text-sm text-purple-600">{session.time}</p>
                    </div>
                    <p className="text-lg font-bold text-purple-700">
                      {formatTime(session.duration)}
                    </p>
                  </div>
                </div>
              ))}
            {sessions.filter(session => session.date === new Date().toLocaleDateString('pt-BR')).length === 0 && (
              <p className="text-center text-purple-600">Nenhuma mamada registrada hoje</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Navigation Bottom
  const Navigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-200">
      <div className="flex justify-around py-2">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center p-2 ${currentView === 'home' ? 'text-purple-600' : 'text-gray-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Início</span>
        </button>
        <button
          onClick={() => setCurrentView('reports')}
          className={`flex flex-col items-center p-2 ${currentView === 'reports' ? 'text-purple-600' : 'text-gray-400'}`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-xs">Relatórios</span>
        </button>
        <button
          onClick={() => setCurrentView('profile')}
          className={`flex flex-col items-center p-2 ${currentView === 'profile' ? 'text-purple-600' : 'text-gray-400'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Perfil</span>
        </button>
      </div>
    </div>
  );

  // Footer
  const Footer = () => (
    <div className="text-center py-4 text-sm text-purple-600">
      Desenvolvido por @fonoizabeldias com 💜 para todas as mamães
    </div>
  );

  return (
    <div className="pb-20">
      {currentView === 'profile' && <ProfileScreen />}
      {currentView === 'home' && profile.motherName && profile.babyName && <HomeScreen />}
      {currentView === 'reports' && profile.motherName && profile.babyName && <ReportsScreen />}
      
      {profile.motherName && profile.babyName && <Navigation />}
      <Footer />
    </div>
  );
};

export default MamadaTracker;