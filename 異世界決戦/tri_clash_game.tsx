import React, { useState, useEffect, useRef } from 'react';
import { Swords, Sparkles, Briefcase, Play, RefreshCw, BookOpen } from 'lucide-react';

const TriClashGame = () => {
  const [screen, setScreen] = useState('title');
  const [leon, setLeon] = useState(50);
  const [goddess, setGoddess] = useState(50);
  const [sato, setSato] = useState(50);
  const [chaos, setChaos] = useState(0);
  const [timer, setTimer] = useState(90);
  const [score, setScore] = useState(0);
  const [rank, setRank] = useState('');
  const [powerups, setPowerups] = useState({
    chaosDecay: 0,
    satoStability: 0,
    timingEase: 0,
    leonSlowdown: 0
  });
  const [showPowerupChoice, setShowPowerupChoice] = useState(false);
  const [eventMessage, setEventMessage] = useState('');
  const gameLoopRef = useRef(null);
  const lastEventRef = useRef(0);
  const lastPowerupRef = useRef(0);

  const calculateChaos = (l, g, s) => {
    const balance = (l + g + s) / 3;
    const diff = Math.abs(l - g) + Math.abs(g - s) + Math.abs(s - l);
    return Math.max(0, Math.min(100, diff * 1.5 - balance * 0.7));
  };

  const adjustGauge = (type, amount) => {
    if (screen !== 'play') return;
    
    if (type === 'leon') setLeon(l => Math.max(0, Math.min(100, l + amount)));
    else if (type === 'goddess') setGoddess(g => Math.max(0, Math.min(100, g + amount)));
    else if (type === 'sato') setSato(s => Math.max(0, Math.min(100, s + amount)));
    
    setScore(s => s + 10);
  };

  const stabilize = () => {
    if (screen !== 'play') return;
    const reduction = 5 + (powerups.timingEase * 2);
    setChaos(c => Math.max(0, c - reduction));
    setScore(s => s + 20);
  };

  const triggerEvent = () => {
    const events = [
      { name: '時空のひび割れ', effect: () => {
        setLeon(l => Math.min(100, l + 5));
        setGoddess(g => Math.min(100, g + 5));
        setSato(s => Math.min(100, s + 5));
      }},
      { name: '女神の祝福', effect: () => setGoddess(g => Math.max(0, g - 10)) },
      { name: 'レオンの逆鱗', effect: () => setLeon(l => Math.min(100, l + 15)) },
      { name: '佐藤の深呼吸', effect: () => setSato(s => Math.max(0, s - 10)) }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    setEventMessage(event.name);
    event.effect();
    setTimeout(() => setEventMessage(''), 2000);
  };

  const offerPowerup = () => {
    setShowPowerupChoice(true);
  };

  const selectPowerup = (type) => {
    setPowerups(p => ({ ...p, [type]: p[type] + 1 }));
    setShowPowerupChoice(false);
  };

  const endGame = (finalChaos, finalLeon, finalGoddess, finalSato) => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    const finalScore = score + (timer > 0 ? timer * 10 : 0);
    setScore(finalScore);

    let finalRank = 'D';
    if (finalChaos >= 0 && finalChaos <= 100 && 
        finalLeon > 0 && finalGoddess > 0 && finalSato > 0) {
      if (finalScore >= 3000) finalRank = 'S';
      else if (finalScore >= 2200) finalRank = 'A';
      else if (finalScore >= 1500) finalRank = 'B';
      else finalRank = 'C';
    }
    
    setRank(finalRank);
    setScreen('result');
  };

  useEffect(() => {
    if (screen !== 'play') return;

    const gameLoop = () => {
      setTimer(t => {
        const newTimer = Math.max(0, t - 1/60);
        if (newTimer <= 0) {
          endGame(chaos, leon, goddess, sato);
          return 0;
        }
        return newTimer;
      });

      setLeon(l => {
        const increase = (0.2 - powerups.leonSlowdown * 0.05) / 60;
        return Math.min(100, l + increase);
      });

      setGoddess(g => {
        const variance = (Math.random() - 0.5) / 60;
        return Math.max(0, Math.min(100, g + variance));
      });

      setSato(s => {
        const variance = (1 - powerups.satoStability * 0.3);
        if (Math.random() < 0.005 * variance) {
          return Math.max(0, Math.min(100, s + (Math.random() - 0.5) * 30));
        }
        return s;
      });

      const now = Date.now();
      if (now - lastEventRef.current > 8000 && Math.random() < 0.01) {
        triggerEvent();
        lastEventRef.current = now;
      }

      if (now - lastPowerupRef.current > 20000) {
        offerPowerup();
        lastPowerupRef.current = now;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [screen, chaos, leon, goddess, sato, powerups, score, timer]);

  useEffect(() => {
    if (screen === 'play') {
      const newChaos = calculateChaos(leon, goddess, sato);
      const decayRate = 1 + powerups.chaosDecay * 0.2;
      setChaos(c => Math.max(0, Math.min(100, newChaos - decayRate)));

      if (newChaos > 100 || leon <= 0 || goddess <= 0 || sato <= 0) {
        endGame(newChaos, leon, goddess, sato);
      }
    }
  }, [leon, goddess, sato, screen, powerups.chaosDecay]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (screen !== 'play') return;
      
      if (e.key === 'a' || e.key === 'A') {
        adjustGauge('leon', -10);
      } else if (e.key === 's' || e.key === 'S') {
        adjustGauge('goddess', -10);
      } else if (e.key === 'd' || e.key === 'D') {
        adjustGauge('sato', -10);
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        stabilize();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [screen, powerups]);

  const startGame = () => {
    setScreen('play');
    setLeon(50);
    setGoddess(50);
    setSato(50);
    setChaos(0);
    setTimer(90);
    setScore(0);
    setPowerups({ chaosDecay: 0, satoStability: 0, timingEase: 0, leonSlowdown: 0 });
    setShowPowerupChoice(false);
    lastEventRef.current = Date.now();
    lastPowerupRef.current = Date.now();
  };

  const getStoryText = () => {
    const stories = {
      S: '暴走エネルギー球は極限まで圧縮され、三者の必殺技は一点へと収束した。\n\nすべてが沈黙した。\n\n世界は平穏を取り戻したが、人間と魔族は世界から消えた。新たな生命が世界に生まれるのかどうかは誰も知らない。\n\nこれが、唯一の救済。',
      A: '三者の衝突は部分的に収束した。しかし均衡はわずかに崩れ——\n\n三者のうち二名が相殺し合い、消滅する。\n\n残った一名だけが、満身創痍で立っている。\n\n世界はその者によって再定義される。これは救いか、それとも新たな地獄か。',
      B: '制御は成功したように見えた。しかし暴走エネルギーは完全には消せず、衝突の余波は大地を裂き、空を焦がした。\n\n三者は不明。世界は半壊。秩序も文明も崩壊。\n\nただし、かろうじて生命は生き残り、崩れた空の下で新たな世界が始まる。',
      C: '暴走球は抑えきれず、世界は崩壊を始めた。しかし三者は互いを殺しきれず、息を荒げながら立ち上がる。\n\n世界は滅び、三者だけが戦い続ける永劫の地獄となった。',
      D: '制御は完全に破綻した。三者の必殺技が無秩序にぶつかり合い、全てを呑み込む無限のエネルギーが生み出された。\n\n異世界はエネルギーの飽和により完全にすべてが崩壊した。'
    };
    return stories[rank] || '';
  };

  const chaosSize = 100 + chaos * 1.5;
  const chaosColor = `rgb(${leon * 2.55}, ${goddess * 1.5}, ${sato * 2})`;
  const chaosOpacity = 0.3 + (chaos / 100) * 0.7;

  if (screen === 'title') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-red-900 to-black flex flex-col items-center justify-center text-white p-4">
        <div className="text-center mb-8 animate-pulse">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 text-yellow-300 drop-shadow-lg">異世界決戦</h1>
          <h2 className="text-2xl md:text-4xl font-bold text-red-400">三界衝突</h2>
          <p className="text-sm md:text-base mt-2 text-gray-300">Tri-Clash</p>
        </div>
        
        <div className="flex gap-4 mb-8">
          <div className="text-center opacity-70">
            <Swords className="w-16 h-16 mx-auto text-red-500" />
            <p className="text-xs mt-1">レオン</p>
          </div>
          <div className="text-center opacity-70">
            <Sparkles className="w-16 h-16 mx-auto text-blue-400" />
            <p className="text-xs mt-1">女神</p>
          </div>
          <div className="text-center opacity-70">
            <Briefcase className="w-16 h-16 mx-auto text-gray-500" />
            <p className="text-xs mt-1">佐藤武志</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-bold transition transform hover:scale-105"
          >
            <Play className="w-6 h-6" />
            スタート
          </button>
          
          <button
            onClick={() => setScreen('howto')}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-bold transition transform hover:scale-105 mx-auto"
          >
            <BookOpen className="w-6 h-6" />
            遊び方
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'howto') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-300">遊び方</h2>
        
        <div className="max-w-2xl mx-auto space-y-4 text-sm md:text-base">
          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-bold text-xl mb-2 text-red-400">ストーリー</h3>
            <p>魔王レオンと女神の最終決戦に、会社員・佐藤武志が巻き込まれた！三者の必殺技が衝突し、巨大なエネルギー球が暴走を開始。あなたは"世界のバランサー"となり、90秒間エネルギー球を制御せよ！</p>
          </div>

          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-bold text-xl mb-2 text-green-400">勝利条件</h3>
            <p>90秒間、暴走値を0〜100の範囲内に維持する</p>
          </div>

          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-bold text-xl mb-2 text-blue-400">操作方法（PC）</h3>
            <ul className="space-y-1">
              <li><strong>Aキー</strong>：レオンの力を弱める（赤-10）</li>
              <li><strong>Sキー</strong>：女神の力を弱める（青-10）</li>
              <li><strong>Dキー</strong>：佐藤を落ち着かせる（黒-10）</li>
              <li><strong>スペース</strong>：エネルギー球を安定化</li>
            </ul>
          </div>

          <div className="bg-black bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-bold text-xl mb-2 text-purple-400">キャラクター特性</h3>
            <ul className="space-y-1">
              <li><strong className="text-red-400">レオン</strong>：時間と共に自動増加</li>
              <li><strong className="text-blue-400">女神</strong>：波のように増減</li>
              <li><strong className="text-gray-400">佐藤武志</strong>：突発的に大幅変動</li>
            </ul>
          </div>

          <button
            onClick={() => setScreen('title')}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition"
          >
            タイトルに戻る
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'play') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-black to-red-900 text-white p-4 relative overflow-hidden">
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
            25% { transform: translate(-50%, -50%) rotate(2deg); }
            75% { transform: translate(-50%, -50%) rotate(-2deg); }
          }
        `}</style>

        <div className="absolute top-4 left-4 right-4 flex justify-between text-xl font-bold z-20">
          <div className="bg-black bg-opacity-70 px-4 py-2 rounded">
            残り: {Math.ceil(timer)}秒
          </div>
          <div className="bg-black bg-opacity-70 px-4 py-2 rounded">
            スコア: {score}
          </div>
        </div>

        {eventMessage && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-xl z-30 animate-bounce">
            {eventMessage}
          </div>
        )}

        <div className="absolute top-24 left-4 right-4 flex justify-around z-10">
          <div className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-6 h-6 text-red-500" />
              <span className="font-bold">レオン</span>
            </div>
            <div className="w-32 h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-red-500">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${leon}%` }}
              />
            </div>
            <div className="text-sm mt-1">{Math.round(leon)}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <span className="font-bold">女神</span>
            </div>
            <div className="w-32 h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-blue-400">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-300 transition-all duration-300"
                style={{ width: `${goddess}%` }}
              />
            </div>
            <div className="text-sm mt-1">{Math.round(goddess)}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-6 h-6 text-gray-400" />
              <span className="font-bold">佐藤</span>
            </div>
            <div className="w-32 h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-400">
              <div 
                className="h-full bg-gradient-to-r from-gray-700 to-gray-500 transition-all duration-300"
                style={{ width: `${sato}%` }}
              />
            </div>
            <div className="text-sm mt-1">{Math.round(sato)}</div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5">
          <div
            className="rounded-full blur-sm transition-all duration-300"
            style={{
              width: `${chaosSize}px`,
              height: `${chaosSize}px`,
              backgroundColor: chaosColor,
              opacity: chaosOpacity,
              boxShadow: `0 0 ${chaos}px ${chaosColor}`,
              animation: chaos > 50 ? 'shake 0.3s infinite' : 'none'
            }}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-bold text-2xl">
            <div className="text-yellow-300">暴走値</div>
            <div className={`text-4xl ${chaos > 70 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {Math.round(chaos)}
            </div>
          </div>
        </div>

        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-3/4 max-w-md z-10">
          <div className="text-center mb-2 font-bold">暴走度</div>
          <div className="h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-yellow-500">
            <div 
              className={`h-full transition-all duration-300 ${
                chaos > 70 ? 'bg-red-500' : chaos > 40 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${chaos}%` }}
            />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-around z-10">
          <button
            onClick={() => adjustGauge('leon', -10)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition transform active:scale-95 flex flex-col items-center"
          >
            <span className="text-sm">A</span>
            <span>レオン-</span>
          </button>
          
          <button
            onClick={() => adjustGauge('goddess', -10)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition transform active:scale-95 flex flex-col items-center"
          >
            <span className="text-sm">S</span>
            <span>女神-</span>
          </button>
          
          <button
            onClick={() => adjustGauge('sato', -10)}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition transform active:scale-95 flex flex-col items-center"
          >
            <span className="text-sm">D</span>
            <span>佐藤-</span>
          </button>
          
          <button
            onClick={stabilize}
            className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition transform active:scale-95 flex flex-col items-center"
          >
            <span className="text-sm">Space</span>
            <span>安定化</span>
          </button>
        </div>

        {showPowerupChoice && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40">
            <div className="bg-purple-900 p-8 rounded-lg max-w-2xl">
              <h3 className="text-2xl font-bold mb-4 text-center text-yellow-300">強化を選択！</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => selectPowerup('chaosDecay')}
                  className="p-4 bg-green-700 hover:bg-green-600 rounded-lg transition"
                >
                  <div className="font-bold">暴走値減衰+20%</div>
                  <div className="text-sm mt-1">暴走を抑えやすくなる</div>
                </button>
                <button
                  onClick={() => selectPowerup('satoStability')}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  <div className="font-bold">佐藤の乱数幅-30%</div>
                  <div className="text-sm mt-1">佐藤が安定する</div>
                </button>
                <button
                  onClick={() => selectPowerup('timingEase')}
                  className="p-4 bg-yellow-700 hover:bg-yellow-600 rounded-lg transition"
                >
                  <div className="font-bold">安定化効果UP</div>
                  <div className="text-sm mt-1">スペースキーの効果増加</div>
                </button>
                <button
                  onClick={() => selectPowerup('leonSlowdown')}
                  className="p-4 bg-red-700 hover:bg-red-600 rounded-lg transition"
                >
                  <div className="font-bold">レオン増加-50%</div>
                  <div className="text-sm mt-1">レオンの暴走を抑制</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'result') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8 text-yellow-300">結果発表</h2>
          
          <div className={`text-8xl font-bold mb-4 ${
            rank === 'S' ? 'text-yellow-400' :
            rank === 'A' ? 'text-blue-400' :
            rank === 'B' ? 'text-green-400' :
            rank === 'C' ? 'text-orange-400' : 'text-red-500'
          }`}>
            {rank}ランク
          </div>

          <div className="text-3xl mb-8">
            スコア: <span className="font-bold text-yellow-300">{score}</span>
          </div>

          <div className="bg-black bg-opacity-70 p-6 rounded-lg mb-8 text-left whitespace-pre-line text-base leading-relaxed">
            {getStoryText()}
          </div>

          <button
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-bold transition transform hover:scale-105 mx-auto"
          >
            <RefreshCw className="w-6 h-6" />
            もう一度挑戦
          </button>

          <button
            onClick={() => setScreen('title')}
            className="mt-4 px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition mx-auto block"
          >
            タイトルに戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TriClashGame;