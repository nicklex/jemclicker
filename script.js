const cube = document.getElementById('cube');
const counter = document.getElementById('counter');
let clicks = 0;
let angle = 0;
let lastTime = null;
let speed = 5;
let boostEndTime = 0;
let boostLevel = 0;
let targetScale = 1;
let currentScale = 1;
const scaleSpeed = 0.1;

// Настройки игры
const BOOST_LEVELS = [3, 1.5, 0.75];
const BOOST_DURATION = 1000;
const SCALE_DOWN = 0.6;
const CLICK_INCREMENT = 1;
const CRITICAL_CHANCE = 0.1; // 10% шанс критического клика
const CRITICAL_MULTIPLIER = 2;

// Статистика
let stats = {
    totalClicks: 0,
    criticalClicks: 0,
    lastClickTime: 0,
    clickRate: 0
};

function updateTransform() {
    // Плавное масштабирование
    currentScale += (targetScale - currentScale) * scaleSpeed;
    
    // Применяем все преобразования
    cube.style.transform = `
        rotateX(${Math.sin(angle/180*Math.PI)*15}deg) 
        rotateY(${angle % 360}deg) 
        rotateZ(${Math.cos(angle/180*Math.PI)*5}deg)
        scale(${currentScale.toFixed(3)})
    `;
}

function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = Math.min(currentTime - lastTime, 100);
    lastTime = currentTime;
    
    // Проверяем окончание ускорения
    if (boostLevel > 0 && currentTime >= boostEndTime) {
        speed = 5;
        boostLevel = 0;
    }
    
    // Обновляем угол вращения
    angle += (deltaTime / 1000) * (360 / speed);
    
    // Обновляем преобразования
    updateTransform();
    
    requestAnimationFrame(animate);
}

function handleClick() {
    // Эффект клика
    targetScale = SCALE_DOWN;
    setTimeout(() => {
        targetScale = 1;
    }, 200);
    
    // Увеличиваем уровень ускорения
    boostLevel = Math.min(boostLevel + 1, BOOST_LEVELS.length);
    speed = BOOST_LEVELS[boostLevel - 1];
    boostEndTime = performance.now() + BOOST_DURATION;
    
    // Обработка клика
    const now = Date.now();
    const isCritical = Math.random() < CRITICAL_CHANCE;
    const clickValue = isCritical ? CLICK_INCREMENT * CRITICAL_MULTIPLIER : CLICK_INCREMENT;
    
    clicks += clickValue;
    counter.textContent = clicks;
    
    // Обновляем статистику
    stats.totalClicks++;
    if (isCritical) stats.criticalClicks++;
    if (stats.lastClickTime > 0) {
        stats.clickRate = 1000 / ((now - stats.lastClickTime) || 1);
    }
    stats.lastClickTime = now;
    
    // Визуальный эффект для критического клика
    if (isCritical) {
        const critEffect = document.createElement('div');
        critEffect.className = 'critical-effect';
        critEffect.textContent = 'CRIT!';
        critEffect.style.position = 'absolute';
        critEffect.style.color = '#ff0';
        critEffect.style.fontWeight = 'bold';
        critEffect.style.fontSize = '24px';
        critEffect.style.animation = 'fadeOut 1s forwards';
        document.body.appendChild(critEffect);
        
        // Позиционирование эффекта
        const rect = cube.getBoundingClientRect();
        critEffect.style.left = `${rect.left + rect.width/2 - 30}px`;
        critEffect.style.top = `${rect.top - 30}px`;
        
        // Удаление эффекта после анимации
        setTimeout(() => {
            critEffect.remove();
        }, 1000);
    }
}

// Инициализация кнопок


const statsPanel = document.createElement('div');
statsPanel.id = 'stats-panel';
statsPanel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 10px;
    z-index: 1000;
    display: none;
    width: 80%;
    max-width: 400px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
`;

const statsContent = document.createElement('div');
statsContent.innerHTML = `
    <h2 style="margin-top: 0; text-align: center;">Статистика</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>Всего кликов:</div>
        <div id="stats-total">0</div>
        
        <div>Критических:</div>
        <div id="stats-critical">0 (0%)</div>
        
        <div>Скорость:</div>
        <div id="stats-rate">0/сек</div>
        
        <div>Текущий буст:</div>
        <div id="stats-boost">Нет</div>
    </div>
`;

const closeButton = document.createElement('button');
closeButton.textContent = 'Закрыть';
closeButton.style.cssText = `
    display: block;
    margin: 20px auto 0;
    padding: 8px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
`;

statsPanel.appendChild(statsContent);
statsPanel.appendChild(closeButton);
document.body.appendChild(statsPanel);

// Обработчики кнопок
document.getElementById('btn1').addEventListener('click', () => {
    // Логика улучшений
});

document.getElementById('btn2').addEventListener('click', () => {
    // Логика магазина
});

document.getElementById('btn3').addEventListener('click', () => {
    // Обновляем статистику перед показом
    updateStats();
    statsPanel.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    statsPanel.style.display = 'none';
});

// Функция обновления статистики
function updateStats() {
    document.getElementById('stats-total').textContent = stats.totalClicks;
    const criticalPercent = stats.totalClicks > 0 
        ? (stats.criticalClicks / stats.totalClicks * 100).toFixed(1) 
        : 0;
    document.getElementById('stats-critical').textContent = 
        `${stats.criticalClicks} (${criticalPercent}%)`;
    document.getElementById('stats-rate').textContent = 
        `${stats.clickRate.toFixed(1)}/сек`;
    document.getElementById('stats-boost').textContent = 
        boostLevel > 0 ? `Уровень ${boostLevel} (${speed.toFixed(1)}x)` : 'Нет';
}

// Оптимизация для мобильных устройств
cube.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleClick();
}, {passive: false});

cube.addEventListener('click', handleClick);

// Стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-50px); }
    }
    .critical-effect {
        pointer-events: none;
        user-select: none;
        text-shadow: 0 0 10px #ff0, 0 0 20px #ff0;
        z-index: 100;
    }
`;

const panelStyle = document.createElement('style');
panelStyle.textContent = `
    #stats-panel {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -40%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
    }
    
    #stats-panel button:hover {
        background: #764ba2;
    }
    
    #stats-panel button:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(panelStyle);
document.head.appendChild(style);

// Запускаем анимацию
requestAnimationFrame(animate);