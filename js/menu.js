const menu = document.getElementById("mainMenu");

const controlsMenu = document.getElementById("controlsMenu");

const controlsButton = document.getElementById("controlsButton");

const backButton = document.getElementById("backButton");

const startButton = document.getElementById("startButton");

const hsValue = document.getElementById("hsValue");

const muteToggleBtn = document.getElementById("muteToggleBtn");

const hudToggleBtn = document.getElementById("hudToggleBtn");


// =========================
// High Score
// =========================

hsValue.textContent = localStorage.getItem("highScore") || 0;


const startScreenMusic = new Audio("assets/audio/intro stinger (16 sec full).mp3");
startScreenMusic.volume = 0.6;

// Restore a saved mute preference before anything plays, so the
// start-screen music respects it from the very first frame.
isMuted = localStorage.getItem("isMuted") === "true";
applyMuteState();

startScreenMusic.play().catch(() => {

    const retryStartScreenMusic = () => {
        startScreenMusic.play().catch(() => {});
        window.removeEventListener("click", retryStartScreenMusic);
        window.removeEventListener("keydown", retryStartScreenMusic);
    };

    window.addEventListener("click", retryStartScreenMusic, { once: true });
    window.addEventListener("keydown", retryStartScreenMusic, { once: true });

});


// =========================
// Menu UI sound helper - every clickable menu control gets a
// consistent hover beep + click sfx, same sounds used in-game.
// =========================

function bindMenuUiSound(el) {

    el.addEventListener("mouseenter", () => {
        playSound(sfx.uiHover);
    });

    el.addEventListener("click", () => {
        playSound(sfx.uiClick);
    });

}

[startButton, controlsButton, backButton, muteToggleBtn, hudToggleBtn].forEach(bindMenuUiSound);


// =========================
// Open Controls
// =========================

controlsButton.addEventListener("click", () => {

    controlsMenu.style.display = "flex";

});


// =========================
// Close Controls
// =========================

backButton.addEventListener("click", () => {

    controlsMenu.style.display = "none";

});


// =========================
// Mute toggle (mirrors the in-game "M" key, plus persists the choice)
// =========================

function refreshMuteButton() {
    muteToggleBtn.textContent = isMuted ? "ON" : "OFF";
    muteToggleBtn.classList.toggle("active", isMuted);
}

muteToggleBtn.addEventListener("click", () => {

    isMuted = !isMuted;
    applyMuteState();
    localStorage.setItem("isMuted", isMuted);
    refreshMuteButton();

});

refreshMuteButton();


// =========================
// HUD style toggle (mirrors the in-game "H" key)
// =========================

const HUD_LABELS = ["FULL", "COMPACT", "HIDDEN"];

function refreshHudButton() {
    hudToggleBtn.textContent = HUD_LABELS[hudMode];
}

hudToggleBtn.addEventListener("click", () => {

    hudMode = (hudMode + 1) % 3;
    refreshHudButton();

});

refreshHudButton();


// =========================
// Start Game
// =========================

// Guards against the start sequence firing twice (e.g. a click and an
// Enter press landing in the same 450ms fade-out) before gameStarted
// actually flips true.
let startSequenceBegun = false;

startButton.addEventListener("click", startGame);

document.addEventListener("keydown", (e) => {

    if (!gameStarted && !startSequenceBegun && e.key === "Enter") {

        startGame();

    }

});


function startGame() {

    if (startSequenceBegun) return;
    startSequenceBegun = true;

    menu.style.transition = ".45s";

    menu.style.opacity = "0";

    startScreenMusic.pause();
    startScreenMusic.currentTime = 0;

    setTimeout(() => {

        menu.style.display = "none";

        gameStarted = true;

    }, 450);

}