const startButton = document.getElementById("startButton");

const fireTempo = document.getElementById("fireTempo");
const fireTempoValue = document.getElementById("fireTempoValue");

fireTempo.addEventListener("input", () => {
    fireTempoValue.textContent = fireTempo.value;
});

let fireScoreValue = 0;
let fireLivesValue = 10;
let fireGameOver = false;

let fireAudioContext = null;

function getFireAudioContext() {

    if (!fireAudioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        fireAudioContext =
            new AudioContext();
    }

    if (
        fireAudioContext.state ===
        "suspended"
    ) {
        fireAudioContext
            .resume()
            .catch(() => {});
    }

    return fireAudioContext;
}


function playFireTone(
    ctx,
    frequency,
    duration,
    volume,
    type,
    startTime,
    endFrequency = frequency
) {

    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
        frequency,
        startTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(endFrequency, 20),
        startTime + duration
    );

    gain.gain.setValueAtTime(
        0.0001,
        startTime
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        startTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

function playFireSound(type) {

    if (gameSoundMuted) {
        return;
    }

    // Не відтворюємо звуки, коли «Вогонь!» приховано
    if (
        !fireGame ||
        fireGame.getClientRects().length === 0
    ) {
        return;
    }

    const ctx = getFireAudioContext();

    if (!ctx) {
        return;
    }

    const now = ctx.currentTime;

    if (type === "shot") {

        playFireTone(
            ctx, 180, 0.06, 0.025,
            "square", now, 90
        );

        return;
    }

    if (type === "hit") {

        playFireTone(
            ctx, 520, 0.09, 0.06,
            "triangle", now, 760
        );

        playFireTone(
            ctx, 760, 0.11, 0.045,
            "triangle", now + 0.06, 900
        );

        return;
    }

    if (type === "neutral") {

        // Низький спадний звук нейтрального влучання
        playFireTone(
            ctx, 280, 0.35, 0.10,
            "triangle", now, 180
        );

        playFireTone(
            ctx, 180, 0.55, 0.09,
            "triangle", now + 0.28, 95
        );

        return;
    }

    if (type === "ally") {

        // Довге розчароване «ууупссс»
        playFireTone(
            ctx, 390, 0.72, 0.10,
            "triangle", now, 170
        );

        playFireTone(
            ctx, 520, 0.68, 0.06,
            "triangle", now + 0.03, 235
        );

        playFireTone(
            ctx, 195, 0.48, 0.045,
            "sine", now + 0.18, 120
        );

        return;
    }

    if (type === "warning") {

        // Тривожний сигнал перед падінням бомби
        playFireTone(
            ctx, 180, 0.22, 0.065,
            "sawtooth", now, 120
        );

        playFireTone(
            ctx, 135, 0.35, 0.07,
            "sawtooth", now + 0.20, 85
        );

        return;
    }

    if (type === "explosion") {

        playFireTone(
            ctx, 90, 0.28, 0.10,
            "sawtooth", now, 40
        );

        const duration = 0.22;

        const buffer = ctx.createBuffer(
            1,
            ctx.sampleRate * duration,
            ctx.sampleRate
        );

        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        const noiseGain = ctx.createGain();

        noise.buffer = buffer;

        noiseGain.gain.setValueAtTime(
            0.0001,
            now
        );

        noiseGain.gain.exponentialRampToValueAtTime(
            0.08,
            now + 0.01
        );

        noiseGain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + duration);

        return;
    }
}

// Розблоковуємо звук після першої дії користувача
function unlockFireAudio() {
    getFireAudioContext();
}

document.addEventListener(
    "pointerdown",
    unlockFireAudio,
    { once: true }
);

document.addEventListener(
    "keydown",
    unlockFireAudio,
    { once: true }
);

const welcomeScreen = document.querySelector(".welcome-screen");
const gameMenu = document.getElementById("gameMenu");
const fireGame = document.getElementById("fireGame");
const matchGame = document.getElementById("matchGame");
const matchCard = document.querySelector(".match-card");
const matchBoard = document.getElementById("matchBoard");

const fireGameOverScreen =
    document.getElementById("fireGameOver");

const fireRestartButton =
    document.getElementById("fireRestartButton");
    
const fireMenuButton =
    document.getElementById("fireMenuButton");

    fireRestartButton.addEventListener("click", (event) => {
        
        event.stopPropagation();

        fireScoreValue = 0;
        fireLivesValue = 10;
        fireGameOver = false;

    fireScoreDisplay.textContent = "0";
    document.getElementById("fireLives").textContent = "10";

    fireGameOverScreen.style.display = "none";
    aimLine.style.display = "block";

    fireMessage.textContent =
        "Влучай у противників!";

    hitLabel.style.display = "none";

    bulletActive = false;
    bullet.style.display = "none";

        enemies.forEach(enemy => {
        enemy.element.style.display = "block";

        const newCountry =
            getRandomCountry(enemy);

        setEnemyCountry(
            enemy,
            newCountry
        );

        enemy.x =
            10 + Math.random() * 80;

        enemy.element.style.left =
            `${enemy.x}%`;
    });

    clearTimeout(fireBombTimer);

    fireBombTimer = null;

    if (fireBomb) {
        fireBomb.remove();
        fireBomb = null;
    }

    fireBombActive = false;

    scheduleFireBomb();

});

fireMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    fireGameOverScreen.style.display = "none";

    fireGame.style.display = "none";
    gameMenu.style.display = "block";

    fireGameOver = false;
    bulletActive = false;

    bullet.style.display = "none";
    hitLabel.style.display = "none";

    fireMessage.textContent =
        "Влучай у противників!";
});

const COUNTRIES = {
    germany: {
        name: "Німецька імперія",
        bloc: "central",
        image: "countryballs/germany.png"
    },
    austriaHungary: {
        name: "Австро-Угорщина",
        bloc: "central",
        image: "countryballs/austria-hungary.png"
    },
    ottomanEmpire: {
        name: "Османська імперія",
        bloc: "central",
        image: "countryballs/ottoman-empire.png"
    },
    bulgaria: {
        name: "Болгарія",
        bloc: "central",
        image: "countryballs/bulgaria.png"
    },

    greatBritain: {
        name: "Велика Британія",
        bloc: "entente",
        image: "countryballs/great-britain.png"
    },
    france: {
        name: "Франція",
        bloc: "entente",
        image: "countryballs/france.png"
    },
    russianEmpire: {
        name: "Російська імперія",
        bloc: "entente",
        image: "countryballs/russian-empire.png"
    },
    italy: {
        name: "Італія",
        bloc: "entente",
        image: "countryballs/italy.png"
    },
    japan: {
        name: "Японія",
        bloc: "entente",
        image: "countryballs/japan.png"
    },
    serbia: {
        name: "Сербія",
        bloc: "entente",
        image: "countryballs/serbia.png"
    },
    belgium: {
        name: "Бельгія",
        bloc: "entente",
        image: "countryballs/belgium.png"
    },
    romania: {
        name: "Румунія",
        bloc: "entente",
        image: "countryballs/romania.png"
    },
    portugal: {
        name: "Португалія",
        bloc: "entente",
        image: "countryballs/portugal.png"
    },
    usa: {
        name: "США",
        bloc: "entente",
        image: "countryballs/usa.png"
    },
    greece: {
        name: "Греція",
        bloc: "entente",
        image: "countryballs/greece.png"
    },

    switzerland: {
        name: "Швейцарія",
        bloc: "neutral",
        image: "countryballs/switzerland.png"
    },
    netherlands: {
        name: "Нідерланди",
        bloc: "neutral",
        image: "countryballs/netherlands.png"
    },
    spain: {
        name: "Іспанія",
        bloc: "neutral",
        image: "countryballs/spain.png"
    },
    sweden: {
        name: "Швеція",
        bloc: "neutral",
        image: "countryballs/sweden.png"
    },
    norway: {
        name: "Норвегія",
        bloc: "neutral",
        image: "countryballs/norway.png"
    },
    denmark: {
        name: "Данія",
        bloc: "neutral",
        image: "countryballs/denmark.png"
    }
};
const matchCountries = Object.values(COUNTRIES);

let matchActiveCountries = [];

const matchTaskDefinitions = [

    {
        text: "🎯 Створи 3 комбо з країн Антанти та її союзників",
        required: 3,
        requiredByDifficulty: [2, 3, 4, 5, 6],
        targetCountries: [
            "Велика Британія",
            "Франція",
            "Російська імперія",
            "Італія",
            "Японія",
            "Сербія",
            "Бельгія",
            "Румунія",
            "Португалія",
            "США",
            "Греція"
        ]
    },

    {
        text: "🎯 Створи 2 комбо з країн Центральних держав",
        required: 2,
        requiredByDifficulty: [1, 2, 3, 4, 5],
        targetCountries: [
            "Німецька імперія",
            "Австро-Угорщина",
            "Османська імперія",
            "Болгарія"
        ]
    },

    {
        text: "🎯 Створи 2 комбо з нейтральних країн",
        required: 2,
        requiredByDifficulty: [1, 2, 3, 4, 5],
        targetCountries: [
            "Швейцарія",
            "Нідерланди",
            "Іспанія",
            "Швеція",
            "Норвегія",
            "Данія"
        ]
    }

];

let matchCurrentTaskIndex = 0;
let matchTaskProgress = 0;
let matchTaskChanging = false;

function updateMatchTaskDisplay() {

    const task =
        matchTaskDefinitions[matchCurrentTaskIndex];

    document.getElementById("matchTaskNumber").textContent =
        `Завдання ${matchCurrentTaskIndex + 1}/${matchTaskDefinitions.length}`;

    document.getElementById("matchTaskText").textContent =
        task.text;

    document.getElementById("matchTaskProgress").textContent =
        `${matchTaskProgress} / ${task.required}`;

    const progressBar =
        document.querySelector(".match-task-progress");

    const progressPercent =
        task.required > 0
            ? (matchTaskProgress / task.required) * 100
            : 0;

    progressBar.style.setProperty(
        "--task-progress",
        `${progressPercent}%`
    );
}

function showMatchTaskOverlay() {

    const overlay =
        document.getElementById("matchTaskOverlay");
        overlay.classList.add("match-task-completion");

    const title =
        document.getElementById("matchTaskOverlayTitle");

    const subtitle =
        document.getElementById("matchTaskOverlaySubtitle");

    const text =
        document.getElementById("matchTaskOverlayText");

    const isLastTask =
        matchCurrentTaskIndex ===
        matchTaskDefinitions.length - 1;

    const restartButton =
        document.getElementById("matchRestartButton");

    const backToGamesButton =
        document.getElementById("matchBackToGamesButton");

    restartButton.style.display =
        isLastTask ? "flex" : "none";

    backToGamesButton.style.display =
        isLastTask ? "flex" : "none";

    if (isLastTask) {

        const usedHints =
            3 - matchHints;

        title.textContent =
            "🏆 Гру завершено!";

        subtitle.textContent =
            "Усі завдання виконано";

        text.innerHTML = `
            <div class="match-final-results">

                <div class="match-final-result">
                    <span class="match-final-icon">⭐</span>
                    <span class="match-final-label">Рахунок</span>
                    <strong>${matchScore}</strong>
                </div>

                <div class="match-final-result">
                    <span class="match-final-icon">🔥</span>
                    <span class="match-final-label">Комбо</span>
                    <strong>${matchCombos}</strong>
                </div>

                <div class="match-final-result">
                    <span class="match-final-icon">🎯</span>
                    <span class="match-final-label">Завдання</span>
                    <strong>3 / 3</strong>
                </div>

                <div class="match-final-result">
                    <span class="match-final-icon">💡</span>
                    <span class="match-final-label">Підказки</span>
                    <strong>${usedHints} / 3</strong>
                </div>

            </div>
        `;

    } else {

        const nextTask =
            matchTaskDefinitions[
                matchCurrentTaskIndex + 1
            ];

        title.textContent =
            "🎉 Завдання виконано!";

        subtitle.textContent =
            "Наступне завдання";

        text.textContent =
            nextTask.text;
    }

    overlay.style.display = "flex";
}

function showMatchDifficultyOverlay() {

    const overlay =
        document.getElementById("matchTaskOverlay");
        overlay.classList.remove("match-task-completion");

    const title =
        document.getElementById("matchTaskOverlayTitle");

    const subtitle =
        document.getElementById("matchTaskOverlaySubtitle");

    const text =
        document.getElementById("matchTaskOverlayText");

    const startButton =
        document.getElementById("matchStartGameButton");

    const restartButton =
        document.getElementById("matchRestartButton");

    const backToGamesButton =
        document.getElementById("matchBackToGamesButton");

    title.textContent =
        "🎮 Обери складність";

    subtitle.textContent =
        "Від цього залежить кількість комбо";

    text.innerHTML = `
    <div class="match-difficulty-info">

        <div class="match-difficulty-level">
            <strong>Рівень 1 — </strong>
            <span>4 комбо-цілі</span>
        </div>

        <div class="match-difficulty-level">
            <strong>Рівень 2 — </strong>
            <span>7 комбо-цілей</span>
        </div>

        <div class="match-difficulty-level">
            <strong>Рівень 3 — </strong>
            <span>10 комбо-цілей</span>
        </div>

        <div class="match-difficulty-level">
            <strong>Рівень 4 — </strong>
            <span>13 комбо-цілей</span>
        </div>

        <div class="match-difficulty-level">
            <strong>Рівень 5 — </strong>
            <span>16 комбо-цілей</span>
        </div>

    </div>

    <div class="match-difficulty-options">

        <button
            class="match-difficulty-button"
            data-difficulty="1"
            type="button"
        >
            1
        </button>

        <button
            class="match-difficulty-button"
            data-difficulty="2"
            type="button"
        >
            2
        </button>

        <button
            class="match-difficulty-button"
            data-difficulty="3"
            type="button"
        >
            3
        </button>

        <button
            class="match-difficulty-button"
            data-difficulty="4"
            type="button"
        >
            4
        </button>

        <button
            class="match-difficulty-button"
            data-difficulty="5"
            type="button"
        >
            5
        </button>

    </div>
        <div
        class="fire-start-level-label"
        id="matchStartLevelLabel"
    >
        Рівень 3 — середній
    </div>
`;
updateMatchStartLevelLabel();

function updateMatchStartLevelLabel() {

    const labels = {
        1: "дуже легко",
        2: "легко",
        3: "середній",
        4: "складно",
        5: "дуже складно"
    };

    const label = document.getElementById(
        "matchStartLevelLabel"
    );

    if (label) {
        label.textContent =
            `Рівень ${matchDifficulty} — ${labels[matchDifficulty]}`;
    }
}

const difficultyButtons =
    document.querySelectorAll(
        ".match-difficulty-button"
    );

difficultyButtons.forEach(button => {

    button.classList.remove("selected");

    if (
        Number(button.dataset.difficulty) ===
        matchDifficulty
    ) {
        button.classList.add("selected");
    }

    button.addEventListener("click", () => {

        matchDifficulty =
            Number(button.dataset.difficulty);

        difficultyButtons.forEach(
            item => {
                item.classList.remove("selected");
            }
        );

        button.classList.add("selected");

        const matchTempo =
            document.getElementById("matchTempo");

        matchTempo.value =
            matchDifficulty;

        document.getElementById(
            "matchTempoValue"
        ).textContent =
            matchDifficulty;
        
        updateMatchStartLevelLabel();
    });
});

    startButton.style.display = "flex";
    restartButton.style.display = "none";
    backToGamesButton.style.display = "flex";

    overlay.style.display = "flex";
}

function showMatchTaskStartOverlay() {

    const overlay =
        document.getElementById("matchTaskOverlay");

    const title =
        document.getElementById("matchTaskOverlayTitle");

    const subtitle =
        document.getElementById("matchTaskOverlaySubtitle");

    const text =
        document.getElementById("matchTaskOverlayText");

    const restartButton =
        document.getElementById("matchRestartButton");

    const startButton =
        document.getElementById("matchStartGameButton");

    const task =
        matchTaskDefinitions[matchCurrentTaskIndex];

    title.textContent = "🎯 Починаємо!";

    subtitle.textContent = "Перше завдання";

    text.textContent = task.text;

    restartButton.style.display = "none";

    startButton.style.display = "none";

    document.getElementById("matchBackToGamesButton").style.display = "none";

    overlay.classList.add("match-task-completion");
overlay.style.display = "flex";

setTimeout(() => {

    overlay.style.display = "none";
    overlay.classList.remove("match-task-completion");

}, 2200);
}

function updateMatchTaskProgress(matchedCells) {

    // Поки переходимо до нового завдання,
    // старе комбо не повинно зараховуватися вже новому.
    if (matchTaskChanging) {
        return;
    }

    const task =
        matchTaskDefinitions[matchCurrentTaskIndex];

    const cells =
        [...matchBoard.children];

    const targetCountries =
        new Set(task.targetCountries);

    const matchedTargetCountries =
        new Set();

    matchedCells.forEach(index => {

        const country =
            cells[index].dataset.country;

        if (targetCountries.has(country)) {
            matchedTargetCountries.add(country);
        }
    });

    matchTaskProgress +=
        matchedTargetCountries.size;

    if (matchTaskProgress > task.required) {
        matchTaskProgress = task.required;
    }

    updateMatchTaskDisplay();

    console.log(
        "Прогрес завдання:",
        matchTaskProgress,
        "/",
        task.required
    );

    // Завдання виконано
    if (
    matchTaskProgress >= task.required &&
    !matchTaskChanging
    ) {

        matchTaskChanging = true;

        // Показуємо велику картку переходу
        showMatchTaskOverlay();

        setTimeout(() => {

            const isLastTask =
                matchCurrentTaskIndex ===
                matchTaskDefinitions.length - 1;

            // Після останнього завдання
            // поки що залишаємо картку на екрані.
            if (isLastTask) {

                console.log(
                    "Усі 3 завдання виконано."
                );

                return;
            }

            // Переходимо до наступного завдання
            matchCurrentTaskIndex++;
            matchTaskProgress = 0;

            updateMatchTaskDisplay();

            // Ховаємо картку
            document.getElementById(
                "matchTaskOverlay"
            ).style.display = "none";

            console.log(
                "Нове завдання:",
                matchCurrentTaskIndex + 1
            );

            matchTaskChanging = false;

        }, 1800);
    }
}

function createMatchBoard() {

    matchBoard.innerHTML = "";

    matchCurrentTaskIndex = 0;
    matchTaskProgress = 0;
    matchTaskChanging = false;

    matchHints = 3;

    document.getElementById("matchHints").textContent = "3";
    document.getElementById("matchHintButton").disabled = false;

    matchScore = 0;

    document.getElementById("matchScore").textContent = "0";

    matchCombos = 0;

    document.getElementById("matchCombos").textContent = "0";
    matchMoves = 0;
    
    matchActiveCountries = [
    ...matchCountries
        .filter(country => country.bloc === "entente")
        .sort(() => Math.random() - 0.5)
        .slice(0, 3),

    ...matchCountries
        .filter(country => country.bloc === "central")
        .sort(() => Math.random() - 0.5)
        .slice(0, 3),

    ...matchCountries
        .filter(country => country.bloc === "neutral")
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
];

        // Перемішуємо порядок завдань для нової гри
    for (let i = matchTaskDefinitions.length - 1; i > 0; i--) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            matchTaskDefinitions[i],
            matchTaskDefinitions[j]
        ] = [
            matchTaskDefinitions[j],
            matchTaskDefinitions[i]
        ];
    }
    matchTaskDefinitions.forEach(task => {

    task.required =
        task.requiredByDifficulty[
            matchDifficulty - 1
        ];

    task.text =
        task.text.replace(/\d+/, task.required);
});
    updateMatchTaskDisplay();

    const board = [];

    // Кожна активна країна отримує рівно 4 кульки.
    // 9 країн × 4 = 36 клітинок.
    const countryBag = [];

    matchActiveCountries.forEach(country => {

        for (let i = 0; i < 4; i++) {
            countryBag.push(country);
        }
    });

    // Перемішуємо всі 36 кульок
    for (let i = countryBag.length - 1; i > 0; i--) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            countryBag[i],
            countryBag[j]
        ] = [
            countryBag[j],
            countryBag[i]
        ];
    }

    // Розкладаємо кульки на поле 6 × 6
    for (let row = 0; row < 6; row++) {

        board[row] = [];

        for (let col = 0; col < 6; col++) {

            board[row][col] =
                countryBag[row * 6 + col];
        }
    }
    
    let attempts = 0;
    let validBoard = false;

    while (
        !validBoard &&
        attempts < 1000
    ) {

        attempts++;

        // Беремо ту саму "сумку" з 36 кульок:
        // кожна активна країна представлена рівно 4 рази.
        const shuffledBag = [...countryBag];

        // Перемішуємо сумку
        for (
            let i = shuffledBag.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                shuffledBag[i],
                shuffledBag[j]
            ] = [
                shuffledBag[j],
                shuffledBag[i]
            ];
        }

        // Розкладаємо перемішану сумку на поле
        for (let row = 0; row < 6; row++) {

            board[row] = [];

            for (let col = 0; col < 6; col++) {

                board[row][col] =
                    shuffledBag[row * 6 + col];
            }
        }

        // Поле підходить, якщо:
        // 1. немає готової трійки;
        // 2. є щонайменше 5 можливих ходів.
        validBoard =
            !boardHasExistingMatch(board) &&
            countPossibleMoves(board) >= 5;
    }

    console.log(
        "Стартових можливих ходів:",
        countPossibleMoves(board)
    );

    console.log(
        "Готових комбінацій:",
        boardHasExistingMatch(board)
    );

    // Створюємо клітинки поля
    for (let row = 0; row < 6; row++) {

        for (let col = 0; col < 6; col++) {

            const country = board[row][col];

            const cell = document.createElement("div");

            cell.className = "match-cell";

            cell.dataset.bloc = country.bloc;
            cell.dataset.country = country.name;
            cell.dataset.image = country.image;

            const image = document.createElement("img");

            image.src = country.image;
            image.alt = country.name;

            cell.appendChild(image);

            matchBoard.appendChild(cell);
        }
    }

    updateMatchMovesDisplay();

    showMatchTaskStartOverlay();
}
function countPossibleMoves(board) {

    let count = 0;
    const possibleMoves = [];

    function createsMatch(testBoard) {

        // Горизонтальні трійки
        for (let row = 0; row < 6; row++) {

            for (let col = 0; col < 4; col++) {

                if (
                    testBoard[row][col].name ===
                    testBoard[row][col + 1].name &&
                    testBoard[row][col].name ===
                    testBoard[row][col + 2].name
                ) {
                    return true;
                }
            }
        }

        // Вертикальні трійки
        for (let row = 0; row < 4; row++) {

            for (let col = 0; col < 6; col++) {

                if (
                    testBoard[row][col].name ===
                    testBoard[row + 1][col].name &&
                    testBoard[row][col].name ===
                    testBoard[row + 2][col].name
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    for (let row = 0; row < 6; row++) {

        for (let col = 0; col < 6; col++) {

            // Обмін праворуч
            if (col < 5) {

                [
                    board[row][col],
                    board[row][col + 1]
                ] = [
                    board[row][col + 1],
                    board[row][col]
                ];

                if (createsMatch(board)) {

                    count++;

                    possibleMoves.push({
                        firstRow: row,
                        firstCol: col,
                        secondRow: row,
                        secondCol: col + 1
                    });
                }

                [
                    board[row][col],
                    board[row][col + 1]
                ] = [
                    board[row][col + 1],
                    board[row][col]
                ];
            }

            // Обмін униз
            if (row < 5) {

                [
                    board[row][col],
                    board[row + 1][col]
                ] = [
                    board[row + 1][col],
                    board[row][col]
                ];

                if (createsMatch(board)) {

                    count++;

                    possibleMoves.push({
                        firstRow: row,
                        firstCol: col,
                        secondRow: row + 1,
                        secondCol: col
                    });
                }

                [
                    board[row][col],
                    board[row + 1][col]
                ] = [
                    board[row + 1][col],
                    board[row][col]
                ];
            }
        }
    }
     
    window.currentMatchPossibleMoves = possibleMoves;

    return count;
}
function ensurePlayableBoard(board) {

    const targetMoves = 6;
    let currentMoves = countPossibleMoves(board);
    let attempts = 0;

    while (
        currentMoves < targetMoves &&
        attempts < 1000
    ) {

        attempts++;

        const row =
            Math.floor(Math.random() * 6);

        const col =
            Math.floor(Math.random() * 6);

        const possibleNeighbors = [];

        if (col < 5) {
            possibleNeighbors.push([row, col + 1]);
        }

        if (row < 5) {
            possibleNeighbors.push([row + 1, col]);
        }

        if (possibleNeighbors.length === 0) {
            continue;
        }

        const [swapRow, swapCol] =
            possibleNeighbors[
                Math.floor(
                    Math.random() *
                    possibleNeighbors.length
                )
            ];

        [
            board[row][col],
            board[swapRow][swapCol]
        ] = [
            board[swapRow][swapCol],
            board[row][col]
        ];

        const newMoves =
            countPossibleMoves(board);

        const newMatches =
            boardHasExistingMatch(board);

        // Залишаємо обмін тільки тоді,
        // коли він збільшує кількість можливих ходів
        // і не створює готову трійку.
        if (
            newMoves > currentMoves &&
            !newMatches
        ) {

            currentMoves = newMoves;

        } else {

            // Якщо краще не стало —
            // повертаємо все назад.
            [
                board[row][col],
                board[swapRow][swapCol]
            ] = [
                board[swapRow][swapCol],
                board[row][col]
            ];
        }
    }

    console.log(
        "Стартових можливих ходів:",
        currentMoves
    );
}
function boardHasExistingMatch(board) {

    // Горизонтальні трійки
    for (let row = 0; row < 6; row++) {

        for (let col = 0; col < 4; col++) {

            if (
                board[row][col].name ===
                board[row][col + 1].name &&
                board[row][col].name ===
                board[row][col + 2].name
            ) {
                return true;
            }
        }
    }

    // Вертикальні трійки
    for (let row = 0; row < 4; row++) {

        for (let col = 0; col < 6; col++) {

            if (
                board[row][col].name ===
                board[row + 1][col].name &&
                board[row][col].name ===
                board[row + 2][col].name
            ) {
                return true;
            }
        }
    }

    return false;
}
function shuffleMatchBoardIfNeeded() {

    const cells = [...matchBoard.children];
    const currentBoard = [];

    for (let row = 0; row < 6; row++) {

        currentBoard.push(
            cells
                .slice(row * 6, row * 6 + 6)
                .map(cell => ({
                    name: cell.dataset.country,
                    bloc: cell.dataset.bloc,
                    image: cell.dataset.image
                }))
        );
    }

    const currentMoves =
        countPossibleMoves(currentBoard);

    // Якщо є щонайменше 3 можливі ходи,
    // перемішувати поле не потрібно.
    if (currentMoves >= 3) {

        console.log(
            "Поле ще має можливі ходи:",
            currentMoves
        );

        return;
    }
    const countries = cells.map(cell => ({
        name: cell.dataset.country,
        bloc: cell.dataset.bloc,
        image: cell.dataset.image
    }));

    let shuffledBoard = [];
    let attempts = 0;

    do {

        const shuffled = [...countries];

        // Перемішуємо всі 36 країн
        for (let i = shuffled.length - 1; i > 0; i--) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                shuffled[i],
                shuffled[j]
            ] = [
                shuffled[j],
                shuffled[i]
            ];
        }

        // Перетворюємо назад у поле 6 × 6
        shuffledBoard = [];

        for (let row = 0; row < 6; row++) {

            shuffledBoard.push(
                shuffled.slice(
                    row * 6,
                    row * 6 + 6
                )
            );
        }

        attempts++;

    } while (
        (
            boardHasExistingMatch(shuffledBoard) ||
            countPossibleMoves(shuffledBoard) < 4
        ) &&
        attempts < 1000
    );

    // Якщо придатне поле знайдено —
    // запускаємо коротку анімацію перемішування
    if (
        !boardHasExistingMatch(shuffledBoard) &&
        countPossibleMoves(shuffledBoard) >= 4
    ) {

        // Тимчасово блокуємо натискання по полю
        matchBoard.style.pointerEvents = "none";

        // Перша фаза: кульки розлітаються
        cells.forEach(cell => {

            const x =
                Math.floor(Math.random() * 60) - 30;

            const y =
                Math.floor(Math.random() * 60) - 30;

            const rotate =
                Math.floor(Math.random() * 40) - 20;

            cell.style.transition = "none";

            cell.style.transform =
                `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(0.88)`;

            cell.style.opacity = "0.45";
        });

        // Примушуємо браузер показати першу фазу
        matchBoard.offsetWidth;

        requestAnimationFrame(() => {

            // Друга фаза: ще одне переміщення
            cells.forEach(cell => {

                const x =
                    Math.floor(Math.random() * 80) - 40;

                const y =
                    Math.floor(Math.random() * 80) - 40;

                const rotate =
                    Math.floor(Math.random() * 60) - 30;

                cell.style.transition =
                    "transform 0.22s ease, opacity 0.22s ease";

                cell.style.transform =
                    `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(0.75)`;

                cell.style.opacity = "0.2";
            });

            setTimeout(() => {

                // Тепер підміняємо кульки на нове поле
                for (let row = 0; row < 6; row++) {

                    for (let col = 0; col < 6; col++) {

                        const index =
                            row * 6 + col;

                        const country =
                            shuffledBoard[row][col];

                        const cell =
                            cells[index];

                        const image =
                            cell.querySelector("img");

                        cell.dataset.country =
                            country.name;

                        cell.dataset.bloc =
                            country.bloc;

                        cell.dataset.image =
                            country.image;

                        image.src =
                            country.image;

                        image.alt =
                            country.name;
                    }
                }

                console.log(
                    "Поле перемішано. Можливих ходів:",
                    countPossibleMoves(shuffledBoard)
                );

                requestAnimationFrame(() => {

                    // Третя фаза: кульки повертаються на місця
                    cells.forEach(cell => {

                        cell.style.transition =
                            "transform 0.32s ease, opacity 0.32s ease";

                        cell.style.transform =
                            "translate(0, 0) rotate(0deg) scale(1)";

                        cell.style.opacity = "1";
                    });

                    setTimeout(() => {

                        // Прибираємо тимчасові стилі
                        cells.forEach(cell => {

                            cell.style.transition = "";
                            cell.style.transform = "";
                            cell.style.opacity = "";
                        });

                        matchBoard.style.pointerEvents = "auto";

                    }, 350);
                });

            }, 220);
        });
    }   
}
    
function updateMatchMovesDisplay() {

    const cells = [...matchBoard.children];

    const board = [];

    for (let row = 0; row < 6; row++) {

        board.push(
            cells
                .slice(row * 6, row * 6 + 6)
                .map(cell => ({
                    name: cell.dataset.country,
                    bloc: cell.dataset.bloc,
                    image: cell.dataset.image
                }))
        );
    }

    const moves = countPossibleMoves(board);

    const movesDisplay =
        document.getElementById("matchMoves");

    // Не показуємо нуль під час короткого
    // технічного перебудовування поля.
    if (moves === 0) {

    movesDisplay.textContent = "0";

    // Якщо ходів немає — запускаємо перемішування
    // після короткої паузи.
    if (!matchShuffleTimer) {

        matchShuffleTimer = setTimeout(() => {

            matchShuffleTimer = null;

            shuffleMatchBoardIfNeeded();

            updateMatchMovesDisplay();

        }, 500);
    }

} else {

    if (matchShuffleTimer) {

        clearTimeout(matchShuffleTimer);

        matchShuffleTimer = null;
    }
}
    movesDisplay.textContent = moves;
}

function showMatchMoveHint() {

    const cells = [...matchBoard.children];

    // Прибираємо стару підказку
    cells.forEach(cell => {
        cell.classList.remove("hint-move");
    });

    // Скасовуємо попередній таймер
    clearTimeout(matchHintTimer);

    const moves =
        window.currentMatchPossibleMoves || [];

    // Автоматична підказка потрібна
    // тільки коли залишився 1 можливий хід.
    if (moves.length !== 1) {
        return;
    }

    // Чекаємо 8 секунд бездіяльності.
    matchHintTimer = setTimeout(() => {

        const currentCells =
            [...matchBoard.children];

        const currentMoves =
            window.currentMatchPossibleMoves || [];

        console.log(
            "АВТОПІДКАЗКА: зараз можливих ходів =",
            currentMoves.length
        );

        // Перевіряємо, що все ще є
        // рівно один можливий хід.
        if (currentMoves.length !== 1) {
            return;
        }

        const move =
            currentMoves[0];

        const firstIndex =
            move.firstRow * 6 + move.firstCol;

        const secondIndex =
            move.secondRow * 6 + move.secondCol;

        if (
            currentCells[firstIndex] &&
            currentCells[secondIndex]
        ) {

            currentCells[firstIndex]
                .classList.add("hint-move");

            currentCells[secondIndex]
                .classList.add("hint-move");

            
        }

    }, 8000);
}

function useManualMatchHint() {

    if (matchHints <= 0) {
        return;
    }

    if (matchBoardBusy) {
        return;
    }

    const moves =
        window.currentMatchPossibleMoves || [];
    

    if (moves.length === 0) {
        return;
    }

    const cells = [...matchBoard.children];

    // Скасовуємо автоматичний таймер
    clearTimeout(matchHintTimer);

    // Прибираємо попередню підказку
    cells.forEach(cell => {
        cell.classList.remove("hint-move");
    });

    const move = moves[0];

    const firstIndex =
        move.firstRow * 6 + move.firstCol;

    const secondIndex =
        move.secondRow * 6 + move.secondCol;

    cells[firstIndex].classList.add("hint-move");
    cells[secondIndex].classList.add("hint-move");

    matchHints--;

    document.getElementById(
        "matchHints"
    ).textContent = matchHints;

    if (matchHints === 0) {
        document.getElementById(
            "matchHintButton"
        ).disabled = true;
    }

    // Показуємо підказку 3 секунди
    setTimeout(() => {

        cells[firstIndex]?.classList.remove("hint-move");
        cells[secondIndex]?.classList.remove("hint-move");

    }, 3000);
}

function boardHasPossibleMove(board) {

    function createsMatch(testBoard) {

        // Горизонтальні трійки
        for (let row = 0; row < 6; row++) {

            for (let col = 0; col < 4; col++) {

                if (
                    testBoard[row][col].name ===
                    testBoard[row][col + 1].name &&
                    testBoard[row][col].name ===
                    testBoard[row][col + 2].name
                ) {
                    return true;
                }
            }
        }

        // Вертикальні трійки
        for (let row = 0; row < 4; row++) {

            for (let col = 0; col < 6; col++) {

                if (
                    testBoard[row][col].name ===
                    testBoard[row + 1][col].name &&
                    testBoard[row][col].name ===
                    testBoard[row + 2][col].name
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    // Перевіряємо кожну можливу пару сусідів
    for (let row = 0; row < 6; row++) {

        for (let col = 0; col < 6; col++) {

            // Обмін із сусідом праворуч
            if (col < 5) {

                [
                    board[row][col],
                    board[row][col + 1]
                ] = [
                    board[row][col + 1],
                    board[row][col]
                ];

                if (createsMatch(board)) {

                    // Повертаємо все назад
                    [
                        board[row][col],
                        board[row][col + 1]
                    ] = [
                        board[row][col + 1],
                        board[row][col]
                    ];

                    return true;
                }

                // Повертаємо все назад
                [
                    board[row][col],
                    board[row][col + 1]
                ] = [
                    board[row][col + 1],
                    board[row][col]
                ];
            }

            // Обмін із сусідом униз
            if (row < 5) {

                [
                    board[row][col],
                    board[row + 1][col]
                ] = [
                    board[row + 1][col],
                    board[row][col]
                ];

                if (createsMatch(board)) {

                    // Повертаємо все назад
                    [
                        board[row][col],
                        board[row + 1][col]
                    ] = [
                        board[row + 1][col],
                        board[row][col]
                    ];

                    return true;
                }

                // Повертаємо все назад
                [
                    board[row][col],
                    board[row + 1][col]
                ] = [
                    board[row + 1][col],
                    board[row][col]
                ];
            }
        }
    }

    return false;
}
let selectedMatchCell = null;
let matchBoardBusy = false;

let matchHintTimer = null;
let matchShuffleTimer = null;
let matchHints = 3;
let matchScore = 0;
let matchCombos = 0;
let matchDifficulty = 3;
const matchDifficultyNames = [
    "Дуже легко",
    "Легко",
    "Середньо",
    "Складно",
    "Дуже складно"
];

let gameSoundMuted = false;
let matchAudioContext = null;
let sortAudioContext = null;

function playMatchSound(type) {

    if (gameSoundMuted) {
        return;
    }

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass) {
        return;
    }

    if (!matchAudioContext) {
        matchAudioContext = new AudioContextClass();
    }

    const ctx = matchAudioContext;

    function playTone(
        frequency,
        endFrequency,
        duration,
        volume,
        startOffset = 0
    ) {

        const now = ctx.currentTime + startOffset;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            frequency,
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            endFrequency,
            now + duration
        );

        gain.gain.setValueAtTime(0.0001, now);

        gain.gain.exponentialRampToValueAtTime(
            volume,
            now + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    function playRequestedSound() {

        if (type === "invalid") {

            // Короткий звук невдалого ходу
            playTone(260, 180, 0.10, 0.045);

            return;
        }

        if (type === "clear") {

            // Дзвінкий звук зникнення ряду
            playTone(620, 920, 0.16, 0.06);

            playTone(900, 1250, 0.18, 0.045, 0.06);

            return;
        }

        if (type === "cascade") {

            // Три чіткі висхідні ноти каскаду
            playTone(700, 950, 0.12, 0.07, 0);

            playTone(1000, 1300, 0.13, 0.065, 0.14);

            playTone(1350, 1700, 0.16, 0.06, 0.29);

            return;
        }
    }

    if (ctx.state === "suspended") {

        ctx.resume()
            .then(playRequestedSound)
            .catch(() => {});

    } else {

        playRequestedSound();
    }
}

// =======================================
// РОЗСОРТУЙ! — ЗВУКИ
// =======================================

function playSortSound(type) {

    if (gameSoundMuted) {
        return;
    }

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass) {
        return;
    }

    if (!sortAudioContext) {
        sortAudioContext = new AudioContextClass();
    }

    const ctx = sortAudioContext;

    function playTone(
        frequency,
        endFrequency,
        duration,
        volume,
        startOffset = 0
    ) {

        const now = ctx.currentTime + startOffset;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            frequency,
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            endFrequency,
            now + duration
        );

        gain.gain.setValueAtTime(0.0001, now);

        gain.gain.exponentialRampToValueAtTime(
            volume,
            now + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    function playRequestedSound() {

        if (type === "move") {

            // Короткий звук переміщення
            playTone(420, 610, 0.09, 0.04);

            return;
        }

        if (type === "invalid") {

            // Низький короткий сигнал: хід неможливий
            playTone(260, 175, 0.13, 0.045);

            return;
        }

        if (type === "clear") {

            // Дзвінкий звук польоту Countryballs
            playTone(550, 760, 0.22, 0.055, 0);

            playTone(760, 980, 0.24, 0.05, 0.17);

            playTone(980, 1250, 0.28, 0.045, 0.36);

            playTone(1250, 1550, 0.30, 0.04, 0.57);

            return;
        }
    }

    if (ctx.state === "suspended") {

        ctx.resume()
            .then(playRequestedSound)
            .catch(() => {});

    } else {

        playRequestedSound();
    }
}

matchBoard.addEventListener("click", (event) => {

    const cell = event.target.closest(".match-cell");

    if (!cell) return;

    if (matchBoardBusy) return;


    // Перше натискання — вибираємо клітинку
    if (!selectedMatchCell) {

        selectedMatchCell = cell;
        cell.classList.add("selected");

        return;
    }


    // Натиснули на ту саму клітинку — скасовуємо вибір
    if (selectedMatchCell === cell) {

        selectedMatchCell.classList.remove("selected");
        selectedMatchCell = null;

        return;
    }


    // Визначаємо позиції двох клітинок
    const cells = [...matchBoard.children];

    const firstIndex = cells.indexOf(selectedMatchCell);
    const secondIndex = cells.indexOf(cell);

    const firstRow = Math.floor(firstIndex / 6);
    const firstCol = firstIndex % 6;

    const secondRow = Math.floor(secondIndex / 6);
    const secondCol = secondIndex % 6;


    // Дозволяємо обмін тільки сусідніх клітинок
    const isAdjacent =
        Math.abs(firstRow - secondRow) +
        Math.abs(firstCol - secondCol) === 1;

    if (!isAdjacent) {

         playMatchSound("invalid");

        selectedMatchCell.classList.remove("selected");
        selectedMatchCell = null;

        return;
    }


    // Запам'ятовуємо дані першої клітинки
    const firstImage = selectedMatchCell.querySelector("img");
    const secondImage = cell.querySelector("img");

    const firstSrc = firstImage.src;
    const firstAlt = firstImage.alt;
    const firstBloc = selectedMatchCell.dataset.bloc;
    const firstCountry = selectedMatchCell.dataset.country;
    const firstImagePath = selectedMatchCell.dataset.image;


    // Запам'ятовуємо дані другої клітинки
    const secondSrc = secondImage.src;
    const secondAlt = secondImage.alt;
    const secondBloc = cell.dataset.bloc;
    const secondCountry = cell.dataset.country;
    const secondImagePath = cell.dataset.image;


    // Міняємо картинки
    firstImage.src = secondSrc;
    firstImage.alt = secondAlt;

    secondImage.src = firstSrc;
    secondImage.alt = firstAlt;


    // Міняємо дані Countryballs
    selectedMatchCell.dataset.bloc = secondBloc;
    selectedMatchCell.dataset.country = secondCountry;
    selectedMatchCell.dataset.image = secondImagePath;

    cell.dataset.bloc = firstBloc;
    cell.dataset.country = firstCountry;
    cell.dataset.image = firstImagePath;


    // Прибираємо виділення
    selectedMatchCell.classList.remove("selected");
    selectedMatchCell = null;


    // Перевіряємо, чи створив обмін комбінацію
    const matchedCells =
        checkMatchCombos(firstIndex, secondIndex);
    if (matchedCells.length > 0) {

        removeMatchedCells(matchedCells);

    }


    // Якщо комбінації немає —
    // повертаємо Countryballs назад
    if (matchedCells.length === 0) {

        // Повертаємо картинки
        firstImage.src = firstSrc;
        firstImage.alt = firstAlt;

        secondImage.src = secondSrc;
        secondImage.alt = secondAlt;


        // Повертаємо дані Countryballs
        cells[firstIndex].dataset.bloc = firstBloc;
        cells[firstIndex].dataset.country = firstCountry;
        cells[firstIndex].dataset.image = firstImagePath;

        cells[secondIndex].dataset.bloc = secondBloc;
        cells[secondIndex].dataset.country = secondCountry;
        cells[secondIndex].dataset.image = secondImagePath;

        playMatchSound("invalid");
        console.log("Комбінації немає — обмін скасовано.");
    }

});

function checkMatchCombos(firstIndex, secondIndex) {

    const cells = [...matchBoard.children];

    function findMatchesAround(index) {

        const row = Math.floor(index / 6);
        const col = index % 6;
        const country = cells[index].dataset.country;

        const horizontal = [index];
        const vertical = [index];

        // Перевіряємо вліво
        let currentCol = col - 1;

        while (
            currentCol >= 0 &&
            cells[row * 6 + currentCol].dataset.country === country
        ) {

            horizontal.push(row * 6 + currentCol);
            currentCol--;

        }

        // Перевіряємо вправо
        currentCol = col + 1;

        while (
            currentCol < 6 &&
            cells[row * 6 + currentCol].dataset.country === country
        ) {

            horizontal.push(row * 6 + currentCol);
            currentCol++;

        }

        // Перевіряємо вгору
        let currentRow = row - 1;

        while (
            currentRow >= 0 &&
            cells[currentRow * 6 + col].dataset.country === country
        ) {

            vertical.push(currentRow * 6 + col);
            currentRow--;

        }

        // Перевіряємо вниз
        currentRow = row + 1;

        while (
            currentRow < 6 &&
            cells[currentRow * 6 + col].dataset.country === country
        ) {

            vertical.push(currentRow * 6 + col);
            currentRow++;

        }

        const matches = [];

        // Горизонтальна комбінація
        if (horizontal.length >= 3) {
            matches.push(...horizontal);
        }

        // Вертикальна комбінація
        if (vertical.length >= 3) {
            matches.push(...vertical);
        }

        return matches;
    }

    // Перевіряємо тільки дві клітинки,
    // які щойно поміняли місцями
    const matches = [
        ...findMatchesAround(firstIndex),
        ...findMatchesAround(secondIndex)
    ];

    // Прибираємо дублікати
    const uniqueCombos = [
        ...new Set(matches)
    ];

    console.log(
        "Нові комбінації:",
        uniqueCombos
    );

    // Підсвічуємо нову комбінацію
    uniqueCombos.forEach(index => {

        cells[index].classList.add("combo-found");

        console.log(
            "Підсвічую клітинку:",
            index
        );

    });

    return uniqueCombos;
}

function addMatchScore(matchedCells, isCascade = false) {

    const cells =
        [...matchBoard.children];

    const countryCounts = new Map();

    matchedCells.forEach(index => {

        const country =
            cells[index].dataset.country;

        countryCounts.set(
            country,
            (countryCounts.get(country) || 0) + 1
        );
    });

    let points = 0;

    countryCounts.forEach((count, country) => {

        if (count < 3) {
            return;
        }

        // Базові бали:
        // 3 однакові = 30
        // 4 однакові = 40
        // 5 однакових = 50
        points += count * 10;

        // Бонус за виконання поточного завдання
        const task =
            matchTaskDefinitions[
                matchCurrentTaskIndex
            ];

        if (
            task &&
            task.targetCountries.includes(country)
        ) {
            points += 50;
        }
    });

    // Бонус за каскад
    if (isCascade) {
        points += 10;
    }

    matchScore += points;

    document.getElementById(
        "matchScore"
    ).textContent = matchScore;

    console.log(
        "Бали:",
        points,
        "| Загальний рахунок:",
        matchScore
    );
}

function showMatchCountryNotification(matchedCells) {

    const cells =
        [...matchBoard.children];

    const countryCounts =
        new Map();

    let totalX = 0;
    let totalY = 0;
    let validCells = 0;

    matchedCells.forEach(index => {

        const cell = cells[index];

        if (!cell) {
            return;
        }

        const country =
            cell.dataset.country;

        countryCounts.set(
            country,
            (countryCounts.get(country) || 0) + 1
        );

        const rect =
            cell.getBoundingClientRect();

        totalX +=
            rect.left + rect.width / 2;

        totalY +=
            rect.top + rect.height / 2;

        validCells++;
    });

    const notification =
        document.getElementById(
            "matchCountryNotification"
        );

    if (
        !notification ||
        countryCounts.size === 0 ||
        validCells === 0
    ) {
        return;
    }

    const parts = [];

    countryCounts.forEach(
        (count, country) => {

            parts.push(
                `${country} · ×${count}`
            );
        }
    );

    notification.textContent =
        parts.join("   ");

    const centerX =
        totalX / validCells;

    const centerY =
        totalY / validCells;

    notification.style.left =
        `${centerX}px`;

    notification.style.top =
        `${centerY}px`;

    clearTimeout(
        showMatchCountryNotification.timer
    );

    notification.classList.add("show");

    showMatchCountryNotification.timer =
        setTimeout(() => {

            notification.classList.remove(
                "show"
            );

        }, 1200);
}

function removeMatchedCells(
    matchedCells,
    isCascade = false
) {

    matchBoardBusy = true;

    matchCombos++;

    document.getElementById("matchCombos").textContent = matchCombos;

    addMatchScore(
        matchedCells,
        isCascade
    );
    
    showMatchCountryNotification(
        matchedCells
    );

    const cells = [...matchBoard.children];

    updateMatchTaskProgress(matchedCells);

    if (isCascade) {
    playMatchSound("cascade");
} else {
    playMatchSound("clear");
}

    // Спочатку показуємо анімацію зникнення
    matchedCells.forEach(index => {

        const cell = cells[index];

        cell.classList.add("matched");

    });

    // Після завершення анімації заповнюємо порожні місця
    setTimeout(() => {

        collapseMatchBoard(matchedCells);

    }, 400);
}
function collapseMatchBoard(matchedCells) {

    const cells = [...matchBoard.children];

    // Запам'ятовуємо клітинки, які мають зникнути
    const matchedSet = new Set(matchedCells);

    // Працюємо окремо з кожним стовпчиком
    for (let col = 0; col < 6; col++) {

        const remainingCountries = [];

        // Збираємо всі кульки, які залишилися,
        // починаючи знизу
        for (let row = 5; row >= 0; row--) {

            const index = row * 6 + col;

            if (!matchedSet.has(index)) {

                remainingCountries.push({
                    name: cells[index].dataset.country,
                    bloc: cells[index].dataset.bloc,
                    image: cells[index].dataset.image
                });

            }
        }

        // Додаємо нові кульки зверху,
        // щоб стовпчик знову мав 6 кульок
        while (remainingCountries.length < 6) {

            const country =
                matchActiveCountries[
                    Math.floor(
                        Math.random() * matchActiveCountries.length
                    )
                ];

            remainingCountries.push({
                name: country.name,
                bloc: country.bloc,
                image: country.image
            });
        }

        // Записуємо результат назад у стовпчик
        for (let row = 5; row >= 0; row--) {

            const index = row * 6 + col;
            const country = remainingCountries[5 - row];

            const cell = cells[index];
            const image = cell.querySelector("img");

            cell.dataset.country = country.name;
            cell.dataset.bloc = country.bloc;
            cell.dataset.image = country.image;

            image.src = country.image;
            image.alt = country.name;

            // Прибираємо старий стан
            cell.classList.remove("matched");
            cell.classList.remove("combo-found");
        }
    }
        // Перевіряємо, чи утворилося нове комбо після падіння
        const newMatches = findAllBoardMatches();

        if (newMatches.length > 0) {

            console.log(
                "Каскад! Нові комбінації:",
                newMatches
        );

        removeMatchedCells(newMatches, true);

    } else {

        shuffleMatchBoardIfNeeded(); 
        updateMatchMovesDisplay();

        matchBoardBusy = false;
    }

}
function findAllBoardMatches() {

    const cells = [...matchBoard.children];
    const matches = new Set();

    // Перевіряємо горизонтальні комбінації
    for (let row = 0; row < 6; row++) {

        for (let col = 0; col < 4; col++) {

            const index1 = row * 6 + col;
            const index2 = row * 6 + col + 1;
            const index3 = row * 6 + col + 2;

            const country =
                cells[index1].dataset.country;

            if (
                cells[index2].dataset.country === country &&
                cells[index3].dataset.country === country
            ) {

                matches.add(index1);
                matches.add(index2);
                matches.add(index3);

            }
        }
    }

    // Перевіряємо вертикальні комбінації
    for (let row = 0; row < 4; row++) {

        for (let col = 0; col < 6; col++) {

            const index1 = row * 6 + col;
            const index2 = (row + 1) * 6 + col;
            const index3 = (row + 2) * 6 + col;

            const country =
                cells[index1].dataset.country;

            if (
                cells[index2].dataset.country === country &&
                cells[index3].dataset.country === country
            ) {

                matches.add(index1);
                matches.add(index2);
                matches.add(index3);

            }
        }
    }

    return [...matches];
}
function getRandomCountry(currentEnemy = null) {

    // Не враховуємо країну, яку саме зараз замінюємо
    const otherEnemies =
        enemies.filter(enemy => enemy !== currentEnemy);

    const usedCountries =
        otherEnemies.map(enemy => enemy.country);

    const availableCountries =
        Object.values(COUNTRIES).filter(country => {
            return (
                country.name !== "Німецька імперія" &&
                !usedCountries.includes(country)
            );
        });

    // Чи залишився на полі бомбардувальник?
    const bomberPresent =
        otherEnemies.some(enemy => {
            return (
                enemy.country === COUNTRIES.france ||
                enemy.country === COUNTRIES.greatBritain
            );
        });

    // Якщо жодного немає — обираємо Францію або Британію
    if (!bomberPresent) {

        const availableBombers = [
            COUNTRIES.france,
            COUNTRIES.greatBritain
        ].filter(country => {
            return (
                country &&
                availableCountries.includes(country)
            );
        });

        if (availableBombers.length > 0) {

            const randomIndex =
                Math.floor(
                    Math.random() * availableBombers.length
                );

            return availableBombers[randomIndex];
        }
    }

    // В інших випадках зберігаємо випадковий вибір
    const randomIndex =
        Math.floor(
            Math.random() * availableCountries.length
        );

    return availableCountries[randomIndex];
}
function setEnemyCountry(enemy, country) {
    enemy.country = country;

    const image = enemy.element.querySelector("img");

    image.src = country.image;
    image.alt = country.name;
}
const fireCard = document.querySelector(".fire-card");
const backToMenu = document.getElementById("backToMenu");


startButton.addEventListener("click", () => {

    welcomeScreen.style.display = "none";

    gameMenu.style.display = "block";

    // Скидаємо стан гри «Вогонь!»
    fireScoreValue = 0;
    fireLivesValue = 10;
    fireGameOver = false;

    fireScoreDisplay.textContent = "0";
    document.getElementById("fireLives").textContent = "3";

    fireGameOverScreen.style.display = "none";
    aimLine.style.display = "block";

    fireMessage.textContent =
        "Влучай у противників!";

    hitLabel.style.display = "none";

    bulletActive = false;
    bullet.style.display = "none";

    // Новий запуск завжди починається зі стандартного темпу
    fireTempo.value = "3";
    fireTempoValue.textContent = "3";
    fireTempoMultiplier = 1;
});

fireCard.addEventListener("click", () => {

    gameMenu.style.display = "none";
    fireGame.style.display = "block";
    fireGameOverScreen.style.display = "none";
    resetCountryReferencePanels();

    // Поки показуємо інструкцію, гра призупинена
    fireGameOver = true;
    bulletActive = false;
    bullet.style.display = "none";
    aimLine.style.display = "none";
    hitLabel.style.display = "none";

    // Прибираємо попередню бомбу й таймер
    clearTimeout(fireBombTimer);
    fireBombTimer = null;

    if (fireBomb) {
        fireBomb.remove();
        fireBomb = null;
    }

    fireBombActive = false;

    // Початковий вибір — третій рівень
    fireTempo.value = "3";
    fireTempo.dispatchEvent(
        new Event("input", { bubbles: true })
    );

    fireTempoValue.textContent = "3";

    document.querySelectorAll(
        ".fire-difficulty-button"
    ).forEach(button => {
        button.classList.toggle(
            "selected",
            Number(button.dataset.fireDifficulty) === 3
        );
    });

    document.querySelector(
        ".fire-start-level-label"
    ).textContent = "Рівень 3 — середній";

    // Показуємо стартовий екран
    document.getElementById(
        "fireStartOverlay"
    ).style.display = "flex";
});

// Вибір складності на стартовому екрані «Вогню!»
document.querySelectorAll(
    ".fire-difficulty-button"
).forEach(button => {

    button.addEventListener("click", event => {

        event.stopPropagation();

        const level =
            Number(button.dataset.fireDifficulty);

        fireTempo.value = String(level);

        fireTempo.dispatchEvent(
            new Event("input", { bubbles: true })
        );

        fireTempoValue.textContent =
            String(level);

        document.querySelectorAll(
            ".fire-difficulty-button"
        ).forEach(item => {
            item.classList.toggle(
                "selected",
                item === button
            );
        });

        const levelNames = {
            1: "Рівень 1 — навчальний",
            2: "Рівень 2 — легкий",
            3: "Рівень 3 — середній",
            4: "Рівень 4 — складний",
            5: "Рівень 5 — експертний"
        };

        document.querySelector(
            ".fire-start-level-label"
        ).textContent = levelNames[level];
    });
});


// Кнопка «Почати гру»
document.getElementById(
    "fireStartButton"
).addEventListener("click", event => {

    event.stopPropagation();

    document.getElementById(
        "fireStartOverlay"
    ).style.display = "none";

    fireScoreValue = 0;
    fireLivesValue = 10;
    fireGameOver = false;

    document.getElementById(
        "fireScore"
    ).textContent = "0";

    document.getElementById(
        "fireLives"
    ).textContent = "10";

    fireGameOverScreen.style.display = "none";

    aimLine.style.display = "block";

    fireMessage.classList.remove(
        "hit-success",
        "hit-neutral"
    );

    fireMessage.textContent =
        "Влучай у противників!";

    hitLabel.style.display = "none";

    bulletActive = false;
    bullet.style.display = "none";

    // Повертаємо країни на поле
    enemies.forEach(enemy => {

        enemy.element.style.display = "block";

        const newCountry =
            getRandomCountry(enemy);

        setEnemyCountry(
            enemy,
            newCountry
        );

        enemy.x = 10 + Math.random() * 80;

        enemy.element.style.left =
            `${enemy.x}%`;
    });

    // Застосовуємо вибраний рівень
    const selectedButton =
        document.querySelector(
            ".fire-difficulty-button.selected"
        );

    const level = selectedButton
        ? Number(selectedButton.dataset.fireDifficulty)
        : 3;

    fireTempo.value = String(level);

    fireTempo.dispatchEvent(
        new Event("input", { bubbles: true })
    );

    fireTempoValue.textContent =
        String(level);

    // Запускаємо новий цикл бомб
    clearTimeout(fireBombTimer);
    fireBombTimer = null;

    if (fireBomb) {
        fireBomb.remove();
        fireBomb = null;
    }

    fireBombActive = false;

    scheduleFireBomb();
});


// Кнопка «До всіх ігор» на стартовому екрані
document.getElementById(
    "fireStartBackButton"
).addEventListener("click", event => {

    event.stopPropagation();

    document.getElementById(
        "fireStartOverlay"
    ).style.display = "none";

    fireGame.style.display = "none";
    fireGameOver = true;

    bulletActive = false;
    bullet.style.display = "none";
    aimLine.style.display = "none";

    clearTimeout(fireBombTimer);
    fireBombTimer = null;

    if (fireBomb) {
        fireBomb.remove();
        fireBomb = null;
    }

    fireBombActive = false;

    gameMenu.style.display = "block";
});

matchCard.addEventListener("click", () => {

    // Приховуємо гру «Вогонь!»
    fireGame.style.display = "none";
    fireGameOverScreen.style.display = "none";

    // Прибираємо активний постріл
    bulletActive = false;
    bullet.style.display = "none";
    hitLabel.style.display = "none";

    // Відкриваємо «Три в ряд»
    gameMenu.style.display = "none";
    matchGame.style.display = "block";

    showMatchDifficultyOverlay();
});

document
    .getElementById("matchRestartButton")
    .addEventListener("click", () => {

        const overlay =
            document.getElementById("matchTaskOverlay");

        const matchTempo =
            document.getElementById("matchTempo");

        matchTempo.disabled = false;
        matchTempo.style.opacity = "1";

        overlay.style.display = "none";

        showMatchDifficultyOverlay();
    });

document
    .getElementById("matchStartGameButton")
    .addEventListener("click", () => {

        document.getElementById(
            "matchTaskOverlay"
        ).style.display = "none";

        const matchTempo =
            document.getElementById("matchTempo");

        matchTempo.disabled = true;
        matchTempo.style.opacity = "0.45";

        createMatchBoard();
    });

document
    .getElementById("matchBackToGamesButton")
    .addEventListener("click", (event) => {

        event.stopPropagation();

        document.getElementById(
            "matchTaskOverlay"
        ).style.display = "none";

        const matchTempo =
            document.getElementById("matchTempo");

        matchTempo.disabled = false;
        matchTempo.style.opacity = "1";

        // Закриваємо ігрові екрани
        matchGame.style.display = "none";
        fireGame.style.display = "none";
        fireGameOverScreen.style.display = "none";

        // Повертаємося до вибору ігор
        gameMenu.style.display = "block";
        resetCountryReferencePanels();
    });

document
    .getElementById("matchBackToMenu")
    .addEventListener("click", (event) => {

        event.stopPropagation();

        // Закриваємо накладені екрани
        document.getElementById(
            "matchTaskOverlay"
        ).style.display = "none";

        matchGame.style.display = "none";
        fireGame.style.display = "none";
        fireGameOverScreen.style.display = "none";

        // Повертаємося до вибору ігор
        gameMenu.style.display = "block";

        // Відновлюємо налаштування швидкості
        const matchTempo =
            document.getElementById("matchTempo");

        matchTempo.disabled = false;
        matchTempo.style.opacity = "1";
    });    

document
    .getElementById("matchHintButton")
    .addEventListener("click", () => {

        useManualMatchHint();
    });

const matchTempo =
    document.getElementById("matchTempo");

const matchTempoValue =
    document.getElementById("matchTempoValue");

matchTempoValue.textContent =
    matchTempo.value;

matchTempo.addEventListener("input", () => {

    matchDifficulty =
        Number(matchTempo.value);

    matchTempoValue.textContent =
        matchTempo.value;
});

backToMenu.addEventListener("click", () => {

    fireGame.style.display = "none";

    gameMenu.style.display = "block";

});
let fireTempoMultiplier = 1;

fireTempo.addEventListener("input", () => {
    const tempo = Number(fireTempo.value);

    const multipliers = {
        1: 0.60,
        2: 0.85,
        3: 1,
        4: 1.25,
        5: 1.7
    };

    fireTempoMultiplier = multipliers[tempo];
});

const enemies = [
    {
        country: COUNTRIES.greatBritain,
        element: document.querySelector(".enemy-1"),
        x: 18,
        speed: 0.04
    },
    {
        country: COUNTRIES.france,
        element: document.querySelector(".enemy-2"),
        x: 48,
        speed: -0.03
    },
    {
        country: COUNTRIES.russianEmpire,
        element: document.querySelector(".enemy-3"),
        x: 76,
        speed: 0.05
    },
    {
        country: COUNTRIES.austriaHungary,
        element: document.querySelector(".enemy-4"),
        x: 25,
        speed: -0.035
    }
];


function moveEnemies() {
    if (fireGameOver) {
        requestAnimationFrame(moveEnemies);
        return;
    }

    enemies.forEach(enemy => {

        enemy.x += enemy.speed * fireTempoMultiplier;

        if (enemy.x <= 5 || enemy.x >= 90) {
            enemy.speed *= -1;
        }

        enemy.element.style.left = `${enemy.x}%`;

    });

    requestAnimationFrame(moveEnemies);
}


moveEnemies();
let fireBomb = null;
let fireBombActive = false;
let fireBombTimer = null;
let fireBombX = 0;
let fireBombY = 0;

function getSafeEnemyX(currentEnemy) {

    const minDistance = 18;

    for (let attempt = 0; attempt < 30; attempt++) {

        const candidate =
            10 + Math.random() * 80;

        const tooClose =
            enemies.some(enemy => {

                if (enemy === currentEnemy) {
                    return false;
                }

                if (
                    !enemy.element ||
                    enemy.element.style.display === "none"
                ) {
                    return false;
                }

                return (
                    Math.abs(enemy.x - candidate) <
                    minDistance
                );
            });

        if (!tooClose) {
            return candidate;
        }
    }

    return 10 + Math.random() * 80;
}

function dropFireBomb() {

    if (fireGameOver) {
        return false;
    }

    if (fireBombActive) {
        return false;
    }

    const bombers = enemies.filter(enemy => {

        if (!enemy.country) {
            return false;
        }

        const image =
            enemy.country.image || "";

        return (
            image.includes("france.png") ||
            image.includes("great-britain.png")
        );
    });

    if (bombers.length === 0) {
        return false;
    }

    const bomber =
        bombers[
            Math.floor(
                Math.random() * bombers.length
            )
        ];

    playFireSound("warning");    

    const warning =
        document.createElement("div");

    warning.className =
        "fire-bomb-warning";

    warning.textContent = "⚠️";

    fireField.appendChild(warning);

    const updateWarningPosition = () => {

        if (fireGameOver) {
            warning.remove();
            return;
        }

        const bomberRect =
            bomber.element.getBoundingClientRect();

        const fieldRect =
            fireField.getBoundingClientRect();

        const warningX =
            bomberRect.left +
            bomberRect.width / 2 -
            fieldRect.left;

        const warningY =
            bomberRect.top -
            fieldRect.top -
            18;

        warning.style.left =
            `${warningX}px`;

        warning.style.top =
            `${warningY}px`;
    };

    updateWarningPosition();

    setTimeout(() => {

        warning.remove();

        if (fireGameOver) {
            return;
        }

           const currentImage =
           bomber.country?.image || "";

        if (
            !currentImage.includes("france.png") &&
            !currentImage.includes("great-britain.png")
        ) {
            return;
        } 

        const bomberRect =
            bomber.element.getBoundingClientRect();

        const fieldRect =
            fireField.getBoundingClientRect();

        fireBombX =
            bomberRect.left +
            bomberRect.width / 2 -
            fieldRect.left;

        fireBombY =
            bomberRect.bottom -
            fieldRect.top;

        fireBomb =
            document.createElement("div");

        fireBomb.className =
            "fire-bomb";

        fireBomb.style.left =
            `${fireBombX}px`;

        fireBomb.style.top =
            `${fireBombY}px`;

        fireField.appendChild(
            fireBomb
        );

        fireBombActive = true;

        updateFireBomb();

        return true;

    }, 800);
}

function updateFireBomb() {

    if (!fireBombActive || !fireBomb) {
        return;
    }

    if (fireGameOver) {

        fireBomb.remove();

        fireBomb = null;
        fireBombActive = false;

        return;
    }

    fireBombY +=
        4 * fireTempoMultiplier;

    fireBomb.style.top =
        `${fireBombY}px`;

    // Перевіряємо зіткнення бомби з Німеччиною
    const bombRect =
        fireBomb.getBoundingClientRect();

    const playerRect =
        playerBall.getBoundingClientRect();

    if (
        bombRect.left < playerRect.right &&
        bombRect.right > playerRect.left &&
        bombRect.top < playerRect.bottom &&
        bombRect.bottom > playerRect.top
    ) {

        playFireSound("explosion");
        // Німеччина здригається від удару
        playerBall.classList.remove("bomb-hit-shake");

        void playerBall.offsetWidth;

        playerBall.classList.add("bomb-hit-shake");

        setTimeout(() => {
            playerBall.classList.remove("bomb-hit-shake");
        }, 500);

        fireLivesValue--;

        document.getElementById(
            "fireLives"
        ).textContent = fireLivesValue;

        hitLabel.textContent =
            "💣 Бомба! −1 ❤️";

        hitLabel.style.display =
            "block";

        const labelWidth =
            hitLabel.offsetWidth;

        const labelHeight =
            hitLabel.offsetHeight;

        hitLabel.style.left =
            `${fireField.clientWidth / 2}px`;

        hitLabel.style.top =
            `${fireField.clientHeight - labelHeight - 25}px`;

        setTimeout(() => {

            hitLabel.style.display =
                "none";

        }, 900);

        fireBomb.remove();

        fireBomb = null;
        fireBombActive = false;

        if (fireLivesValue <= 0) {

            fireLivesValue = 0;

            document.getElementById(
                "fireLives"
            ).textContent = "0";

            fireGameOver = true;

            aimLine.style.display =
                "none";

            clearTimeout(messageTimer);

            document.getElementById(
                "fireFinalScore"
            ).textContent =
                fireScoreValue;

            

            setTimeout(() => {

                document.getElementById(
                    "fireGameOver"
                ).style.display = "flex";

            }, 1800);
        }

        return;
    }

    if (
        fireBombY >
        fireField.clientHeight + 30
    ) {

        fireBomb.remove();

        fireBomb = null;
        fireBombActive = false;

        return;
    }

    requestAnimationFrame(updateFireBomb);
}

function scheduleFireBomb() {

    if (fireGameOver) {
        return;
    }

    const delay =
        4500 / fireTempoMultiplier;

    fireBombTimer =
        setTimeout(() => {

            const bombDropped =
                dropFireBomb();

            if (bombDropped) {

                scheduleFireBomb();

            } else {

                fireBombTimer =
                    setTimeout(() => {
                        scheduleFireBomb();
                    }, 1000);
            }

        }, delay);
}

scheduleFireBomb();

const playerBall = document.getElementById("playerBall");

let playerX = 50;

const playerSpeed = 0.8;

let movingLeft = false;
let movingRight = false;


function updatePlayer() {
    if (fireGameOver) {
        requestAnimationFrame(updatePlayer);
        return;
    }
    if (movingLeft) {
        playerX -= playerSpeed;
    }

    if (movingRight) {
        playerX += playerSpeed;
    }

    playerX = Math.max(7, Math.min(93, playerX));

    playerBall.style.left = `${playerX}%`;

    requestAnimationFrame(updatePlayer);

}


// Клавіатурне керування іграми
function isAnyGameScreenVisible() {
    return Array.from(
        document.querySelectorAll(".game-screen")
    ).some(
        screen => getComputedStyle(screen).display !== "none"
    );
}

function isFireGameVisible() {
    return getComputedStyle(fireGame).display !== "none";
}

document.addEventListener("keydown", event => {

    if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
    ) {
        return;
    }

    // Не блокуємо керування повзунком клавіатурою
    const isRangeInput =
        event.target instanceof HTMLInputElement &&
        event.target.type === "range";

    // Відключаємо прокручування сторінки стрілками
    // під час гри
    if (isAnyGameScreenVisible() && !isRangeInput) {
        event.preventDefault();
    }

    // Рухаємо Німеччину лише у грі «Вогонь!»
    if (!isFireGameVisible()) {
        return;
    }

    if (event.key === "ArrowLeft") {
        movingLeft = true;
    }

    if (event.key === "ArrowRight") {
        movingRight = true;
    }
});

document.addEventListener("keyup", event => {

    if (event.key === "ArrowLeft") {
        movingLeft = false;
    }

    if (event.key === "ArrowRight") {
        movingRight = false;
    }
});

// Зупиняємо рух, якщо браузер втратив фокус
window.addEventListener("blur", () => {
    movingLeft = false;
    movingRight = false;
});


document.addEventListener("keyup", (event) => {

    if (event.key === "ArrowLeft") {
        movingLeft = false;
    }

    if (event.key === "ArrowRight") {
        movingRight = false;
    }

});


updatePlayer();
const fireField = document.getElementById("fireField");
const aimLine = document.getElementById("aimLine");
const fireMessage = document.getElementById("fireMessage");
const fireScoreDisplay = document.getElementById("fireScore");
const hitLabel = document.getElementById("hitLabel");
let messageTimer;
let aimX = 0;
let aimY = 0;
let hasAim = false;


fireField.addEventListener("mousemove", (event) => {

    const fieldRect = fireField.getBoundingClientRect();

    aimX = event.clientX - fieldRect.left;
    aimY = event.clientY - fieldRect.top;

    hasAim = true;

});


function updateAim() {

    if (hasAim && !fireGameOver) {

        const fieldRect = fireField.getBoundingClientRect();

        const playerRect = playerBall.getBoundingClientRect();

        const playerCenterX =
            playerRect.left +
            playerRect.width / 2 -
            fieldRect.left;

        const playerCenterY =
            playerRect.top +
            playerRect.height / 2 -
            fieldRect.top;


        const dx = aimX - playerCenterX;
        const dy = aimY - playerCenterY;


        const angle =
            Math.atan2(dy, dx) * 180 / Math.PI;


        aimLine.style.left = `${playerCenterX}px`;
        aimLine.style.top = `${playerCenterY}px`;

        aimLine.style.transform =
            `rotate(${angle}deg)`;

        aimLine.style.display = "block";

    }

    requestAnimationFrame(updateAim);

}

updateAim();
const bullet = document.getElementById("bullet");

let bulletX = 0;
let bulletY = 0;

let bulletDX = 0;
let bulletDY = 0;

let bulletActive = false;


fireField.addEventListener("click", () => {
    if (fireGameOver) return;
    if (bulletActive) return;
    
    const fieldRect = fireField.getBoundingClientRect();
    const playerRect = playerBall.getBoundingClientRect();

    bulletX =
        playerRect.left +
        playerRect.width / 2 -
        fieldRect.left;

    bulletY =
        playerRect.top +
        playerRect.height / 2 -
        fieldRect.top;

    const dx = aimX - bulletX;
    const dy = aimY - bulletY;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) 
        return;
    
    bulletDX = dx / distance;
    bulletDY = dy / distance;

    playFireSound("shot");

    bulletActive = true;

    bullet.style.display = "block";

});


function updateBullet() {
     if (fireGameOver) {
        bulletActive = false;
        bullet.style.display = "none";
        requestAnimationFrame(updateBullet);
        return;
    }
    if (bulletActive) {

        bulletX += bulletDX * 10 * fireTempoMultiplier;
        bulletY += bulletDY * 10 * fireTempoMultiplier;


        bullet.style.left =
            `${bulletX - 6}px`;

        bullet.style.top =
            `${bulletY - 6}px`;

        enemies.forEach(enemy => {

            if (!enemy.element) {
                return;
            }
            if (!bulletActive) {
                return;
            }

            const enemyRect =
                enemy.element.getBoundingClientRect();

            const fieldRect =
                fireField.getBoundingClientRect();


            const enemyX =
                enemyRect.left +
                enemyRect.width / 2 -
                fieldRect.left;

            const enemyY =
                enemyRect.top +
                enemyRect.height / 2 -
                fieldRect.top;


            const distance =
                Math.sqrt(
                    (bulletX - enemyX) ** 2 +
                    (bulletY - enemyY) ** 2
                );

            if (distance < 45) {

                console.log(
                    "ПОПАДАННЯ:",
                    enemy.country.name
                );

                if (enemy.country.bloc === "entente") {

                    fireScoreValue += 20;
                    fireScoreDisplay.textContent = fireScoreValue;

                    fireMessage.classList.remove(
                        "hit-success",
                        "hit-neutral"
                    );

                    fireMessage.classList.add("hit-success");

                    fireMessage.textContent = "🎯 Влучно!";

                    playFireSound("hit");

                    hitLabel.classList.remove(
                        "hit-entente",
                        "hit-neutral"
                    );

                    hitLabel.classList.add("hit-entente");

                    hitLabel.textContent =
                        `💥 ${enemy.country.name} +20`;

                    hitLabel.style.display = "block";

                    const labelWidth = hitLabel.offsetWidth;
                    const labelHeight = hitLabel.offsetHeight;

                    const halfWidth = labelWidth / 2;
                    const halfHeight = labelHeight / 2;

                    const labelX = Math.max(
                        halfWidth + 10,
                        Math.min(
                            fireField.clientWidth - halfWidth - 10,
                            enemyX
                        )
                    );

                    const labelY = Math.max(
                        70,
                        Math.min(
                            fireField.clientHeight - halfHeight - 10,
                            enemyY
                        )
                    );

                    hitLabel.style.left = `${labelX}px`;
                    hitLabel.style.top = `${labelY}px`;

                    setTimeout(() => {
                        hitLabel.style.display = "none";
                    }, 900);

                }
                else if (enemy.country.bloc === "central") {

    fireScoreValue -= 10;
    fireScoreDisplay.textContent =
        fireScoreValue;

    fireLivesValue -= 1;

    document.getElementById(
        "fireLives"
    ).textContent = fireLivesValue;

    hitLabel.textContent =
        "😈 Ні-ні! Це твій союзник! −1 ❤️";

    playFireSound("ally");    

    hitLabel.classList.remove(
        "warning-hit-label"
    );

    void hitLabel.offsetWidth;

    hitLabel.classList.add(
        "warning-hit-label"
    );

    hitLabel.style.display = "block";

    const labelWidth =
        hitLabel.offsetWidth;

    const labelHeight =
        hitLabel.offsetHeight;

    const halfWidth =
        labelWidth / 2;

    const halfHeight =
        labelHeight / 2;

    hitLabel.style.left =
        `${fireField.clientWidth / 2}px`;

    hitLabel.style.top =
        `${fireField.clientHeight - halfHeight - 25}px`;

    setTimeout(() => {

        hitLabel.classList.remove(
            "warning-hit-label"
        );

        hitLabel.style.display = "none";

    }, 900);


    if (fireLivesValue <= 0) {

        fireLivesValue = 0;

        document.getElementById(
            "fireLives"
        ).textContent = "0";

        fireGameOver = true;

        aimLine.style.display = "none";

        clearTimeout(messageTimer);

        document.getElementById(
            "fireFinalScore"
        ).textContent = fireScoreValue;

        setTimeout(() => {

            document.getElementById(
                "fireGameOver"
            ).style.display = "flex";

        }, 1800);
    }
}
            
                else {

                    fireScoreValue -= 5;
                    fireScoreDisplay.textContent = fireScoreValue;

                    fireMessage.classList.remove(
                        "hit-success",
                        "hit-neutral"
                    );

                    fireMessage.classList.add("hit-neutral");

                    fireMessage.textContent =
                        "😔 Обережно! Це нейтральна країна!";
                    playFireSound("neutral");
                    
                    hitLabel.classList.remove(
                        "hit-entente",
                        "hit-neutral"
                    );

                    hitLabel.classList.add("hit-neutral");
                        hitLabel.textContent =
                        `😔 ${enemy.country.name} −5`;

                    hitLabel.style.display = "block";

                    const labelWidth = hitLabel.offsetWidth;
                    const labelHeight = hitLabel.offsetHeight;

                    const halfWidth = labelWidth / 2;
                    const halfHeight = labelHeight / 2;

                    const labelX = Math.max(
                        halfWidth + 10,
                        Math.min(
                            fireField.clientWidth - halfWidth - 10,
                            enemyX
                        )
                    );

                    const labelY = Math.max(
                        70,
                        Math.min(
                            fireField.clientHeight - halfHeight - 10,
                            enemyY
                        )
                    );

                    hitLabel.style.left = `${labelX}px`;
                    hitLabel.style.top = `${labelY}px`;

                    setTimeout(() => {
                        hitLabel.style.display = "none";
                    }, 900);
                }

                if (!fireGameOver) {

                    clearTimeout(messageTimer);

                    messageTimer = setTimeout(() => {

                        fireMessage.classList.remove(
                            "hit-success",
                            "hit-neutral"
                        );

                        fireMessage.textContent = "Влучай у противників!";
                    }, 1500);
                }

                enemy.element.style.display = "none";
                bulletActive = false;
                bullet.style.display = "none";

                const respawnDelay =
                    700 / fireTempoMultiplier;

                setTimeout(() => {

                    if (fireGameOver) {
                        return;
                    }

                    const newCountry = getRandomCountry(enemy);
                    setEnemyCountry(enemy, newCountry);

                    enemy.x =
                        getSafeEnemyX(enemy);

                    enemy.element.style.left =
                        `${enemy.x}%`;
                    enemy.element.style.display = "block";

                }, respawnDelay);
                            }
        
        if (
            bulletX < -20 ||
            bulletX > fireField.clientWidth + 20 ||
            bulletY < -20 ||
            bulletY > fireField.clientHeight + 20
        ) {
            bulletActive = false;
            bullet.style.display = "none";
        }

    });

    }

    requestAnimationFrame(updateBullet);
}

updateBullet();

function updateGameSoundButtons() {

    document.querySelectorAll(
        ".game-sound-toggle"
    ).forEach(button => {

        button.textContent =
            gameSoundMuted ? "🔇 Звук" : "🔊 Звук";

        button.title =
            gameSoundMuted
                ? "Увімкнути звук"
                : "Вимкнути звук";

        button.setAttribute(
            "aria-pressed",
            String(!gameSoundMuted)
        );
    });
}

document.querySelectorAll(
    ".game-sound-toggle"
).forEach(button => {

    button.addEventListener("click", event => {

        event.stopPropagation();

        gameSoundMuted = !gameSoundMuted;

        updateGameSoundButtons();
    });
});

updateGameSoundButtons();

// ================================
// ГРА 3 — РОЗСОРТУЙ!
// Стартовий екран і вибір складності
// ================================

let sortDifficulty = 3;

const sortCard =
    document.querySelector(".menu-game-card.sort-card");

const sortGame =
    document.getElementById("sortGame");

const sortStartOverlay =
    document.getElementById("sortStartOverlay");

const sortStartLevelLabel =
    document.getElementById("sortStartLevelLabel");

const sortDifficultyNames = {
    1: "Рівень 1 — дуже легко",
    2: "Рівень 2 — легко",
    3: "Рівень 3 — середній",
    4: "Рівень 4 — складно",
    5: "Рівень 5 — дуже складно"
};

function updateSortDifficultyDisplay() {

    const slider =
        document.getElementById("sortTempo");

    const levelLabel =
        document.getElementById("sortCurrentLevel");

    if (slider) {
        slider.value = String(sortDifficulty);
    }

    if (levelLabel) {
        levelLabel.textContent = String(sortDifficulty);
    }
}

// Показуємо стартовий екран після натискання картки
if (sortCard) {

    sortCard.addEventListener("click", () => {

        gameMenu.style.display = "none";
        resetCountryReferencePanels();

        fireGame.style.display = "none";
        fireGameOverScreen.style.display = "none";
        matchGame.style.display = "none";

        sortGame.style.display = "block";

        // Показуємо стартову картку
        sortStartOverlay.style.display = "flex";

        // Відновлюємо вибраний рівень
        document.querySelectorAll(
            ".sort-difficulty-button"
        ).forEach(button => {

            button.classList.toggle(
                "selected",
                Number(button.dataset.sortDifficulty) === sortDifficulty
            );

        });

        sortStartLevelLabel.textContent =
            sortDifficultyNames[sortDifficulty];

        updateSortDifficultyDisplay();

    });

}


// Вибір рівня складності
document.querySelectorAll(
    ".sort-difficulty-button"
).forEach(button => {

    button.addEventListener("click", event => {

        event.stopPropagation();

        sortDifficulty =
            Number(button.dataset.sortDifficulty);

        document.querySelectorAll(
            ".sort-difficulty-button"
        ).forEach(item => {

            item.classList.toggle(
                "selected",
                item === button
            );

        });

        sortStartLevelLabel.textContent =
            sortDifficultyNames[sortDifficulty];

        updateSortDifficultyDisplay();

    });

});


// Повернення до меню
function returnFromSortGame() {

    sortStartOverlay.style.display = "none";
    sortGame.style.display = "none";

    gameMenu.style.display = "block";

}


// Кнопка «До всіх ігор» на стартовому екрані
document.getElementById(
    "sortStartBackButton"
).addEventListener("click", event => {

    event.stopPropagation();

    returnFromSortGame();

});


// Кнопка «Меню» у верхній панелі
document.getElementById(
    "sortBackToMenu"
).addEventListener("click", event => {

    event.stopPropagation();

    returnFromSortGame();

});

// =======================================
// ГРА 3 — РОЗСОРТУЙ!
// Створення початкової розкладки
// =======================================

let sortStacks = [];
// Історія перемішування та відомий шлях розв'язання
let sortGeneratedScrambleHistory = [];
let sortSolutionMoves = [];
let sortSolutionStep = 0;
let sortSolutionPathValid = false;

let sortBallsRemaining = 0;
let sortBranchCapacity = 3;
let sortExtraBranchesUsed = 0;
let sortGameStarted = false;
let sortBoardBusy = false;
let sortSelectedBranchIndex = null;
let sortLastDestinationIndex = null;
let sortLastDestinationType = null;
let sortDestinationHighlightTimer = null;
let sortBallSerial = 0;
let sortHints = 3;
let sortHintTimer = null;


// Параметри п'яти рівнів
const sortLevelConfigs = {
    1: {
        capacity: 3,
        counts: {
            central: 3,
            entente: 3,
            neutral: 3
        },
        emptyBranches: 2,
        scrambleMoves: 10
    },

    2: {
        capacity: 3,
        counts: {
            central: 3,
            entente: 3,
            neutral: 3
        },
        emptyBranches: 1,
        scrambleMoves: 22
    },

    3: {
        capacity: 4,
        counts: {
            central: 4,
            entente: 8,
            neutral: 4
        },
        emptyBranches: 2,
        scrambleMoves: 50
    },

    4: {
        capacity: 4,
        counts: {
            central: 4,
            entente: 8,
            neutral: 4
        },
        emptyBranches: 1,
        scrambleMoves: 80
    },

    5: {
        capacity: 5,
        counts: {
            central: 5,
            entente: 10,
            neutral: 5
        },
        emptyBranches: 1,
        scrambleMoves: 120
    }
};


// Перемішування масиву
function shuffleSortArray(array) {

    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [result[i], result[j]] =
            [result[j], result[i]];
    }

    return result;
}


// Створення кульок певного табору
function createSortBalls(bloc, count) {

    const countryPool = shuffleSortArray(
        Object.values(COUNTRIES).filter(
            country => country.bloc === bloc
        )
    );

    if (countryPool.length === 0) {
        throw new Error(
            `Не знайдено країн для табору: ${bloc}`
        );
    }

    const balls = [];

    for (let i = 0; i < count; i++) {

        const country =
            countryPool[i % countryPool.length];

        balls.push({
            id: ++sortBallSerial,
            name: country.name,
            bloc: country.bloc,
            image: country.image
        });
    }

    return balls;
}


// Перевіряємо, чи гілка заповнена
// кульками одного табору
function isSortBranchComplete(branch, capacity) {

    return (
        branch.length === capacity &&
        branch.every(
            ball => ball.bloc === branch[0].bloc
        )
    );
}


// Створюємо початкову розкладку,
// де гілки спочатку заповнені за таборами
function createSortedSortStacks(config) {

    const stacks = [];

    for (const [bloc, count] of Object.entries(
        config.counts
    )) {

        const balls = shuffleSortArray(
            createSortBalls(bloc, count)
        );

        for (
            let i = 0;
            i < balls.length;
            i += config.capacity
        ) {

            stacks.push(
                balls.slice(
                    i,
                    i + config.capacity
                )
            );
        }
    }

    for (
        let i = 0;
        i < config.emptyBranches;
        i++
    ) {
        stacks.push([]);
    }

    return shuffleSortArray(stacks);
}


// Знаходимо переміщення для контрольованого
// перемішування початкової розкладки
function getReverseSortMoves(stacks, capacity) {

    const moves = [];

    for (let from = 0; from < stacks.length; from++) {

        const source = stacks[from];

        if (source.length === 0) {
            continue;
        }

        const topBloc =
            source[source.length - 1].bloc;

        // Кількість однакових таборів зверху
        let topRun = 1;

        for (
            let i = source.length - 2;
            i >= 0;
            i--
        ) {

            if (source[i].bloc !== topBloc) {
                break;
            }

            topRun++;
        }

        for (
            let count = 1;
            count <= Math.min(topRun, capacity, 2);
            count++
        ) {

            const remainingLength =
                source.length - count;

            // Після переміщення джерело має бути
            // порожнім або з тією самою кулькою зверху
            if (
                remainingLength > 0 &&
                source[remainingLength - 1].bloc !== topBloc
            ) {
                continue;
            }

            for (
                let to = 0;
                to < stacks.length;
                to++
            ) {

                if (from === to) {
                    continue;
                }

                const destination = stacks[to];

                const freeSpace =
                    capacity - destination.length;

                if (freeSpace < count) {
                    continue;
                }

                const destinationTop =
                    destination.length > 0
                        ? destination[
                            destination.length - 1
                        ].bloc
                        : null;

                // Для перемішування беремо інший табір
                // або порожню гілку
                if (destinationTop === topBloc) {
                    continue;
                }

                // Не створюємо готову гілку під час
                // формування початкової розкладки
                if (
                    destination.length === 0 &&
                    count === capacity
                ) {
                    continue;
                }

                moves.push({
                    from,
                    to,
                    count
                });
            }
        }
    }

    return moves;
}

// Рахуємо однакові кульки на внутрішньому кінці гілки
function getSortTopRunLength(stack) {

    if (!stack || stack.length === 0) {
        return 0;
    }

    const topBloc = stack[stack.length - 1].bloc;

    let count = 0;

    for (let i = stack.length - 1; i >= 0; i--) {

        if (stack[i].bloc !== topBloc) {
            break;
        }

        count++;
    }

    return count;
}

// Перемішуємо розкладку, не створюючи груп із 3+ кульок
function scrambleSortStacks(stacks, capacity, ballCount, scrambleMoves) {

    sortGeneratedScrambleHistory = [];
    const maxBreakSteps = ballCount * 25 + 100;

    let guard = 0;

    // Спочатку розбиваємо всі надто великі групи
    while (
        hasTooEasySortGroup(stacks, capacity) &&
        guard < maxBreakSteps
    ) {

        const allMoves =
            getReverseSortMoves(stacks, capacity);

        // Не використовуємо як ціль гілки,
        // де вже є група з 3+ однакових таборів
        const safeMoves = allMoves.filter(move => {

            return !hasTooEasySortGroup(
                [stacks[move.to]],
                capacity
            );
        });

        if (safeMoves.length === 0) {
            break;
        }

        // Поки великі групи ще є, спочатку розбиваємо їх
        const movesFromLargeGroups = safeMoves.filter(
            move =>
                getSortTopRunLength(stacks[move.from]) >= 3
        );

        const candidates =
            movesFromLargeGroups.length > 0
                ? movesFromLargeGroups
                : safeMoves;

        // Віддаємо перевагу переміщенню двох кульок,
        // якщо це дозволено і є достатньо вільного місця
        const maxMoveCount = Math.max(
            ...candidates.map(move => move.count)
        );

        const bestCandidates = candidates.filter(
            move => move.count === maxMoveCount
        );

        const move = bestCandidates[
            Math.floor(
                Math.random() * bestCandidates.length
            )
        ];

        sortGeneratedScrambleHistory.push({
            from: move.from,
            to: move.to,
            count: move.count
        });

        sortGeneratedScrambleHistory.push({
            from: move.from,
            to: move.to,
            count: move.count
        });

        const group = stacks[move.from].splice(
            stacks[move.from].length - move.count,
            move.count
        );

        stacks[move.to].push(...group);

        guard++;
    }

    // Якщо великі групи не вдалося розбити,
    // повертаємо невідповідну розкладку — генератор її відхилить
    if (hasTooEasySortGroup(stacks, capacity)) {
        return stacks;
    }

    // Додатково перемішуємо вже допустиму розкладку.
    // Кожен хід має зберігати умову: не більше двох
    // однакових таборів поспіль на кожній гілці.
    for (
        let step = 0;
        step < scrambleMoves;
        step++
    ) {

        const allMoves =
            getReverseSortMoves(stacks, capacity);

        const safeMoves = allMoves.filter(move => {

            return !hasTooEasySortGroup(
                [stacks[move.to]],
                capacity
            );
        });

        if (safeMoves.length === 0) {
            break;
        }

        const move = safeMoves[
            Math.floor(
                Math.random() * safeMoves.length
            )
        ];

        sortGeneratedScrambleHistory.push({
            from: move.from,
            to: move.to,
            count: move.count
        });

        sortGeneratedScrambleHistory.push({
            from: move.from,
            to: move.to,
            count: move.count
        });

        const group = stacks[move.from].splice(
            stacks[move.from].length - move.count,
            move.count
        );

        stacks[move.to].push(...group);
    }

    return stacks;
}

// Оцінюємо, наскільки впорядкована розкладка
// Оцінюємо, наскільки розкладка вже готова до очищення
// Оцінюємо, наскільки початкова розкладка вже впорядкована
function getSortPuzzleScore(stacks, capacity) {

    let score = 0;

    for (const stack of stacks) {

        // Великий штраф за повністю готову гілку
        if (
            stack.length === capacity &&
            stack.length > 0 &&
            stack.every(ball => ball.bloc === stack[0].bloc)
        ) {
            score += 100000;
        }

        let i = 0;

        while (i < stack.length) {

            let end = i + 1;

            while (
                end < stack.length &&
                stack[end].bloc === stack[i].bloc
            ) {
                end++;
            }

            const runLength = end - i;

            // На рівнях із місткістю 3 навіть пара
            // вже близька до очищення гілки
            if (capacity === 3 && runLength >= 2) {
                score += 20000 + runLength * 1000;
            }

            // Для місткості 4 і 5 групи від трьох
            // кульок роблять розкладку надто зручною
            else if (capacity >= 4 && runLength >= 3) {

                if (runLength >= capacity - 1) {
                    score += 20000 + runLength * 2000;
                } else {
                    score += 10000 + runLength * 1000;
                }
            }

            // Невеликі групи теж небажані,
            // але меншою мірою
            else if (runLength === 2) {
                score += 100;
            }

            i = end;
        }
    }

    return score;
}

// Чи містить розкладка надто готові групи?
// На початку гри не допускаємо трьох
// або більше сусідніх кульок одного табору
function hasTooEasySortGroup(stacks, capacity) {

    for (const stack of stacks) {

        let previousBloc = null;
        let runLength = 0;

        for (const ball of stack) {

            if (ball.bloc === previousBloc) {
                runLength++;
            } else {
                previousBloc = ball.bloc;
                runLength = 1;
            }

            if (runLength >= 3) {
                return true;
            }
        }
    }

    return false;
}

// Генеруємо розкладку та зберігаємо шлях до перемоги
function generateSortPuzzle() {

    const config = sortLevelConfigs[sortDifficulty];

    if (!config) {
        console.error(
            "Не знайдено налаштувань вибраного рівня."
        );
        return null;
    }

    sortBranchCapacity = config.capacity;

    const ballCount =
        Object.values(config.counts).reduce(
            (sum, count) => sum + count,
            0
        );

    let acceptableStacks = null;
    let acceptableScore = Infinity;
    let acceptableScrambleHistory = null;

    const attempts = 2000;

    for (
        let attempt = 0;
        attempt < attempts;
        attempt++
    ) {

        const initialStacks =
            createSortedSortStacks(config);

        const candidateStacks =
            scrambleSortStacks(
                initialStacks,
                sortBranchCapacity,
                ballCount,
                config.scrambleMoves
            );

        // Відхиляємо розкладки з групами по 3+ кульки
        if (
            !candidateStacks ||
            hasTooEasySortGroup(
                candidateStacks,
                sortBranchCapacity
            )
        ) {
            continue;
        }

        const candidateScore =
            getSortPuzzleScore(
                candidateStacks,
                sortBranchCapacity
            );

        if (candidateScore < acceptableScore) {

            acceptableScore = candidateScore;

            acceptableStacks = candidateStacks.map(
                stack => [...stack]
            );

            // Запам'ятовуємо історію саме цієї розкладки
            acceptableScrambleHistory =
                sortGeneratedScrambleHistory.map(
                    move => ({ ...move })
                );
        }

        if (candidateScore === 0) {
            break;
        }
    }

    // Не запускаємо розкладку, що порушує правила
    if (!acceptableStacks || !acceptableScrambleHistory) {

        console.error(
            "Не вдалося створити придатну розкладку. Спробуй запустити рівень ще раз."
        );

        sortStacks = null;
        sortSolutionMoves = [];
        sortSolutionStep = 0;
        sortSolutionPathValid = false;

        return null;
    }

    sortStacks = acceptableStacks;

    // Зберігаємо історію обраної розкладки
    sortGeneratedScrambleHistory =
        acceptableScrambleHistory;

    // Відновлюємо перемішування у зворотному порядку.
    // Так отримуємо відомий шлях до розсортованого стану.
    sortSolutionMoves =
        [...acceptableScrambleHistory]
            .reverse()
            .map(move => ({
                from: move.to,
                to: move.from,
                count: move.count
            }));

    sortSolutionStep = 0;
    sortSolutionPathValid = true;

    return sortStacks;
}

// Відображаємо кульки на гілках
function renderSortBoard() {

    sortBoard.innerHTML = "";
    sortBoard.classList.toggle(
        "sort-level-five",
        sortDifficulty === 5
);

    const isNarrowScreen =
        window.matchMedia("(max-width: 650px)").matches;

    const ballSize = isNarrowScreen
        ? Math.min(48, Math.max(30, window.innerWidth * 0.09))
        : 76;

    // Якщо джерело вибране, визначаємо табір
    // і межу групи, яку можна переміщувати
    const sourceStack =
        sortSelectedBranchIndex !== null
            ? sortStacks[sortSelectedBranchIndex]
            : null;

    let selectedBloc = null;
    let selectedGroupStart = -1;

    if (sourceStack && sourceStack.length > 0) {

        selectedBloc =
            sourceStack[sourceStack.length - 1].bloc;

        selectedGroupStart = sourceStack.length - 1;

        while (
            selectedGroupStart > 0 &&
            sourceStack[selectedGroupStart - 1].bloc === selectedBloc
        ) {
            selectedGroupStart--;
        }
    }

    sortStacks.forEach((stack, index) => {

        const isLeft = index % 2 === 0;

        const branch = document.createElement("div");

        branch.className = "sort-branch";

        branch.classList.add(
            isLeft ? "sort-branch-left" : "sort-branch-right"
        );

        branch.dataset.branchIndex = index;

        branch.style.width =
            `${sortBranchCapacity * ballSize}px`;

        branch.style.justifySelf =
            isLeft ? "end" : "start";

        branch.setAttribute("role", "button");
        branch.setAttribute("tabindex", "0");

        branch.setAttribute(
            "aria-label",
            `Гілка ${index + 1}: ${stack.length} із ${sortBranchCapacity} кульок`
        );

        branch.title =
            `Гілка ${index + 1}: ${stack.length}/${sortBranchCapacity} кульок`;

        if (index === sortSelectedBranchIndex) {
            branch.classList.add("source-selected");
        }

        if (index === sortLastDestinationIndex) {

            branch.classList.add(
                sortLastDestinationType === "invalid"
                    ? "sort-last-target-invalid"
                    : "sort-last-target"
            );
        }

        
        // Масив зберігається знизу догори.
        // Останній елемент — на внутрішньому кінці гілки.
        stack.forEach((ball, ballIndex) => {

            const ballElement =
                document.createElement("div");

            ballElement.className = "sort-ball";

            ballElement.dataset.ballId = ball.id;
            ballElement.title = ball.name;

            const image =
                document.createElement("img");

            image.src = ball.image;
            image.alt = ball.name;
            image.draggable = false;

            ballElement.appendChild(image);

            // Виділяємо всю верхню групу одного табору
            if (
                index === sortSelectedBranchIndex &&
                ballIndex >= selectedGroupStart
            ) {
                ballElement.classList.add("selected");
            }

            if (
                index === sortLastDestinationIndex &&
                ballIndex === stack.length - 1
            ) {

                ballElement.classList.add(
                    sortLastDestinationType === "invalid"
                        ? "sort-last-target-ball-invalid"
                        : "sort-last-target-ball"
                );
            }

            // На цільовій гілці підсвічуємо
            // саме внутрішню кульку
            
            branch.appendChild(ballElement);
        });

        // Лічильник більше не займає місце на самій гілці
        const countLabel = document.createElement("span");

        countLabel.className = "sort-branch-count";

        countLabel.textContent =
            `${stack.length}/${sortBranchCapacity}`;

        branch.appendChild(countLabel);

        sortBoard.appendChild(branch);
    });
}

function showSortDestinationHighlight(
    branchIndex,
    type = "valid"
) {

    clearTimeout(sortDestinationHighlightTimer);

    sortLastDestinationIndex = branchIndex;
    sortLastDestinationType = type;

    renderSortBoard();

    sortDestinationHighlightTimer = setTimeout(() => {

        sortLastDestinationIndex = null;
        sortLastDestinationType = null;
        sortDestinationHighlightTimer = null;

        if (sortGameStarted) {
            renderSortBoard();
        }

    }, 800);
}

// =======================================
// РОЗСОРТУЙ! — ПІДКАЗКИ
// =======================================

function clearSortHintHighlight() {

    if (sortHintTimer !== null) {
        clearTimeout(sortHintTimer);
        sortHintTimer = null;
    }

    sortBoard.querySelectorAll(
        ".sort-hint-move, .sort-hint-target, .sort-hint-destination"
    ).forEach(element => {

        element.classList.remove(
            "sort-hint-move",
            "sort-hint-target",
            "sort-hint-destination"
        );
    });
}


function updateSortHintButton() {

    const button =
        document.getElementById("sortHintButton");

    const count =
        document.getElementById("sortHints");

    if (!button || !count) {
        return;
    }

    count.textContent = sortHints;

    button.disabled =
        !sortGameStarted ||
        sortBoardBusy ||
        sortHints <= 0;

    button.title = sortHints > 0
        ? "Показати підказку"
        : "Підказки закінчилися";
}


// Знаходимо дозволене переміщення.
// Спочатку віддаємо перевагу ходу,
// який очищує гілку або об'єднує однакові табори.
function findSortHintMove() {

    const candidates = [];

    for (
        let from = 0;
        from < sortStacks.length;
        from++
    ) {

        const source = sortStacks[from];

        if (source.length === 0) {
            continue;
        }

        const topBall =
            source[source.length - 1];

        // Рахуємо послідовну групу одного табору
        // на внутрішньому кінці гілки
        let groupCount = 1;

        for (
            let i = source.length - 2;
            i >= 0;
            i--
        ) {

            if (source[i].bloc !== topBall.bloc) {
                break;
            }

            groupCount++;
        }

        for (
            let to = 0;
            to < sortStacks.length;
            to++
        ) {

            if (from === to) {
                continue;
            }

            const destination = sortStacks[to];

            const freeSpace =
                sortBranchCapacity - destination.length;

            if (freeSpace <= 0) {
                continue;
            }

            const destinationTop =
                destination.length > 0
                    ? destination[destination.length - 1]
                    : null;

            // Дозволено лише до порожньої гілки
            // або до групи того самого табору
            if (
                destinationTop &&
                destinationTop.bloc !== topBall.bloc
            ) {
                continue;
            }

            const moveCount =
                Math.min(groupCount, freeSpace);

            const willClearBranch =
                destination.length + moveCount ===
                sortBranchCapacity;

            const mergesBlocs =
                destination.length > 0;

            let priority = 2;

            if (willClearBranch) {
                priority = 0;
            } else if (mergesBlocs) {
                priority = 1;
            }

            candidates.push({
                from,
                to,
                moveCount,
                priority
            });
        }
    }

    if (candidates.length === 0) {
        return null;
    }

    candidates.sort(
        (a, b) => a.priority - b.priority
    );

    const bestPriority = candidates[0].priority;

    const bestMoves = candidates.filter(
        move => move.priority === bestPriority
    );

    return bestMoves[
        Math.floor(Math.random() * bestMoves.length)
    ];
}


function useSortHint() {

    if (
        !sortGameStarted ||
        sortBoardBusy ||
        sortHints <= 0
    ) {
        return;
    }

    clearSortHintHighlight();

    const move = findSortHintMove();

    if (!move) {

        document.getElementById(
            "sortStatusMessage"
        ).textContent =
            "Зараз не знайдено дозволеного переміщення.";

        return;
    }

    const source = sortStacks[move.from];
    const destination = sortStacks[move.to];

    const sourceTop =
        source[source.length - 1];

    const movedBalls = source.slice(
        source.length - move.moveCount
    );

    // Помаранчевим підсвічуємо групу,
    // яку потрібно перемістити
    movedBalls.forEach(ball => {

        const ballElement = sortBoard.querySelector(
            `.sort-ball[data-ball-id="${ball.id}"]`
        );

        if (ballElement) {
            ballElement.classList.add("sort-hint-move");
        }
    });

    const destinationBranch = sortBoard.querySelector(
        `.sort-branch[data-branch-index="${move.to}"]`
    );

    // Синім позначаємо місце призначення
    if (destination.length > 0) {

        const destinationTop =
            destination[destination.length - 1];

        const targetBall = sortBoard.querySelector(
            `.sort-ball[data-ball-id="${destinationTop.id}"]`
        );

        targetBall?.classList.add("sort-hint-target");

    } else {

        destinationBranch?.classList.add(
            "sort-hint-destination"
        );
    }

    const blocNames = {
        entente: "Антанти",
        central: "Центральних держав",
        neutral: "нейтральних країн"
    };

    const description =
        move.moveCount === 1
            ? sourceTop.name
            : `групу з ${move.moveCount} кульок табору ${blocNames[sourceTop.bloc]}`;

    document.getElementById(
        "sortStatusMessage"
    ).textContent =
        `Підказка: перемісти ${description} з гілки ${move.from + 1} на гілку ${move.to + 1}.`;

    sortHints--;

    updateSortHintButton();

    // Прибираємо підсвічування через 3 секунди
    sortHintTimer = setTimeout(() => {

        clearSortHintHighlight();

    }, 3000);
}


// Підключаємо кнопку
document.getElementById(
    "sortHintButton"
).addEventListener("click", event => {

    event.stopPropagation();

    useSortHint();
});

updateSortHintButton();

// =======================================
// РОЗСОРТУЙ! — ВИБІР І ПЕРЕМІЩЕННЯ
// =======================================

sortBoard.addEventListener("click", event => {

    if (!sortGameStarted || sortBoardBusy) {
        return;
    }

    const branchElement =
        event.target.closest(".sort-branch");

    if (
        !branchElement ||
        !sortBoard.contains(branchElement)
    ) {
        return;
    }

    clearSortHintHighlight();

    const clickedBallElement =
        event.target.closest(".sort-ball");

    const branchIndex =
        Number(branchElement.dataset.branchIndex);

    const stack = sortStacks[branchIndex];

    if (!stack) {
        return;
    }

    const statusMessage =
        document.getElementById("sortStatusMessage");

    // Перше натискання — вибір кульки-джерела
    if (sortSelectedBranchIndex === null) {

        if (stack.length === 0) {

            statusMessage.textContent =
                "Обери кульку на гілці, з якої хочеш почати.";

            return;
        }

        const innerBall =
            stack[stack.length - 1];

        // Вибираємо лише кульку на внутрішньому кінці
        
        sortSelectedBranchIndex = branchIndex;

        let groupCount = 1;

        for (
            let i = stack.length - 2;
            i >= 0;
            i--
        ) {

            if (stack[i].bloc !== innerBall.bloc) {
                break;
            }

            groupCount++;
        }

        renderSortBoard();

        statusMessage.textContent =
            groupCount > 1
                ? `Обрано групу з ${groupCount} кульок. Натисни на потрібну гілку або кульку на ній.`
                : `Обрано: ${innerBall.name}. Натисни на потрібну гілку або кульку на ній.`;

        return;
    }

    const sourceIndex = sortSelectedBranchIndex;

    const source = sortStacks[sourceIndex];

    // Повторне натискання на джерело скасовує вибір
    if (sourceIndex === branchIndex) {

        sortSelectedBranchIndex = null;

        renderSortBoard();

        statusMessage.textContent =
            "Вибір скасовано. Обери іншу кульку.";

        return;
    }

    if (!source || source.length === 0) {

        sortSelectedBranchIndex = null;
        renderSortBoard();

        statusMessage.textContent =
            "Обери кульку на гілці, з якої хочеш почати.";

        return;
    }

    const sourceTop =
        source[source.length - 1];

       
    // Перевіряємо табір цілі
    const destinationTop =
        stack.length > 0
            ? stack[stack.length - 1]
            : null;

    if (
        destinationTop &&
        destinationTop.bloc !== sourceTop.bloc
    ) {

        renderSortBoard();

        playSortSound("invalid");
        statusMessage.textContent =
            "Сюди не можна перемістити цю групу: потрібна порожня гілка або гілка того самого табору.";

        return;
    }

    const freeSpace =
        sortBranchCapacity - stack.length;

    if (freeSpace <= 0) {

        statusMessage.textContent =
            "Ця гілка повна. Обери іншу.";

        return;
    }

    // Рахуємо послідовну верхню групу одного табору
    let groupCount = 1;

    for (
        let i = source.length - 2;
        i >= 0;
        i--
    ) {

        if (source[i].bloc !== sourceTop.bloc) {
            break;
        }

        groupCount++;
    }

    // Якщо місця мало, переносимо стільки кульок,
    // скільки може вмістити гілка
    const moveCount =
        Math.min(groupCount, freeSpace);

    const movingBalls = source.splice(
        source.length - moveCount,
        moveCount
    );

    stack.push(...movingBalls);

    sortSelectedBranchIndex = null;

    // Рахуємо один успішний хід
    const movesElement =
        document.getElementById("sortMoves");

    movesElement.textContent =
        String(Number(movesElement.textContent) + 1);

    const blocNames = {
        entente: "Антанти",
        central: "Центральних держав",
        neutral: "нейтральних країн"
    };

    // Чи заповнилася цільова гілка одним табором?
    const branchCleared =
        isSortBranchComplete(
            stack,
            sortBranchCapacity
        );
    if (branchCleared) {
        playSortSound("clear");
    } else {
        playSortSound("move");
    }

    if (branchCleared) {

        sortBallsRemaining -= sortBranchCapacity;

        // Блокуємо інші ходи на час анімації
        sortBoardBusy = true;
        updateSortHintButton();

        // Не очищуємо дані завчасно:
        // спочатку гравець має побачити політ кульок
        renderSortBoard();

        const clearingBranch =
            sortBoard.querySelector(
                `.sort-branch[data-branch-index="${branchIndex}"]`
            );

        if (clearingBranch) {

            clearingBranch.classList.add(
                "sort-branch-clearing"
            );

            const clearingBalls =
                clearingBranch.querySelectorAll(".sort-ball");

            clearingBalls.forEach((ballElement, i) => {

                ballElement.classList.add("clearing");

                ballElement.style.setProperty(
                    "--fly-delay",
                    `${i * 0.07}s`
                );
            });
        }

        statusMessage.textContent =
            `Гілку заповнено кульками ${blocNames[sourceTop.bloc]}. Countryballs відлітають!`;

        updateSortBranchHelpButton();

        // Чекаємо завершення анімації
        setTimeout(() => {

            stack.length = 0;

            sortBoardBusy = false;
            updateSortHintButton();

            renderSortBoard();

            // Перевіряємо завершення всієї партії
            if (sortBallsRemaining <= 0) {

                sortGameStarted = false;

                statusMessage.textContent =
                    "Перемогу здобуто!";

                document.getElementById(
                    "sortVictoryText"
                ).innerHTML =
                    `Тобі знадобилося ${movesElement.textContent} ходів.
                    <div class="sort-victory-message-second">
                        Спробуй зіграти ще раз і покращити результат!
                    </div>`;

                document.getElementById(
                    "sortVictoryOverlay"
                ).style.display = "flex";

                updateSortHintButton();        

            } else {

                statusMessage.textContent =
                    `Гілку очищено! Залишилося Countryballs: ${sortBallsRemaining}.`;
            }

            updateSortBranchHelpButton();

        }, 1050);

        return;
    }

    renderSortBoard();

    updateSortBranchHelpButton();

    statusMessage.textContent =
    "Продовжуй сортувати Countryballs за таборами.";
});

// Початок партії
document.getElementById(
    "sortStartButton"
).addEventListener("click", event => {

    event.stopPropagation();

    sortDifficulty =
        Math.max(
            1,
            Math.min(5, sortDifficulty)
        );

    sortGameStarted = true;
    sortBoardBusy = false;

    sortSelectedBranchIndex = null;
    sortExtraBranchesUsed = 0;
    clearSortHintHighlight();

    sortHints = 3;

    updateSortHintButton();

    document.getElementById(
        "sortMoves"
    ).textContent = "0";

    updateSortDifficultyDisplay();

    document.getElementById(
        "sortStatusMessage"
    ).textContent =
        "Обери гілку з Countryballs, щоб почати.";

    const generatedPuzzle = generateSortPuzzle();

    if (!generatedPuzzle) {

        sortGameStarted = false;

        sortStartOverlay.style.display = "flex";

        document.getElementById(
            "sortStatusMessage"
        ).textContent =
            "Не вдалося створити відповідну розкладку. Спробуй запустити рівень ще раз.";

        updateSortBranchHelpButton();

        return;
    }

sortBallsRemaining = sortStacks.reduce(
    (total, stack) => total + stack.length,
    0
);

renderSortBoard();

    sortStartOverlay.style.display = "none";

    updateSortBranchHelpButton();
});


// Оновлення кнопки допомоги
function updateSortBranchHelpButton() {

    const button = document.getElementById(
        "sortAddBranchButton"
    );

    const count = document.getElementById(
        "sortExtraBranchesCount"
    );

    if (!button || !count) {
        return;
    }

    const remaining = Math.max(
        0,
        2 - sortExtraBranchesUsed
    );

    count.textContent = remaining;

    button.title = remaining > 0
        ? "Додати вільну гілку"
        : "Усі додаткові гілки використано";

    button.setAttribute(
        "aria-label",
        `Додати вільну гілку. Залишилося: ${remaining}`
    );

    button.disabled =
    !sortGameStarted ||
    sortBoardBusy ||
    remaining <= 0;
}

// Додаємо одну з двох допоміжних гілок
document.getElementById(
    "sortAddBranchButton"
).addEventListener("click", event => {

    event.stopPropagation();

    if (
        !sortGameStarted ||
        sortBoardBusy ||
        sortExtraBranchesUsed >= 2
    ) {
        return;
    }

    sortStacks.push([]);

    sortExtraBranchesUsed++;

    renderSortBoard();
    updateSortBranchHelpButton();

    document.getElementById(
        "sortStatusMessage"
    ).textContent =
        "Додано вільну гілку. Використовуй її для перестановок.";
});
// Повторна партія після перемоги
document.getElementById(
    "sortVictoryReplayButton"
).addEventListener("click", event => {

    event.stopPropagation();

    document.getElementById(
        "sortVictoryOverlay"
    ).style.display = "none";

    // Повертаємося на стартовий екран
    sortStartOverlay.style.display = "flex";

    // Відновлюємо виділення вибраного рівня
    document.querySelectorAll(
        ".sort-difficulty-button"
    ).forEach(button => {

        button.classList.toggle(
            "selected",
            Number(button.dataset.sortDifficulty) ===
                sortDifficulty
        );
    });

    sortStartLevelLabel.textContent =
        sortDifficultyNames[sortDifficulty];
});


// Повернення до меню після перемоги
document.getElementById(
    "sortVictoryBackButton"
).addEventListener("click", event => {

    event.stopPropagation();

    document.getElementById(
        "sortVictoryOverlay"
    ).style.display = "none";

    returnFromSortGame();
});
// =========================================
// СПІЛЬНИЙ ДОВІДНИК COUNTRYBALLS
// =========================================

function renderCountryReferencePanel(panel) {

    if (!panel) {
        return;
    }

    const blocs = [
        {
            key: "entente",
            title: "Антанта"
        },
        {
            key: "central",
            title: "Центральні держави"
        },
        {
            key: "neutral",
            title: "Нейтральні країни"
        }
    ];

    panel.innerHTML = "";

    const toggle = document.createElement("button");

    toggle.type = "button";
    toggle.className = "country-reference-toggle";
    toggle.setAttribute("aria-expanded", "true");
    toggle.title = "Згорнути довідник";

    toggle.innerHTML = `
        <span aria-hidden="true">📚</span>
        <span class="country-reference-toggle-label">
            Країни й табори
        </span>
        <span class="country-reference-chevron"
              aria-hidden="true">‹</span>
    `;

    const content = document.createElement("div");

    content.className = "country-reference-content";

    for (const bloc of blocs) {

        const countries = Object.values(COUNTRIES)
            .filter(country => country.bloc === bloc.key);

        const group = document.createElement("section");

        group.className = "country-reference-group";

        const heading = document.createElement("h3");

        heading.className = "country-reference-group-title";
        heading.textContent = bloc.title;

        const list = document.createElement("div");

        list.className = "country-reference-list";

        for (const country of countries) {

            const item = document.createElement("div");

            item.className = "country-reference-item";

            const image = document.createElement("img");

            image.src = country.image;
            image.alt = country.name;
            image.loading = "lazy";

            const name = document.createElement("span");

            name.textContent = country.name;

            item.append(image, name);
            list.appendChild(item);
        }

        group.append(heading, list);
        content.appendChild(group);
    }

    toggle.addEventListener("click", () => {

        const collapsed =
            panel.classList.toggle("is-collapsed");

        toggle.setAttribute(
            "aria-expanded",
            String(!collapsed)
        );

        toggle.title = collapsed
            ? "Розгорнути довідник"
            : "Згорнути довідник";
    });

    panel.append(toggle, content);
}


// Заповнюємо довідники в усіх трьох іграх
[
    "fireCountryReference",
    "matchCountryReference",
    "sortCountryReference"
].forEach(id => {

    renderCountryReferencePanel(
        document.getElementById(id)
    );
});
// Розгортаємо довідники щоразу під час відкриття гри
function resetCountryReferencePanels() {

    const panelIds = [
        "fireCountryReference",
        "matchCountryReference",
        "sortCountryReference"
    ];

    panelIds.forEach(id => {

        const panel = document.getElementById(id);

        if (!panel) {
            return;
        }

        panel.classList.remove("is-collapsed");

        const toggle = panel.querySelector(
            ".country-reference-toggle"
        );

        if (toggle) {
            toggle.setAttribute("aria-expanded", "true");
            toggle.title = "Згорнути довідник";
        }
    });
}
// =======================================
// ПЕРЕЗАПУСК ПОТОЧНОЇ ГРИ
// =======================================

// «Вогонь!» — використовуємо наявний перезапуск
document.getElementById(
    "fireRestartCurrentButton"
)?.addEventListener("click", event => {

    event.stopPropagation();

    document.getElementById(
        "fireRestartButton"
    )?.click();
});


// «Три в ряд» — створюємо нову партію
document.getElementById(
    "matchRestartCurrentButton"
)?.addEventListener("click", event => {

    event.stopPropagation();

    clearTimeout(matchHintTimer);

    createMatchBoard();
});


// «РОЗСОРТУЙ!» — запускаємо нову розкладку
document.getElementById(
    "sortRestartCurrentButton"
)?.addEventListener("click", event => {

    event.stopPropagation();

    document.getElementById(
        "sortStartButton"
    )?.click();
});