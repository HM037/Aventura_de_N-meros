import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [playerName, setPlayerName] = useState('');
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [voiceRate, setVoiceRate] = useState(1);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('easy');
  const [gamePhase, setGamePhase] = useState('start'); // start, playing, end
  const inputRef = useRef();

  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      setVoices(synthVoices);
      if (synthVoices.length > 0) setVoice(synthVoices[0]);
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speak = (text) => {
    if (!feedbackEnabled || !voice) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = voiceRate;
    window.speechSynthesis.speak(utterance);
  };

  const generateQuestion = () => {
    let a, b, op;
    switch (difficulty) {
      case 'easy':
        a = Math.floor(Math.random() * 10);
        b = Math.floor(Math.random() * 10);
        op = '+';
        break;
      case 'medium':
        a = Math.floor(Math.random() * 20);
        b = Math.floor(Math.random() * 10);
        op = ['+', '-'][Math.floor(Math.random() * 2)];
        break;
      case 'hard':
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        op = '*';
        break;
      default:
        a = 1;
        b = 1;
        op = '+';
    }

    const qText = `${a} ${op} ${b}`;
    setQuestion(qText);
    speak(`¿Cuánto es ${a} ${op === '*' ? 'por' : op} ${b}?`);
    return { a, b, op };
  };

  const startGame = () => {
    setStarted(true);
    setGamePhase('playing');
    setScore(0);
    setFeedback('');
    generateQuestion();
    inputRef.current?.focus();
  };

  const checkAnswer = () => {
    const [a, op, b] = question.split(' ');
    const correct =
      op === '+' ? parseInt(a) + parseInt(b) :
      op === '-' ? parseInt(a) - parseInt(b) :
      parseInt(a) * parseInt(b);

    if (parseInt(answer) === correct) {
      setFeedback('¡Correcto!');
      setScore(score + 1);
      speak('Correcto');
    } else {
      setFeedback(`Incorrecto. La respuesta era ${correct}`);
      speak(`Incorrecto. La respuesta correcta es ${correct}`);
    }
    setAnswer('');
    setTimeout(() => {
      setFeedback('');
      generateQuestion();
    }, 1500);
  };

  const handleExit = () => {
    speak(`Gracias por jugar, ${playerName}`);
    setGamePhase('end');
    setStarted(false);
    setPlayerName('');
  };

  const handleRestart = () => {
    setPlayerName('');
    setStarted(false);
    setGamePhase('start');
    setAnswer('');
    setFeedback('');
    setScore(0);
  };

  return (
    <div style={{ padding: '2rem', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
      {gamePhase === 'start' && (
        <div>
          <h1>¡Aventura de Números! 🚀</h1>
          <p>Creado por Henry Martínez</p>
          <label>
            Escribe tu nombre:
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={{ marginLeft: '1rem' }}
            />
          </label>
          <br /><br />
          <label>
            Dificultad:
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ marginLeft: '1rem' }}>
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </label>
          <br /><br />
          <label>
            Voz:
            <select value={voice?.name} onChange={(e) => setVoice(voices.find(v => v.name === e.target.value))}>
              {voices.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </label>
          <br /><br />
          <label>
            Velocidad de voz:
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceRate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
            />
            <span> {voiceRate.toFixed(1)}</span>
          </label>
          <br /><br />
          <label>
            Retroalimentación por voz:
            <input
              type="checkbox"
              checked={feedbackEnabled}
              onChange={() => setFeedbackEnabled(!feedbackEnabled)}
              style={{ marginLeft: '1rem' }}
            />
          </label>
          <br /><br />
          <button onClick={startGame}>Iniciar juego</button>
        </div>
      )}

      {gamePhase === 'playing' && (
        <div>
          <h2>Jugador: {playerName}</h2>
          <p>Pregunta: {question}</p>
          <input
            ref={inputRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
            placeholder="Escribe tu respuesta"
            style={{ marginRight: '1rem' }}
          />
          <button onClick={checkAnswer}>Responder</button>
          <p>{feedback}</p>
          <p>Puntaje: {score}</p>
          <button onClick={handleRestart}>Volver al inicio</button>
          <button onClick={handleExit} style={{ marginLeft: '1rem' }}>Salir del juego</button>
        </div>
      )}

      {gamePhase === 'end' && (
        <div>
          <p>Gracias por jugar, {playerName}. Tu puntaje fue: {score}</p>
          <button onClick={handleRestart}>Volver a jugar</button>
        </div>
      )}
    </div>
  );
};

export default App;
