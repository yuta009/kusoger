const { useState, useEffect, useRef, useCallback } = React;

const Icon = ({ label, className, size = 20 }) => (
  <span className={className} style={{ fontSize: `${size}px` }} aria-hidden="true">
    {label}
  </span>
);
const Shield = (props) => <Icon label="🛡️" {...props} />;
const Zap = (props) => <Icon label="⚡" {...props} />;
const Target = (props) => <Icon label="🎯" {...props} />;
const Award = (props) => <Icon label="🏆" {...props} />;
const RotateCcw = (props) => <Icon label="🔄" {...props} />;
const Play = (props) => <Icon label="▶️" {...props} />;

const IMAGE_PATHS = {
  player: './pic/protagonist_F.jpg',
  enemies: {
    small: ['enemy_1_1.jpg', 'enemy_1_2.jpg', 'enemy_1_3.jpg', 'enemy_1_4.jpg'],
    heavy: ['enemy_2_1.jpg', 'enemy_2_2.jpg', 'enemy_2_3.jpg', 'enemy_2_4.jpg'],
    fast: ['enemy_3_1.jpg', 'enemy_3_2.jpg', 'enemy_3_3.jpg'],
    boss: ['enemy_4_1.jpg', 'enemy_4_2.jpg', 'enemy_4_3.jpg']
  }
};

const ShelterBreak = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('title'); // title, playing, upgrade, gameover, victory
  const [wave, setWave] = useState(1);
  const [shelterHP, setShelterHP] = useState(1000);
  const [killCount, setKillCount] = useState(0);
  const [score, setScore] = useState(0);
  const [upgradeOptions, setUpgradeOptions] = useState([]);
  
  const gameDataRef = useRef({
    player: {
      x: 400,
      y: 300,
      hp: 100,
      maxHP: 100,
      speed: 3,
      attackRange: 120,
      attackDamage: 20,
      attackSpeed: 60, // frames
      attackType: 'normal',
      piercing: 0,
      explosionRadius: 0,
      bulletCount: 1,
      attackFrame: 0
    },
    shelter: { x: 400, y: 300, hp: 1000, maxHP: 1000, radius: 32 },
    enemies: [],
    bullets: [],
    effects: [],
    images: {},
    keys: {},
    frame: 0,
    enemySpawnFrame: 0,
    enemySpawnRate: 120,
    killsThisWave: 0,
    totalKills: 0,
    waveKillTarget: 20,
    currentWave: 1,
    specialAttackCooldown: 0
  });

  const startGame = () => {
    const data = gameDataRef.current;
    data.player = {
      x: 400,
      y: 300,
      hp: 100,
      maxHP: 100,
      speed: 3,
      attackRange: 120,
      attackDamage: 20,
      attackSpeed: 60,
      attackType: 'normal',
      piercing: 0,
      explosionRadius: 0,
      bulletCount: 1,
      attackFrame: 0
    };
    data.shelter = { x: 400, y: 300, hp: 1000, maxHP: 1000, radius: 32 };
    data.enemies = [];
    data.bullets = [];
    data.effects = [];
    data.frame = 0;
    data.enemySpawnFrame = 0;
    data.killsThisWave = 0;
    data.totalKills = 0;
    data.currentWave = 1;
    data.waveKillTarget = 20;
    
    setGameState('playing');
    setWave(1);
    setShelterHP(1000);
    setKillCount(0);
    setScore(0);
  };

  const spawnEnemy = (wave) => {
    const data = gameDataRef.current;
    const angle = Math.random() * Math.PI * 2;
    const distance = 500;
    const x = 400 + Math.cos(angle) * distance;
    const y = 300 + Math.sin(angle) * distance;
    
    let enemyType = 'small';
    let hp = 20 * (1 + wave * 0.2);
    let speed = 1 + Math.random() * 0.5;
    let color = '#ff4444';
    let size = 12;
    let targetPlayer = Math.random() < 0.3;
    
    if (wave > 2 && Math.random() < 0.2) {
      enemyType = 'heavy';
      hp = 80 * (1 + wave * 0.3);
      speed = 0.5;
      color = '#444444';
      size = 16;
    } else if (wave > 4 && Math.random() < 0.15) {
      enemyType = 'fast';
      hp = 40 * (1 + wave * 0.2);
      speed = 2 + Math.random();
      color = '#44ff44';
      size = 10;
      targetPlayer = true;
    } else if (wave > 6 && Math.random() < 0.1) {
      enemyType = 'boss';
      hp = 500 * (1 + wave * 0.5);
      speed = 0.8;
      color = '#ff44ff';
      size = 24;
    }
    const spriteList = IMAGE_PATHS.enemies[enemyType] || [];
    const spriteFile = spriteList.length
      ? spriteList[Math.floor(Math.random() * spriteList.length)]
      : null;

    data.enemies.push({
      x,
      y,
      hp,
      maxHP: hp,
      speed,
      color,
      size,
      enemyType,
      targetPlayer,
      spriteKey: spriteFile ? `enemy:${spriteFile}` : null
    });
  };

  const updatePlayer = (data) => {
    const { player, keys } = data;
    let dx = 0, dy = 0;
    
    if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
      player.x += dx * player.speed;
      player.y += dy * player.speed;
      
      player.x = Math.max(50, Math.min(750, player.x));
      player.y = Math.max(50, Math.min(550, player.y));
    }
    
    // Auto attack
    player.attackFrame++;
    if (player.attackFrame >= player.attackSpeed) {
      const target = findNearestEnemy(data);
      if (target) {
        shootBullet(data, target);
        player.attackFrame = 0;
      }
    }
  };

  const findNearestEnemy = (data) => {
    const { player, enemies } = data;
    let nearest = null;
    let minDist = player.attackRange;
    
    enemies.forEach(enemy => {
      const dist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    });
    
    return nearest;
  };

  const shootBullet = (data, target) => {
    const { player } = data;
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    
    for (let i = 0; i < player.bulletCount; i++) {
      let bulletAngle = angle;
      if (player.bulletCount > 1) {
        const spread = 0.3;
        bulletAngle = angle + (i - (player.bulletCount - 1) / 2) * spread;
      }
      
      data.bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(bulletAngle) * 6,
        vy: Math.sin(bulletAngle) * 6,
        damage: player.attackDamage,
        piercing: player.piercing,
        explosionRadius: player.explosionRadius,
        hits: 0
      });
    }
  };

  const updateEnemies = (data) => {
    const { enemies, player, shelter } = data;
    
    enemies.forEach(enemy => {
      const target = enemy.targetPlayer ? player : shelter;
      const dx = target.x - enemy.x;
      const dy = target.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > (enemy.targetPlayer ? 20 : shelter.radius)) {
        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
      } else if (!enemy.targetPlayer) {
        // Attack shelter
        if (data.frame % 60 === 0) {
          shelter.hp -= 10 * (1 + data.currentWave * 0.1);
          setShelterHP(Math.max(0, shelter.hp));
          if (shelter.hp <= 0) {
            setGameState('gameover');
          }
        }
      } else {
        // Attack player
        if (data.frame % 60 === 0) {
          player.hp -= 5;
          if (player.hp <= 0) {
            setGameState('gameover');
          }
        }
      }
    });
  };

  const updateBullets = (data) => {
    const { bullets, enemies } = data;
    
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      // Remove if off screen
      if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
        bullets.splice(i, 1);
        continue;
      }
      
      // Check collision
      let hit = false;
      enemies.forEach((enemy, ei) => {
        const dist = Math.sqrt((enemy.x - bullet.x) ** 2 + (enemy.y - bullet.y) ** 2);
        if (dist < enemy.size) {
          enemy.hp -= bullet.damage;
          
          if (bullet.explosionRadius > 0) {
            createExplosion(data, bullet.x, bullet.y, bullet.explosionRadius, bullet.damage * 0.5);
          }
          
          if (enemy.hp <= 0) {
            enemies.splice(ei, 1);
            data.killsThisWave++;
            data.totalKills++;
            setKillCount(data.totalKills);
            setScore(s => s + 100);
            
            // Check for upgrade
            if (data.totalKills % 15 === 0) {
              generateUpgrades();
              setGameState('upgrade');
            }
            
            // Check wave completion
            if (data.killsThisWave >= data.waveKillTarget) {
              data.currentWave++;
              data.killsThisWave = 0;
              data.waveKillTarget = Math.floor(data.waveKillTarget * 1.3);
              setWave(data.currentWave);
              
              if (data.currentWave > 10) {
                setGameState('victory');
              }
            }
          }
          
          bullet.hits++;
          if (bullet.hits > bullet.piercing) {
            hit = true;
          }
        }
      });
      
      if (hit) {
        bullets.splice(i, 1);
      }
    }
  };

  const createExplosion = (data, x, y, radius, damage) => {
    data.effects.push({ x, y, radius, frame: 0, maxFrame: 20, type: 'explosion' });
    
    data.enemies.forEach(enemy => {
      const dist = Math.sqrt((enemy.x - x) ** 2 + (enemy.y - y) ** 2);
      if (dist < radius) {
        enemy.hp -= damage;
      }
    });
  };

  const generateUpgrades = () => {
    const allUpgrades = [
      { id: 'damage', name: '攻撃力 +20%', desc: 'ダメージが増加', icon: '⚔️' },
      { id: 'speed', name: '攻撃速度 +25%', desc: '攻撃間隔が短縮', icon: '⚡' },
      { id: 'range', name: '攻撃範囲 +20%', desc: '射程が伸びる', icon: '🎯' },
      { id: 'piercing', name: '貫通 +1', desc: '敵を貫通する', icon: '➡️' },
      { id: 'bullets', name: '弾数 +1', desc: '同時発射数増加', icon: '✨' },
      { id: 'explosion', name: '爆発範囲 +30', desc: '着弾時に爆発', icon: '💥' },
      { id: 'hp', name: 'HP回復 +50', desc: '体力回復', icon: '❤️' },
      { id: 'movespeed', name: '移動速度 +20%', desc: '素早く動ける', icon: '🏃' }
    ];
    
    const selected = [];
    while (selected.length < 3) {
      const upgrade = allUpgrades[Math.floor(Math.random() * allUpgrades.length)];
      if (!selected.find(u => u.id === upgrade.id)) {
        selected.push(upgrade);
      }
    }
    
    setUpgradeOptions(selected);
  };

  const applyUpgrade = (upgradeId) => {
    const data = gameDataRef.current;
    const { player } = data;
    
    switch(upgradeId) {
      case 'damage':
        player.attackDamage *= 1.2;
        break;
      case 'speed':
        player.attackSpeed = Math.max(10, player.attackSpeed * 0.75);
        break;
      case 'range':
        player.attackRange *= 1.2;
        break;
      case 'piercing':
        player.piercing++;
        break;
      case 'bullets':
        player.bulletCount++;
        break;
      case 'explosion':
        player.explosionRadius += 30;
        break;
      case 'hp':
        player.hp = Math.min(player.maxHP, player.hp + 50);
        break;
      case 'movespeed':
        player.speed *= 1.2;
        break;
    }
    
    setGameState('playing');
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const data = gameDataRef.current;
    data.frame++;
    
    updatePlayer(data);
    updateEnemies(data);
    updateBullets(data);
    
    // Spawn enemies
    data.enemySpawnFrame++;
    const spawnRate = Math.max(30, data.enemySpawnRate - data.currentWave * 5);
    if (data.enemySpawnFrame >= spawnRate) {
      spawnEnemy(data.currentWave);
      data.enemySpawnFrame = 0;
    }
    
    // Update effects
    data.effects = data.effects.filter(e => {
      e.frame++;
      return e.frame < e.maxFrame;
    });
    
    draw();
  }, [gameState]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = gameDataRef.current;
    
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);
    
    // Grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let i = 0; i < 800; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 600);
      ctx.stroke();
    }
    for (let i = 0; i < 600; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(800, i);
      ctx.stroke();
    }
    
    // Shelter
    const { shelter } = data;
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.arc(shelter.x, shelter.y, shelter.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Attack range
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(data.player.x, data.player.y, data.player.attackRange, 0, Math.PI * 2);
    ctx.stroke();
    
    // Enemies
    data.enemies.forEach(enemy => {
      const sprite = enemy.spriteKey ? data.images[enemy.spriteKey] : null;
      if (sprite && sprite.complete) {
        ctx.drawImage(
          sprite,
          enemy.x - enemy.size,
          enemy.y - enemy.size,
          enemy.size * 2,
          enemy.size * 2
        );
      } else {
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // HP bar
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 5, enemy.size * 2, 3);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 5, enemy.size * 2 * (enemy.hp / enemy.maxHP), 3);
    });
    
    // Bullets
    ctx.fillStyle = '#ffff00';
    data.bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Effects
    data.effects.forEach(effect => {
      if (effect.type === 'explosion') {
        const progress = effect.frame / effect.maxFrame;
        const radius = effect.radius * (1 - progress);
        ctx.strokeStyle = `rgba(255, 100, 0, ${1 - progress})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    // Player
    const playerSprite = data.images.player;
    if (playerSprite && playerSprite.complete) {
      ctx.drawImage(
        playerSprite,
        data.player.x - 16,
        data.player.y - 16,
        32,
        32
      );
    } else {
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(data.player.x, data.player.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Player HP bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(data.player.x - 20, data.player.y - 30, 40, 4);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(data.player.x - 20, data.player.y - 30, 40 * (data.player.hp / data.player.maxHP), 4);
  };

  useEffect(() => {
    const data = gameDataRef.current;
    const images = {};
    const loadImage = (key, src) => {
      const img = new Image();
      img.src = src;
      images[key] = img;
    };
    loadImage('player', IMAGE_PATHS.player);
    Object.values(IMAGE_PATHS.enemies).forEach(files => {
      files.forEach(file => loadImage(`enemy:${file}`, `./pic/${file}`));
    });
    data.images = images;
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(gameLoop, 1000 / 60);
      return () => clearInterval(interval);
    }
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameDataRef.current.keys[e.code] = true;
    };
    
    const handleKeyUp = (e) => {
      gameDataRef.current.keys[e.code] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (gameState === 'title') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-8 max-w-3xl px-8">
          <h1 className="text-6xl font-bold mb-4 text-red-500 animate-pulse">
            Shelter Break
          </h1>
          <h2 className="text-3xl font-bold text-purple-300 mb-8">
            最後の防衛者
          </h2>
          
          <div className="bg-black bg-opacity-70 p-8 rounded-lg space-y-4 text-left border-2 border-red-500">
            <p className="text-lg font-bold text-center text-yellow-300 mb-4">— ストーリー —</p>
            <p>西暦2000年。</p>
            <p>魔王、女神、佐藤武志の戦いの余波によって異世界は崩壊した。</p>
            <p>その余波により、爆発的なエネルギーが現実世界に流れ込み、現実世界にも影響が出始める。</p>
            <p className="text-red-400 font-bold">謎の生命体ガイザーが現実世界に出現し始める。</p>
            <p className="mt-4">都市の一角に設けられた小さな<span className="text-green-400 font-bold">避難所</span>。</p>
            <p>混乱する人々の中で、その前に立つのは、ただ一人の防衛者。</p>
            <p>頼れるのは、己の身体と、進化する戦闘能力のみ。</p>
            <p className="text-center mt-6 text-xl text-yellow-300 font-bold">「ここは、俺が守る」</p>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-red-600 to-purple-600 px-12 py-4 rounded-lg text-2xl font-bold hover:scale-110 transition-transform flex items-center gap-3 mx-auto shadow-2xl"
          >
            <Play size={32} />
            スタート
          </button>

          <div className="text-sm text-gray-400 mt-8">
            <p>操作: WASD / 矢印キー = 移動</p>
            <p>攻撃は自動 / 強化で戦闘力を上げろ！</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'upgrade') {
    return (
      <div className="w-full h-screen bg-black bg-opacity-90 flex items-center justify-center text-white">
        <div className="text-center space-y-8 max-w-4xl px-4">
          <h2 className="text-5xl font-bold text-yellow-400 mb-8">⚡ 強化選択 ⚡</h2>
          
          <div className="grid grid-cols-3 gap-6">
            {upgradeOptions.map((upgrade, index) => (
              <button
                key={index}
                onClick={() => applyUpgrade(upgrade.id)}
                className="bg-gradient-to-b from-purple-700 to-purple-900 p-6 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 hover:scale-105 transition-transform"
              >
                <div className="text-6xl mb-4">{upgrade.icon}</div>
                <div className="text-xl font-bold mb-2">{upgrade.name}</div>
                <div className="text-sm text-gray-300">{upgrade.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-red-900 to-black flex flex-col items-center justify-center text-white">
        <div className="text-center space-y-6">
          <h2 className="text-6xl font-bold mb-8 text-red-500">💥 GAME OVER 💥</h2>
          
          <div className="bg-gray-800 p-8 rounded-lg space-y-4">
            <div className="text-3xl">最終Wave: <span className="text-yellow-400 font-bold">{wave}</span></div>
            <div className="text-3xl">撃破数: <span className="text-red-400 font-bold">{killCount}</span></div>
            <div className="text-3xl">スコア: <span className="text-purple-400 font-bold">{score}</span></div>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-purple-600 to-red-600 px-8 py-4 rounded-lg text-xl font-bold hover:scale-110 transition-transform flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={24} />
            リトライ
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'victory') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-yellow-900 to-black flex flex-col items-center justify-center text-white">
        <div className="text-center space-y-6">
          <h2 className="text-6xl font-bold mb-8 text-yellow-400">🎉 VICTORY 🎉</h2>
          
          <div className="bg-gray-800 p-8 rounded-lg space-y-4">
            <p className="text-2xl mb-4">避難所の防衛に成功した！</p>
            <div className="text-3xl">最終Wave: <span className="text-yellow-400 font-bold">{wave}</span></div>
            <div className="text-3xl">撃破数: <span className="text-red-400 font-bold">{killCount}</span></div>
            <div className="text-3xl">スコア: <span className="text-purple-400 font-bold">{score}</span></div>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-4 rounded-lg text-xl font-bold hover:scale-110 transition-transform flex items-center gap-2 mx-auto"
          >
            <Play size={24} />
            もう一度プレイ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
      {/* UI Header */}
      <div className="w-full bg-gray-900 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Shield className="text-green-400" />
          <span className="font-bold">避難所HP: </span>
          <div className="w-48 h-6 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-300"
              style={{ width: `${(shelterHP / gameDataRef.current.shelter.maxHP) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm">{Math.floor(shelterHP)}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-400" />
            <span className="font-bold">Wave: {wave}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="text-red-400" />
            <span className="font-bold">撃破: {killCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="text-purple-400" />
            <span className="font-bold">Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600}
        className="border-4 border-gray-800"
      />

      {/* Controls */}
      <div className="w-full bg-gray-900 p-4 text-white text-center">
        <p className="text-sm">WASD / 矢印キー: 移動 | 攻撃: 自動 | 次の強化まで: {15 - (killCount % 15)}体</p>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ShelterBreak />);
