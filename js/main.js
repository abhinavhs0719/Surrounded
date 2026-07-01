const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const floorCanvas = document.createElement("canvas");
floorCanvas.width = canvas.width;
floorCanvas.height = canvas.height;

const floorCtx = floorCanvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

floorCanvas.width = canvas.width;
floorCanvas.height = canvas.height;

generateFloor();

// ======================================
// GAME VARIABLES
// ======================================

let x = canvas.width / 2;
let y = canvas.height / 2;
let speed = 10;
let moveRight = false;
let moveLeft = false;
let moveUp = false;
let moveDown = false;
let mouseX = 0;
let mouseY = 0;
let angle = 0;
let bullets = [];
let enemyBullets = [];
let baseEnemySpeed = 0.5;
let enemySpeed = baseEnemySpeed;
let enemyStopDistance = 180;
let enemyShootCooldown = 2000;
let playerHealth = 100;
let maxPlayerHealth = 100;
let gameOver = false;
let score = 0;
let enemies = [];
let wave = 1;
let paused = false;
let enemiesPerWave = 4;
let particles = [];
let muzzleFlash = 0;
let screenShake = 0;
let recoilOffset = 0;
let recoilRotation = 0;
let hitMarker = 0;
let currentWeapon = "pistol";
let shooting = false;
let lastShotTime = 0;
let reloading = false;
let reloadStartTime = 0;
const reloadState = { pistol: false, shotgun: false, machinegun: false };
const reloadStartTimes = { pistol: 0, shotgun: 0, machinegun: 0 };
const RELOAD_DURATION = 2000;
let healthPacks = [];
let ammoPacks = [];
let grenadePacks = [];
let grenades = 0;
const MAX_GRENADES = 5;
let shieldPacks = [];
let shieldActive = false;
let shieldEndTime = 0;
const SHIELD_DURATION = 6000;
let shieldBlockFlash = 0;
let freezePacks = [];
let freezeCharges = 0;
const MAX_FREEZE = 5;
let freezeActive = false;
let freezeEndTime = 0;
const FREEZE_DURATION = 4000;
const FREEZE_SLOW_FACTOR = 0.12;
let thrownGrenades = [];
const GRENADE_FUSE_FRAMES = 45;
const GRENADE_KILL_RADIUS = 170;
const GRENADE_MAX_DAMAGE = 14;
const GRENADE_PLAYER_RADIUS = 140;
const GRENADE_PLAYER_MAX_DAMAGE = 55;
let damageTexts = [];
let waveTextTimer = 0;
let scoreTexts = [];
let bulletTrails = [];
let deathFlashes = [];
let explosionEffects = [];
let bloodParticles = [];
let bloodPools = [];
let shakeX = 0;
let shakeY = 0;
let respawnQueue = [];
let waveOverlayAlpha = 0;
let crosshairGap = 8;
let machineGunSpread = 0;
let highScore = localStorage.getItem("highScore") || 0;
let dashCooldown = 0;
let dashFrames = 0;
let dashDirectionX = 0;
let dashDirectionY = 0;
let playerTrails = [];
let displayedHealth = 100;
let healthFlash = 0;
let lastHitTime = 0;
let playerDamageMarks = [];
const MAX_PLAYER_DAMAGE_MARKS = 18;
let gameStarted = false;
let menuParticles = [];
let titleFloat = 0;
let menuButtonHover = false;
let fadeAlpha = 1;
let cameraZoom = 1;
let targetZoom = 1;
let ignoreNextShot = true;
let coverBlocks = [];
const COVER_BLOCK_COUNT = 6;
const COVER_BLOCK_SIZE = 70;
const COVER_BLOCK_MAX_HEALTH = 18;
let pistolAmmo = 12;
let pistolMaxAmmo = 12;
let shotgunAmmo = 8;
let shotgunMaxAmmo = 8;
let machineGunAmmo = 60;
let machineGunMaxAmmo = 60;
let ammo = pistolAmmo;
let maxAmmo = pistolMaxAmmo;

// Slowly dims the player, bullets and wave banner the deeper the fight goes -
// a quiet visual toll for how long you've been standing.
let progressFade = 1;

// Game over screen state
let gameOverTime = 0;
let selectedQuote = "";
let lastQuoteIndex = -1;
let pauseStartTime = 0;
let playerExplosionParticles = [];
let playerDeathX = 0;
let playerDeathY = 0;
const WORLD_FADE_DURATION = 1600;

const SOLDIER_QUOTES = [
    "Every fall taught you something the wins never could.",
    "Scars are just proof you showed up when it mattered.",
    "The ones who keep rising are remembered, not the ones who never fell.",
    "Tired hands can still hold the line tomorrow.",
    "Defeat is only the end if you decide it is.",
    "Somewhere out there, the fight still needs you.",
    "Strength isn't never falling - it's standing back up, again and again.",
    "This wasn't the end. It was practice for the next stand.",
    "The wave broke you tonight, but it didn't break your will.",
    "Rest now, warrior. Tomorrow, the line holds again.",
    "Some battles are won simply by refusing to stay down.",
    "Every soldier who ever won, lost first. Get back up."
];

// Victory screen state
let selectedVictoryQuote = "";
let lastVictoryQuoteIndex = -1;

const VICTORY_QUOTES = [
    "The battle you just won was practice. The one waiting tomorrow is real - and you're ready.",
    "Every hard day you've survived was training for the ones still ahead.",
    "The fight in you didn't end here. It just found somewhere new to go.",
    "You've proven you don't quit. Carry that into whatever comes next.",
    "The next problem is just another wave. You already know how to stand through it.",
    "Nothing you face tomorrow is bigger than what you already got through today.",
    "You didn't survive this far to stop trying now.",
    "The world outside needs the same courage you just showed in here.",
    "One victory doesn't end the journey - it just proves you're capable of the next one.",
    "Keep the same grit for the fights that don't come with a scoreboard.",
    "You've beaten worse than what's coming. Walk into it standing tall.",
    "This was one line held. There are more out there - and you're built to hold them too."
];

function getProgressFade() {
    const fade = 1 - Math.min((wave - 1) * 0.022, 0.45);
    return Math.max(0.55, fade);
}

function triggerGameOver() {
    if (gameOver) return;
    gameOver = true;
    gameOverTime = Date.now();

    playerDeathX = x + PLAYER_CENTER;
    playerDeathY = y + PLAYER_CENTER;
    spawnPlayerExplosion(playerDeathX, playerDeathY);

    let nextIndex = Math.floor(Math.random() * SOLDIER_QUOTES.length);
    if (SOLDIER_QUOTES.length > 1) {
        while (nextIndex === lastQuoteIndex) {
            nextIndex = Math.floor(Math.random() * SOLDIER_QUOTES.length);
        }
    }
    lastQuoteIndex = nextIndex;
    selectedQuote = SOLDIER_QUOTES[nextIndex];
}

function spawnPlayerExplosion(ex, ey) {

    playerExplosionParticles = [];

    for (let i = 0; i < 46; i++) {

        const a = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 7;
        const isSmoke = Math.random() < 0.35;

        playerExplosionParticles.push({
            x: ex,
            y: ey,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            life: isSmoke ? 70 + Math.random() * 30 : 30 + Math.random() * 25,
            maxLife: isSmoke ? 100 : 55,
            size: isSmoke ? 10 + Math.random() * 14 : 3 + Math.random() * 6,
            smoke: isSmoke,
            color: isSmoke
                ? "60,60,64"
                : (Math.random() < 0.5 ? "255,140,40" : "255,210,90")
        });

    }

}

function updatePlayerDeathExplosion(elapsed) {

    ctx.save();

    // Bright flash that punches in immediately, then fades fast
    const flashLife = Math.max(0, 1 - elapsed / 260);
    if (flashLife > 0) {
        const flashRadius = 30 + (1 - flashLife) * 90;
        const g = ctx.createRadialGradient(playerDeathX, playerDeathY, 0, playerDeathX, playerDeathY, flashRadius);
        g.addColorStop(0, "rgba(255, 235, 190, " + flashLife + ")");
        g.addColorStop(1, "rgba(255, 235, 190, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(playerDeathX, playerDeathY, flashRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Expanding shockwave ring
    if (elapsed < 600) {
        const ringProgress = elapsed / 600;
        const ringRadius = 10 + ringProgress * 140;
        ctx.strokeStyle = "rgba(255, 180, 90, " + (0.5 * (1 - ringProgress)) + ")";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(playerDeathX, playerDeathY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    for (let i = playerExplosionParticles.length - 1; i >= 0; i--) {

        const p = playerExplosionParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.smoke ? 0.96 : 0.92;
        p.vy *= p.smoke ? 0.96 : 0.92;
        if (p.smoke) p.vy -= 0.03;
        p.life--;

        if (p.life <= 0) {
            playerExplosionParticles.splice(i, 1);
            continue;
        }

        const lifeRatio = Math.max(0, p.life / p.maxLife);

        ctx.globalAlpha = p.smoke ? lifeRatio * 0.4 : lifeRatio;
        ctx.fillStyle = "rgb(" + p.color + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.smoke ? (1.6 - lifeRatio * 0.6) : lifeRatio), 0, Math.PI * 2);
        ctx.fill();

    }

    ctx.globalAlpha = 1;
    ctx.restore();

}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function wrapTextLines(measureCtx, text, maxWidth) {    const words = text.split(" ");
    const lines = [];
    let current = "";
    for (let w = 0; w < words.length; w++) {
        const word = words[w];
        const test = current ? current + " " + word : word;
        if (measureCtx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}

// ======================================
// GAME CONSTANTS
// ======================================

const PLAYER_SIZE = 80;
const PLAYER_CENTER = PLAYER_SIZE / 2;

const PLAYER_HIT_RADIUS = 45;
const ENEMY_HIT_RADIUS = 30;

const BULLET_SPEED = 20;
const BULLET_RADIUS = 5;

const SAFE_SPAWN_DISTANCE = 250;

const Muzzle_Flash = 4;

// ======================================
// Audio - Sound Effects & Music
// ======================================

const AUDIO_PATH = "assets/audio/";

// One-shot SFX - cloned on play (see playSound) so rapid or overlapping
// triggers (machine gun fire, multiple hits in one frame) never cut
// each other off the way reusing a single Audio node would.
const sfx = {
    pistolShot:        new Audio(AUDIO_PATH + "9 mm pistol shot (2 secomds).wav"),
    shotgunBlast:       new Audio(AUDIO_PATH + "Shotgun (2.3 sec).wav"),
    machineGun:         new Audio(AUDIO_PATH + "machinegun (3 sec).wav"),
    dryFire:            new Audio(AUDIO_PATH + "Dry Fire Gun (1.3 sec).wav"),
    reload:             new Audio(AUDIO_PATH + "reload (1.3 sec).wav"),
    dash:               new Audio(AUDIO_PATH + "dash whoosh sfx(2sec).wav"),
    grenadeThrow:       new Audio(AUDIO_PATH + "grenade throw whoosh (0.3 sec).wav"),
    grenadeBlast:       new Audio(AUDIO_PATH + "grenade explosion sfx(1.6 sec).wav"),
    freeze:             new Audio(AUDIO_PATH + "ice freeze sfx (2sec).wav"),
    fleshImpact:        new Audio(AUDIO_PATH + "flesh impact (1.2 sec).wav"),
    enemyDeath:         new Audio(AUDIO_PATH + "creature die growl(2 sec).wav"),
    playerDamage:       new Audio(AUDIO_PATH + "player damage grunt (1.5 sec).wav"),
    playerDeath:        new Audio(AUDIO_PATH + "player die boom (1.3 sec).wav"),
    itemPickup:         new Audio(AUDIO_PATH + "item pickup sfx(1.5 sec).wav"),
    ammoGrenadePickup:  new Audio(AUDIO_PATH + "Ammo and grenade pickup (1.3sec).wav"),
    shieldPickup:       new Audio(AUDIO_PATH + "Shield Pickup and use (4 Sec).wav"),
    waveStart:          new Audio(AUDIO_PATH + "wave start alert sfx (2.3sec).wav"),
    gameOverJingle:     new Audio(AUDIO_PATH + "game over jingle (1m 30 sec).wav"),
    introStinger:       new Audio(AUDIO_PATH + "intro stinger (16 sec).wav"),
    pauseToggle:        new Audio(AUDIO_PATH + "pause menu toggle (0.2 sec) .wav"),
    uiClick:            new Audio(AUDIO_PATH + "ui click sfx (0.5 sec).wav"),
    uiHover:            new Audio(AUDIO_PATH + "ui hover beep (0.2 sec).wav"),
    victorySong:        new Audio(AUDIO_PATH + "victory song.wav")
};

// Looping ambience / music - kept as single persistent instances since
// they're started/stopped/paused rather than fired repeatedly.
const loopAudio = {
    lowHealth:      new Audio(AUDIO_PATH + "low health warning pulse (1.2 sec).wav"),
    enemyFootsteps: new Audio(AUDIO_PATH + "enemy footsteps (3.4 sec).wav"),
    actionMusic:    new Audio(AUDIO_PATH + "intense action loop music(2 min 41 sec).wav")
};

loopAudio.lowHealth.loop = true;
loopAudio.enemyFootsteps.loop = true;
loopAudio.actionMusic.loop = true;

// Balanced default volumes - SFX read clearly over music/ambience,
// and rapid-fire/loop sounds sit lower so they don't overwhelm the mix.
sfx.pistolShot.volume = 0.55;
sfx.shotgunBlast.volume = 0.6;
sfx.machineGun.volume = 0.4;
sfx.dryFire.volume = 0.5;
sfx.reload.volume = 0.5;
sfx.dash.volume = 0.45;
sfx.grenadeThrow.volume = 0.5;
sfx.grenadeBlast.volume = 0.7;
sfx.freeze.volume = 0.55;
sfx.fleshImpact.volume = 0.35;
sfx.enemyDeath.volume = 0.55;
sfx.playerDamage.volume = 0.6;
sfx.playerDeath.volume = 0.8;
sfx.itemPickup.volume = 0.5;
sfx.ammoGrenadePickup.volume = 0.5;
sfx.shieldPickup.volume = 0.55;
sfx.waveStart.volume = 0.6;
sfx.gameOverJingle.volume = 0.55;
sfx.introStinger.volume = 0.6;
sfx.pauseToggle.volume = 0.4;
sfx.uiClick.volume = 0.4;
sfx.uiHover.volume = 0.25;
sfx.victorySong.volume = 0.6;

loopAudio.lowHealth.volume = 0.35;
loopAudio.enemyFootsteps.volume = 0.15;
loopAudio.actionMusic.volume = 0.22;

// ======================================
// Mute (M) & HUD style (H) toggles
// ======================================
// isMuted only silences the background music track, not sound
// effects or ambience - matches "mute the music" behaviour.
let isMuted = false;

// hudMode cycles: 0 = full HUD (default/opening), 1 = compact
// shorthand HUD (top-left, wide/low), 2 = HUD hidden entirely.
let hudMode = 0;

// Applies the current isMuted flag to every music track (background
// action loop plus the menu's start-screen music, if it exists yet).
// Shared by the in-game "M" key and the mute toggle in the controls panel.
function applyMuteState() {
    loopAudio.actionMusic.muted = isMuted;
    if (typeof startScreenMusic !== "undefined") {
        startScreenMusic.muted = isMuted;
    }
}

// ======================================
// Sound playback helpers
// ======================================

// Plays a one-shot sound without waiting for any earlier play of the
// same sound to finish - clones the node so overlapping triggers
// (e.g. two enemies hit in the same frame) layer instead of restarting.
function playSound(sound, volumeOverride) {

    const instance = sound.cloneNode();
    instance.volume = (volumeOverride !== undefined) ? volumeOverride : sound.volume;
    instance.play().catch(function () {});

}

// Starts a looping track only if it isn't already playing
function startLoop(sound) {

    if (sound.paused) {
        sound.play().catch(function () {});
    }

}

// Stops a looping track and rewinds it to the start
function stopLoop(sound) {

    if (!sound.paused) {
        sound.pause();
        sound.currentTime = 0;
    }

}

// ======================================
// Audio state machine - drives music/ambience transitions and
// one-time stingers off the game's existing state flags
// ======================================
let wasGameStarted = false;
let wasPaused = false;
let wasGameOverForAudio = false;
let lastDryFireTime = 0;
let anyEnemyMoving = false;

function updateAudioState() {

    if (gameStarted && !wasGameStarted) {

        startLoop(loopAudio.actionMusic);
        spawnBoss("intro");

    }
    wasGameStarted = gameStarted;

    if (!gameStarted) return;

    if (gameOver && !wasGameOverForAudio) {

        stopLoop(loopAudio.actionMusic);
        stopLoop(loopAudio.enemyFootsteps);
        stopLoop(loopAudio.lowHealth);

        playSound(sfx.playerDeath);
        playSound(sfx.gameOverJingle);

    }
    wasGameOverForAudio = gameOver;

    if (gameOver) return;

    if (paused && !wasPaused) {

        loopAudio.actionMusic.pause();
        loopAudio.enemyFootsteps.pause();
        loopAudio.lowHealth.pause();

        playSound(sfx.introStinger);

    }

    if (!paused && wasPaused) {

        loopAudio.actionMusic.play().catch(function () {});
        stopLoop(sfx.introStinger);

    }
    wasPaused = paused;

    if (paused) return;

    // Low health warning pulse - loops only while critically low
    if (playerHealth > 0 && playerHealth < maxPlayerHealth * 0.25) {
        startLoop(loopAudio.lowHealth);
    } else {
        stopLoop(loopAudio.lowHealth);
    }

    // Enemy footstep ambience - active only while an enemy is actually
    // moving (not just alive/stopped), gets louder the closer the
    // nearest enemy is to the player
    if (enemies.length > 0 && anyEnemyMoving) {

        let nearestDist = Infinity;

        for (let i = 0; i < enemies.length; i++) {

            const d = Math.hypot(
                (x + PLAYER_CENTER) - enemies[i].x,
                (y + PLAYER_CENTER) - enemies[i].y
            );

            if (d < nearestDist) nearestDist = d;

        }

        startLoop(loopAudio.enemyFootsteps);

        const proximity = Math.max(0, Math.min(1, 1 - (nearestDist / 700)));
        loopAudio.enemyFootsteps.volume = 0.08 + proximity * 0.35;

    } else {
        stopLoop(loopAudio.enemyFootsteps);
    }

}

// ======================================
// Assets
// ======================================
const assets = {};

function loadImage(name, src) {

    const img = new Image();

    img.src = src;

    assets[name] = img;

}


// ======================================
// EVENT LISTENERS
// ======================================

document.addEventListener('keydown', (event) => {

    if (!gameStarted) return;

    if (event.key === "d") {
        moveRight = true;
    }
    if (event.key === "a") {
        moveLeft = true;
    }
    if (event.key === "w") {
        moveUp = true;
    }
    if (event.key === "s") {
        moveDown = true;
    }


    if (event.key === "1") {

        if (currentWeapon === "shotgun") {

    shotgunAmmo = ammo;

}
else if (currentWeapon === "machinegun") {

    machineGunAmmo = ammo;

}

    currentWeapon = "pistol";

    ammo = pistolAmmo;
    maxAmmo = pistolMaxAmmo;

}

    if (event.key === "2") {

        if (currentWeapon === "pistol") {

    pistolAmmo = ammo;

}
else if (currentWeapon === "machinegun") {

    machineGunAmmo = ammo;

}

    currentWeapon = "shotgun";

    ammo = shotgunAmmo;
    maxAmmo = shotgunMaxAmmo;

}

    if (event.key === "3") {

        if (currentWeapon === "pistol") {

    pistolAmmo = ammo;

}
else if (currentWeapon === "shotgun") {

    shotgunAmmo = ammo;

}

    currentWeapon = "machinegun";

    ammo = machineGunAmmo;
    maxAmmo = machineGunMaxAmmo;

}

    if (event.key === "r") {

const reloadKey = currentWeapon;

if (!reloadState[reloadKey] && ammo < maxAmmo) {

    reloadState[reloadKey] = true;
    reloadStartTimes[reloadKey] = Date.now();

    playSound(sfx.reload);

    setTimeout(function () {

        if (reloadKey === "pistol") {
            pistolAmmo = pistolMaxAmmo;
        } else if (reloadKey === "shotgun") {
            shotgunAmmo = shotgunMaxAmmo;
        } else if (reloadKey === "machinegun") {
            machineGunAmmo = machineGunMaxAmmo;
        }

        reloadState[reloadKey] = false;

        if (currentWeapon === reloadKey) {
            ammo = maxAmmo;
        }

    }, RELOAD_DURATION);

}

    }
      if (event.key === "Shift" && dashCooldown <= 0) {

    playSound(sfx.dash);

    dashFrames = 8;
    targetZoom = 0.95;

    dashCooldown = 120;

    dashDirectionX = Math.cos(angle);

    dashDirectionY = Math.sin(angle);

}

    if ((event.key === "g" || event.key === "G") && gameStarted && !paused && !gameOver) {

        throwGrenade();

    }

    if ((event.key === "f" || event.key === "F") && gameStarted && !paused && !gameOver) {

        activateFreeze();

    }
    });




document.addEventListener('keyup', (event) => {
    if (event.key === "d") {
        moveRight = false;
    }
    if (event.key === "a") {
        moveLeft = false;
    }
    if (event.key === "w") {
        moveUp = false;
    }
    if (event.key === "s") {
        moveDown = false;
    }
});




document.addEventListener("click", function () {

    if (!gameStarted) return;

    if (ignoreNextShot) {

    ignoreNextShot = false;
    return;

}

    if (currentWeapon === "pistol") {
        if (reloadState.pistol) return;
        if (ammo <= 0) {
            playSound(sfx.dryFire);
            return;
        }

        ammo--;

        playSound(sfx.pistolShot);

        bullets.push({
            x: x + PLAYER_CENTER,
            y: y + PLAYER_CENTER,
            angle: angle,
            weapon: "pistol",

         distance: 0 
        });

        muzzleFlash = 4;
        crosshairGap = 16;
recoilOffset = 8;
targetZoom = 1.03;

recoilRotation = (Math.random() - 0.5) * 0.025;

screenShake = 2;        

    }

    else if (currentWeapon === "shotgun") {

    if (reloadState.shotgun) return;

    if (ammo <= 0) {
        playSound(sfx.dryFire);
        return;
    }

    ammo--;      // ✅ Only ONCE

    playSound(sfx.shotgunBlast);

    for (let i = -2; i <= 2; i++) {

        bullets.push({

            x: x + PLAYER_CENTER,
            y: y + PLAYER_CENTER,
            angle: angle + i * 0.1,
            weapon: "shotgun",
             distance: 0
        });

    }

    muzzleFlash = 4;
    crosshairGap = 16;
recoilOffset = 18;
targetZoom = 1.05;

recoilRotation = (Math.random() - 0.5) * 0.05;

screenShake = 5;    

}

    else if (currentWeapon === "machinegun") {

        return;

    }

});

document.addEventListener("mousedown", function () {

    if (!gameStarted) return;

    shooting = true;

});

document.addEventListener("mouseup", function () {

    shooting = false;

});


document.addEventListener('mousemove', function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});



document.addEventListener("keydown", function(event) {

    if ((gameOver || gameWon) && (event.key === "r" || event.key === "Enter")) {
        location.reload();
    }

});
 


document.addEventListener("keydown", function (event) {

    if (event.key === "Escape" && gameStarted) {
        paused = !paused;
        playSound(sfx.pauseToggle);
        if (paused) {
            pauseStartTime = Date.now();
        }
    }

});


document.addEventListener("keydown", function (event) {

    if (event.key === "m" || event.key === "M") {

        isMuted = !isMuted;
        applyMuteState();

    }

    if (event.key === "h" || event.key === "H") {

        hudMode = (hudMode + 1) % 3;

    }

});



// ======================================
// INITIAL GAME SETUP
// ======================================

// =====================
// Wave Tier Scaling
// =====================
// Every wave cycles enemy count 4 -> 8 over 5 waves, then resets.
// Every full cycle of 5 waves bumps a "tier": health multiplies (x1, x2, x3...)
// and bullet damage grows by +0.5x per tier. A tier color tints the enemy's
// outer boundary so stronger reinforcements are recognizable at a glance.
const WAVE_TIER_COLORS = [
    "#ffffff", // tier 0 (waves 1-5): base, no tint
    "#ffae00", // tier 1 (waves 6-10): amber boundary
    "#ff3d3d", // tier 2 (waves 11-15): red boundary
    "#c63dff", // tier 3 (waves 16-20): violet boundary
    "#3dd6ff", // tier 4 (waves 21-25): cyan boundary
    "#ff3d9e"  // tier 5+ : magenta boundary (cycles further if needed)
];

function getWaveTier(w) {
    return Math.floor((w - 1) / 5);
}

function getWaveEnemyCount(w) {
    const posInCycle = ((w - 1) % 5) + 1; // 1..5
    return posInCycle + 3; // 4..8
}

function getWaveHealthMultiplier(w) {
    return getWaveTier(w) + 1; // x1, x2, x3...
}

function getWaveDamageMultiplier(w) {
    return 1 + getWaveTier(w) * 0.5; // x1, x1.5, x2...
}

// Tanks keep the same scary health-scaling curve as everything else, but
// their damage grows slower and caps out - without this, a late-wave tank
// hit (previously ~x5.5 base damage) could take off more than half the
// player's max health in a single shot. Health/tankiness stays untouched;
// only the "how hard does it hit" side is tuned down.
function getTankDamageMultiplier(w) {
    const tier = getWaveTier(w);
    return Math.min(1 + tier * 0.25, 2.5); // x1 up to x2.5, capped
}

function getWaveTierColor(w) {
    const tier = getWaveTier(w);
    return WAVE_TIER_COLORS[Math.min(tier, WAVE_TIER_COLORS.length - 1)];
}

// Player bullets hit progressively harder as the run goes on - a flat +20%
// early, ramping up to +30% by wave 50 (the final boss fight), so the
// player's own firepower keeps pace with the tougher enemies.
function getPlayerDamageMultiplier(w) {
    const t = Math.min(w, 50) / 50;
    return 1.2 + t * 0.1; // 1.2x at wave 1 -> 1.3x at wave 50
}

// =====================
// Spawn the initial wave of enemies
// =====================
for (let i = 0; i < enemiesPerWave; i++) {

    spawnEnemy();

}

spawnCoverBlocks();

// =====================
// Spawn Cover Blocks
// =====================
function spawnCoverBlocks() {

    coverBlocks = [];

    let attempts = 0;

    while (coverBlocks.length < COVER_BLOCK_COUNT && attempts < 300) {

        attempts++;

        let bx = 90 + Math.random() * (canvas.width - 180);
        let by = 90 + Math.random() * (canvas.height - 180);

        let distFromCenter = Math.hypot(
            bx - canvas.width / 2,
            by - canvas.height / 2
        );

        if (distFromCenter < SAFE_SPAWN_DISTANCE) continue;

        let overlaps = coverBlocks.some(function (block) {
            return Math.hypot(block.x - bx, block.y - by) < COVER_BLOCK_SIZE * 2.2;
        });

        if (overlaps) continue;

        coverBlocks.push({
            x: bx,
            y: by,
            width: COVER_BLOCK_SIZE,
            height: COVER_BLOCK_SIZE,
            health: COVER_BLOCK_MAX_HEALTH,
            maxHealth: COVER_BLOCK_MAX_HEALTH,
            flash: 0
        });

    }

}

// =====================
// Spawn Enemy
// =====================
function spawnEnemy() {

    let newX, newY;
    let spawnDistance;

    let attempts = 0;

    do {

        let side = Math.floor(Math.random() * 4);

        if (side === 0) {

            // Top
            newX = Math.random() * canvas.width;
            newY = -50;

        }
        else if (side === 1) {

            // Right
            newX = canvas.width + 50;
            newY = Math.random() * canvas.height;

        }
        else if (side === 2) {

            // Bottom
            newX = Math.random() * canvas.width;
            newY = canvas.height + 50;

        }
        else {

            // Left
            newX = -50;
            newY = Math.random() * canvas.height;

        }

        spawnDistance = Math.hypot(
            newX - (x + PLAYER_CENTER),
            newY - (y + PLAYER_CENTER)
        );

        attempts++;

    } while (spawnDistance < SAFE_SPAWN_DISTANCE && attempts < 20);

const random = Math.random();

let enemyType;
let baseHealth;
let speed;
let color;
let shootDistance;

let baseBulletDamage;

if (random < 0.6) {

    enemyType = "grunt";
    baseHealth = 3;
    speed = enemySpeed;
    color = "lime";
    baseBulletDamage = 10;
    shootDistance = enemyStopDistance * 1.25; // green: slightly farther than red

}
else if (random < 0.9) {

    enemyType = "scout";
    baseHealth = 1;
    speed = enemySpeed * 2;
    color = "yellow";
    baseBulletDamage = 6;
    shootDistance = enemyStopDistance * 2; // yellow: twice the red distance

}
else {

    enemyType = "tank";
    baseHealth = 8;
    speed = enemySpeed * 0.5;
    color = "red";
    baseBulletDamage = 20;
    shootDistance = enemyStopDistance; // red: same as current

}

const healthMultiplier = getWaveHealthMultiplier(wave);
const damageMultiplier = enemyType === "tank" ? getTankDamageMultiplier(wave) : getWaveDamageMultiplier(wave);

const health = Math.round(baseHealth * healthMultiplier);
const bulletDamage = Math.round(baseBulletDamage * damageMultiplier);

enemies.push({

    x: newX,
    y: newY,

    lastShot: 0,

    type: enemyType,

    health: health,
    maxHealth: health,
    speed: speed,
    color: color,
    shootDistance: shootDistance,
    tierColor: getWaveTierColor(wave),
    flash: 0,
    spawnAnimation: 20,
    bulletDamage: bulletDamage

});
}


// =====================================
// BOSS - Armored Commander
// =====================================
// A single heavily-armored unit, styled like a black-and-yellow up-armored
// version of the player, that never rushes in. It hovers at range, strafes,
// and leans on rifle bursts plus lobbed grenades. It cameos (invulnerable)
// at the start and after waves 10/20/30/40, retreating shortly after, and
// only becomes killable during the wave 50 last stand.
const BOSS_MAX_HEALTH = 100;
const BOSS_ENTER_WAVES = [10, 20, 30, 40, 50];
const BOSS_EXIT_WAVES = [11, 21, 31, 41];
const BOSS_KEEP_DISTANCE = 420;
const BOSS_SHOOT_COOLDOWN = 1400;
const BOSS_GRENADE_COOLDOWN = 3200;
const BOSS_CAMEO_DURATION = 240;

let gameWon = false;
let gameWonTime = 0;
let bossWarningTimer = 0;

function getBoss() {
    for (let b = 0; b < enemies.length; b++) {
        if (enemies[b].type === "boss") return enemies[b];
    }
    return null;
}

function spawnBoss(mode) {

    const existing = getBoss();

    if (existing) {
        existing.mode = mode;
        existing.invulnerable = mode !== "final";
        existing.state = "entering";
        existing.spawnAnimation = 20;
        existing.exitTimer = mode !== "final" ? BOSS_CAMEO_DURATION : null;
        bossWarningTimer = 130;
        return;
    }

    let side = Math.floor(Math.random() * 4);
    let startX, startY;

    if (side === 0) { startX = canvas.width / 2; startY = -90; }
    else if (side === 1) { startX = canvas.width + 90; startY = canvas.height / 2; }
    else if (side === 2) { startX = canvas.width / 2; startY = canvas.height + 90; }
    else { startX = -90; startY = canvas.height / 2; }

    enemies.push({
        type: "boss",
        x: startX,
        y: startY,
        health: BOSS_MAX_HEALTH,
        maxHealth: BOSS_MAX_HEALTH,
        speed: 2.6,
        color: "#161616",
        tierColor: "#ffd400",
        flash: 0,
        spawnAnimation: 20,
        bulletDamage: 8,
        lastShot: 0,
        lastGrenade: Date.now(),
        invulnerable: mode !== "final",
        mode: mode,
        state: "entering",
        exitTimer: mode !== "final" ? BOSS_CAMEO_DURATION : null,
        legPhase: Math.random() * Math.PI * 2
    });

    bossWarningTimer = 130;

}

function triggerBossExit() {
    const boss = getBoss();
    if (!boss) return;
    boss.state = "exiting";
}

// Called from advanceWave() whenever the wave number lands on a boss
// checkpoint - keeps all the "when does it show up / leave" rules in
// one place instead of scattered through the wave-advance code paths.
function handleBossWaveTrigger() {
    if (BOSS_ENTER_WAVES.indexOf(wave) !== -1) {
        spawnBoss(wave === 50 ? "final" : "harass");
    } else if (BOSS_EXIT_WAVES.indexOf(wave) !== -1) {
        triggerBossExit();
    }
}

// Wave 50 only ends once the boss AND every remaining regular enemy
// are dead - call this any time either kind of enemy is removed while
// on the final wave.
function checkVictoryCondition() {
    if (wave !== 50 || gameWon || gameOver) return;
    if (enemies.length === 0) {
        triggerVictory();
    }
}

function triggerVictory() {
    if (gameWon) return;
    gameWon = true;
    gameWonTime = Date.now();
    stopLoop(loopAudio.actionMusic);
    playSound(sfx.waveStart);
    playSound(sfx.victorySong);

    let nextIndex = Math.floor(Math.random() * VICTORY_QUOTES.length);
    if (VICTORY_QUOTES.length > 1) {
        while (nextIndex === lastVictoryQuoteIndex) {
            nextIndex = Math.floor(Math.random() * VICTORY_QUOTES.length);
        }
    }
    lastVictoryQuoteIndex = nextIndex;
    selectedVictoryQuote = VICTORY_QUOTES[nextIndex];
}

// Boss AI/movement/draw, run from inside the main enemies loop in place
// of the normal grunt/scout/tank chase-and-shoot behaviour.
function updateBossEntity(boss, currentTime, frozen) {

    const px = x + PLAYER_CENTER;
    const py = y + PLAYER_CENTER;

    const dxToPlayer = px - boss.x;
    const dyToPlayer = py - boss.y;
    const distToPlayer = Math.hypot(dxToPlayer, dyToPlayer);
    const angleToPlayer = Math.atan2(dyToPlayer, dxToPlayer);

    if (!frozen) {

        if (boss.state === "entering") {

            boss.x += Math.cos(angleToPlayer) * boss.speed * 1.4;
            boss.y += Math.sin(angleToPlayer) * boss.speed * 1.4;

            if (distToPlayer < BOSS_KEEP_DISTANCE + 40) {
                boss.state = "active";
            }

        } else if (boss.state === "active") {

            // Hold its distance - back off if the player closes in, drift
            // closer if too far, strafe sideways so it's never a static
            // target. It never enters melee range of the player.
            boss.legPhase += 0.02;

            if (distToPlayer < BOSS_KEEP_DISTANCE - 20) {
                boss.x -= Math.cos(angleToPlayer) * boss.speed;
                boss.y -= Math.sin(angleToPlayer) * boss.speed;
            } else if (distToPlayer > BOSS_KEEP_DISTANCE + 60) {
                boss.x += Math.cos(angleToPlayer) * boss.speed;
                boss.y += Math.sin(angleToPlayer) * boss.speed;
            }

            const strafeAngle = angleToPlayer + Math.PI / 2;
            boss.x += Math.cos(strafeAngle) * Math.sin(boss.legPhase) * 1.4;
            boss.y += Math.sin(strafeAngle) * Math.sin(boss.legPhase) * 1.4;

            boss.x = Math.max(70, Math.min(canvas.width - 70, boss.x));
            boss.y = Math.max(70, Math.min(canvas.height - 70, boss.y));

            if (currentTime - boss.lastShot > BOSS_SHOOT_COOLDOWN) {
                boss.lastShot = currentTime;
                for (let s = -1; s <= 1; s++) {
                    enemyBullets.push({
                        x: boss.x,
                        y: boss.y,
                        angle: angleToPlayer + s * 0.06,
                        damage: boss.bulletDamage,
                        type: "boss"
                    });
                }
                playSound(sfx.machineGun);
            }

            if (currentTime - boss.lastGrenade > BOSS_GRENADE_COOLDOWN) {
                boss.lastGrenade = currentTime;
                bossThrowGrenade(boss, px, py);
            }

            if (boss.mode !== "final" && boss.exitTimer !== null) {
                boss.exitTimer--;
                if (boss.exitTimer <= 0) {
                    boss.state = "exiting";
                }
            }

        } else if (boss.state === "exiting") {

            const backAngle = angleToPlayer + Math.PI;
            boss.x += Math.cos(backAngle) * boss.speed * 2;
            boss.y += Math.sin(backAngle) * boss.speed * 2;

            if (
                boss.x < -130 || boss.x > canvas.width + 130 ||
                boss.y < -130 || boss.y > canvas.height + 130
            ) {
                boss.markForRemoval = true;
                return;
            }

        }

    }

    if (boss.spawnAnimation > 0) boss.spawnAnimation--;

    drawBossEntity(boss, angleToPlayer);

}

function bossThrowGrenade(boss, px, py) {

    playSound(sfx.grenadeThrow);

    thrownGrenades.push({
        startX: boss.x,
        startY: boss.y,
        x: boss.x,
        y: boss.y,
        targetX: px + (Math.random() - 0.5) * 70,
        targetY: py + (Math.random() - 0.5) * 70,
        frame: 0,
        totalFrames: GRENADE_FUSE_FRAMES,
        rotation: 0,
        playerDamageMultiplier: 0.5
    });

}

function drawBossEntity(boss, facingAngle) {

    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.rotate(facingAngle);

    let scale = 1;
    if (boss.spawnAnimation > 0) {
        scale = 1 - (boss.spawnAnimation / 20);
    }
    ctx.scale(scale, scale);

    ctx.globalAlpha = progressFade;

    const flashOn = boss.flash > 0;
    if (flashOn) boss.flash--;

    // Heavy armored chassis - same silhouette language as the player,
    // scaled up and plated, black-and-yellow hazard livery.
    ctx.fillStyle = flashOn ? "white" : "#141414";
    ctx.beginPath();
    ctx.moveTo(-52, -42);
    ctx.lineTo(-42, -52);
    ctx.lineTo(42, -52);
    ctx.lineTo(52, -42);
    ctx.lineTo(52, 42);
    ctx.lineTo(42, 52);
    ctx.lineTo(-42, 52);
    ctx.lineTo(-52, 42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffd400";
    ctx.lineWidth = 3;
    ctx.stroke();

    if (!flashOn) {

        ctx.fillStyle = "#232323";
        ctx.fillRect(-38, -38, 76, 76);

        ctx.strokeStyle = "#ffd400";
        ctx.lineWidth = 7;
        for (let stripe = -30; stripe <= 30; stripe += 15) {
            ctx.beginPath();
            ctx.moveTo(stripe, -38);
            ctx.lineTo(stripe + 18, 38);
            ctx.stroke();
        }
        ctx.strokeStyle = "#141414";
        ctx.lineWidth = 1.5;
        for (let stripe = -30; stripe <= 30; stripe += 15) {
            ctx.beginPath();
            ctx.moveTo(stripe, -38);
            ctx.lineTo(stripe + 18, 38);
            ctx.stroke();
        }

    }

    // Visor
    ctx.fillStyle = "#ffd400";
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#141414";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#141414";
    ctx.fillRect(-11, -3, 22, 6);

    // Twin heavy barrels - it fires from range, so it reads as a heavier gun
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, -10, 58, 8);
    ctx.fillRect(0, 2, 58, 8);
    ctx.strokeStyle = "#ffd400";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, -10, 58, 8);
    ctx.strokeRect(0, 2, 58, 8);

    ctx.globalAlpha = 1;

    // Health bar - wide, always visible threat gauge
    const barWidth = 90;
    ctx.fillStyle = "red";
    ctx.fillRect(-barWidth / 2, -78, barWidth, 7);
    ctx.fillStyle = "#ffd400";
    ctx.fillRect(-barWidth / 2, -78, Math.max(boss.health, 0) / boss.maxHealth * barWidth, 7);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(-barWidth / 2, -78, barWidth, 7);

    ctx.restore();

}

// =====================
// Advance to the next wave (shared by bullet kills and grenade kills so
// the boss checkpoint logic and the wave-50 cap only live in one place).
// =====================
function advanceWave() {

    if (wave >= 50) return;

    wave++;
    waveTextTimer = 120;
    waveOverlayAlpha = 0.6;

    playSound(sfx.waveStart);

    enemiesPerWave = getWaveEnemyCount(wave);

    if (wave % 10 === 0 && maxPlayerHealth < 200) {
        maxPlayerHealth += 25;
    }
    playerHealth = Math.min(playerHealth + 25, maxPlayerHealth);

    if (wave !== 50) {
        while (enemies.length < enemiesPerWave) {
            spawnEnemy();
        }
    }

    handleBossWaveTrigger();

}


// =====================
// Update Player
// =====================
// =====================
// Player Battle Wear
// =====================
// Marks accumulate gradually as hits land - the chance per hit rises slowly
// with wave number (tougher fights, more visible wear), capped so the hero
// always reads as worn-down but still standing, never falling apart.
function addPlayerDamageMark() {

    if (playerDamageMarks.length >= MAX_PLAYER_DAMAGE_MARKS) return;

    const chance = Math.min(0.16 + wave * 0.012, 0.55);

    if (Math.random() > chance) return;

    const roll = Math.random();
    const type = roll < 0.4 ? "scratch" : (roll < 0.75 ? "scorch" : "dent");

    playerDamageMarks.push({
        x: (Math.random() - 0.5) * 56,
        y: (Math.random() - 0.5) * 56,
        rot: Math.random() * Math.PI * 2,
        size: 4 + Math.random() * 5,
        type: type
    });

}

function drawPlayerDamageMarks() {

    for (let i = 0; i < playerDamageMarks.length; i++) {

        const m = playerDamageMarks[i];

        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.rot);

        if (m.type === "scratch") {

            ctx.strokeStyle = "rgba(20,20,20,0.55)";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(-m.size, -m.size * 0.3);
            ctx.lineTo(m.size, m.size * 0.3);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-m.size * 0.6, m.size * 0.4);
            ctx.lineTo(m.size * 0.6, -m.size * 0.2);
            ctx.stroke();

        } else if (m.type === "scorch") {

            ctx.fillStyle = "rgba(25,20,15,0.4)";
            ctx.beginPath();
            ctx.arc(0, 0, m.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(60,45,35,0.4)";
            ctx.lineWidth = 1;
            ctx.stroke();

        } else {

            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.beginPath();
            ctx.ellipse(0, 0, m.size * 0.6, m.size * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

        }

        ctx.restore();

    }

}

function updatePlayer() {

    let deltaX = mouseX - (x + 40);
    let deltaY = mouseY - (y + 40);
    angle = Math.atan2(deltaY, deltaX);

    if (dashFrames > 0) {

    x += dashDirectionX * 25;
    y += dashDirectionY * 25;

    playerTrails.push({

    x: x,
    y: y,

    angle: angle,

    life: 12

});
    dashFrames--;

}


    if (moveRight) {
        x += speed;
    }

    if (moveLeft) {
        x -= speed;
    }

    if (moveUp) {
        y -= speed;
    }
    if (moveDown) {
        y += speed;
    }

    // Keep the player within the canvas bounds
    if (x < 0) x = 0;
    if (x > canvas.width - PLAYER_SIZE) x = canvas.width - PLAYER_SIZE;
    if (y < 0) y = 0;
    if (y > canvas.height - PLAYER_SIZE) y = canvas.height - PLAYER_SIZE;

    for (let c = 0; c < coverBlocks.length; c++) {

        const block = coverBlocks[c];

        const playerCenterX = x + PLAYER_CENTER;
        const playerCenterY = y + PLAYER_CENTER;

        const halfW = block.width / 2 + PLAYER_HIT_RADIUS - 18;
        const halfH = block.height / 2 + PLAYER_HIT_RADIUS - 18;

        const dx = playerCenterX - block.x;
        const dy = playerCenterY - block.y;

        if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) {

            const overlapX = halfW - Math.abs(dx);
            const overlapY = halfH - Math.abs(dy);

            if (overlapX < overlapY) {
                x += (dx > 0 ? overlapX : -overlapX);
            } else {
                y += (dy > 0 ? overlapY : -overlapY);
            }

        }

    }

    let currentTime = Date.now();

ctx.translate(x + 40, y + 40);

ctx.rotate(angle + recoilRotation);

ctx.translate(-recoilOffset, 0);

// ============================
// PLAYER - HERO, BATTERED BUT FIGHTING
// ============================

const flagSway = Math.sin(Date.now() / 300) * 4;

ctx.globalAlpha = progressFade;

// Small tattered banner trailing from the back - refuses to come down
ctx.fillStyle = "#a8281f";
ctx.beginPath();
ctx.moveTo(-32, -10);
ctx.lineTo(-52, -16 + flagSway);
ctx.lineTo(-44, -2 + flagSway * 0.3);
ctx.lineTo(-52, 8 + flagSway * 0.6);
ctx.lineTo(-32, 10);
ctx.closePath();
ctx.fill();
ctx.strokeStyle = "#5c130e";
ctx.lineWidth = 1.5;
ctx.stroke();

// Main Body - bold chamfered armored block, sturdy stance
ctx.fillStyle = "#c62828";
ctx.beginPath();
ctx.moveTo(-40, -32);
ctx.lineTo(-32, -40);
ctx.lineTo(32, -40);
ctx.lineTo(40, -32);
ctx.lineTo(40, 32);
ctx.lineTo(32, 40);
ctx.lineTo(-32, 40);
ctx.lineTo(-40, 32);
ctx.closePath();
ctx.fill();

ctx.strokeStyle = "black";
ctx.lineWidth = 2;
ctx.stroke();

// Inner Body
ctx.fillStyle = "#ef5350";
ctx.fillRect(-30, -30, 60, 60);

// Determined sash stripe across the chest - a mark of resolve, not decoration
ctx.strokeStyle = "#ffcb3d";
ctx.lineWidth = 6;
ctx.beginPath();
ctx.moveTo(-26, -26);
ctx.lineTo(22, 22);
ctx.stroke();
ctx.strokeStyle = "#7a5400";
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(-26, -26);
ctx.lineTo(22, 22);
ctx.stroke();

// Cockpit / focused gaze
ctx.fillStyle = "#64b5f6";
ctx.beginPath();
ctx.arc(0, 0, 12, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = "#1d3557";
ctx.lineWidth = 1.5;
ctx.stroke();

// Narrowed visor band - steady, unflinching
ctx.fillStyle = "#1d3557";
ctx.fillRect(-10, -3, 20, 6);
ctx.fillStyle = "#bde0ff";
ctx.fillRect(-8, -1.6, 16, 3.2);

// Gun Barrel
ctx.fillStyle = "#444";
ctx.fillRect(0, -5, 45, 10);
ctx.strokeStyle = "black";
ctx.lineWidth = 1.5;
ctx.strokeRect(0, -5, 45, 10);

    if (muzzleFlash > 0) {

    ctx.fillStyle = "orange";

    ctx.beginPath();

    ctx.arc(50, 0, 12, 0, Math.PI * 2);

    ctx.fill();

    muzzleFlash--;

}

// Battle wear: scratches, scorch marks and dents accumulate gradually
// over time as hits land and the waves grow harder - worn down, never broken.
drawPlayerDamageMarks();

ctx.globalAlpha = 1;

recoilOffset *= 0.82;

recoilRotation *= 0.82;

if (recoilOffset < 0.05) {

    recoilOffset = 0;

}

if (Math.abs(recoilRotation) < 0.001) {

    recoilRotation = 0;

}
ctx.restore();
if (dashCooldown > 0) {

    dashCooldown--;

}
}


// =====================
// MACHINE GUN
// =====================
function shootMachineGun() {


    if (!shooting) {

    machineGunSpread *= 0.9;

    if (machineGunSpread < 0.02) {

        machineGunSpread = 0.02;

    }

}
    if (!shooting) return;

    if (currentWeapon !== "machinegun") return;

    if (reloadState.machinegun) return;

    const currentTime = Date.now();

    if (currentTime - lastShotTime < 100) return;

    lastShotTime = currentTime;
    if (ammo <= 0) {

        if (currentTime - lastDryFireTime > 400) {
            playSound(sfx.dryFire);
            lastDryFireTime = currentTime;
        }

        return;
    }

    ammo--; 

    playSound(sfx.machineGun);

    bullets.push({

        x: x + PLAYER_CENTER,
        y: y + PLAYER_CENTER,
      angle: angle + (Math.random() - 0.5) * machineGunSpread,
    weapon: "machinegun",
    distance: 0

    });

    muzzleFlash = 4;
recoilOffset = 4;
targetZoom = 1.015;

recoilRotation += (Math.random() - 0.5) * 0.012;

screenShake = 1;
crosshairGap = 18;

    machineGunSpread += 0.005;

if (machineGunSpread > 0.18) {

    machineGunSpread = 0.18;

}

}

// =====================
//   UPDATE PLAYER BULLETS
// =====================
function updatePlayerBullets() {
   for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.x += Math.cos(bullet.angle) * BULLET_SPEED;
        bullet.y += Math.sin(bullet.angle) * BULLET_SPEED;
        bullet.distance += BULLET_SPEED;

        bulletTrails.push({

    x: bullet.x,
    y: bullet.y,

    life: 8

});
 

  

        for (let j = enemies.length - 1; j >= 0; j--) {
            let enemy = enemies[j];

            let dx = enemy.x - bullet.x;
            let dy = enemy.y - bullet.y;
            let distance = Math.hypot(dx, dy);

            const bulletHitRadius = enemy.type === "boss" ? 55 : (ENEMY_HIT_RADIUS - 5);

            if (distance < bulletHitRadius) {

            if (enemy.type === "boss" && enemy.invulnerable) {
                enemy.flash = 5;
                bullets.splice(i, 1);
                break;
            }

            if (Math.random() < 0.12 + Math.min(wave * 0.005, 0.08)) {

           healthPacks.push({

    x: enemy.x,
    y: enemy.y,

    float: Math.random() * Math.PI * 2,

    spawnTime: Date.now(),
    lifeTime: 6000 + Math.random() * 4000

});

            }

            if (Math.random() < 0.1) {
           ammoPacks.push({

           x: enemy.x,
           y: enemy.y,

float: Math.random() * Math.PI * 2,

spawnTime: Date.now(),
lifeTime: 6000 + Math.random() * 4000
 });

 }

            if (grenades < MAX_GRENADES && Math.random() < 0.04) {

           grenadePacks.push({

           x: enemy.x,
           y: enemy.y,

float: Math.random() * Math.PI * 2,

spawnTime: Date.now(),
lifeTime: 7000 + Math.random() * 4000
 });

 }

            if (!shieldActive && Math.random() < 0.025) {

           shieldPacks.push({

           x: enemy.x,
           y: enemy.y,

float: Math.random() * Math.PI * 2,

spawnTime: Date.now(),
lifeTime: 7000 + Math.random() * 4000
 });

 }

            if (freezeCharges < MAX_FREEZE && Math.random() < 0.03) {

           freezePacks.push({

           x: enemy.x,
           y: enemy.y,

float: Math.random() * Math.PI * 2,

spawnTime: Date.now(),
lifeTime: 7000 + Math.random() * 4000
 });

 }
let damage = 1;
let criticalHit = false;

if (Math.random() < 0.15) {

    damage *= 2;

    criticalHit = true;

}

if (currentWeapon === "shotgun") {

    damage = 2;

}
else if (currentWeapon === "machinegun") {

    damage = 0.6;

}

damage *= getPlayerDamageMultiplier(wave);

enemy.health -= damage;
            enemy.flash = 5;
            const displayDamage = Math.max(1, Math.round(damage));
            damageTexts.push({

    x: enemy.x,
    y: enemy.y,

text: criticalHit ? "CRIT! -" + displayDamage : "-" + displayDamage,

    life: 30

});

            if (enemy.health > 0) {
                playSound(sfx.fleshImpact);
            }

            bullets.splice(i, 1);

    if (enemy.health <= 0) {

    const isBoss = enemy.type === "boss";

    playSound(sfx.enemyDeath);

    score++;
    if (score > highScore) {

    highScore = score;

    localStorage.setItem("highScore", highScore);

}
    scoreTexts.push({

    x: enemy.x,
    y: enemy.y,

    text: isBoss ? "BOSS DOWN" : "+1",

    life: 40

});

    if (!isBoss && score % 10 === 0 && wave < 50) {

        advanceWave();

    }

    bullets.splice(i, 1);

    for (let k = 0; k < 10; k++) {

        particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 20
        });

    }

    screenShake = 6;

shakeX = -Math.cos(angle) * 4;
shakeY = -Math.sin(angle) * 4;

    hitMarker = 6;
    bloodPools.push({

    x: enemy.x,

    y: enemy.y,

    radius: 18 + Math.random() * 8,

    alpha: 0.45

});


for (let b = 0; b < 18; b++) {

    bloodParticles.push({

        x: enemy.x,

        y: enemy.y,

        vx: (Math.random() - 0.5) * 8,

        vy: (Math.random() - 0.5) * 8,

        size: Math.random() * 3 + 2,

        color: Math.random() < 0.5
            ? "#8b0000"
            : "#b30000",

        life: 25

    });

}

    enemies.splice(j, 1);

    deathFlashes.push({

    x: enemy.x,
    y: enemy.y,

    radius: 15,

    life: 12

});

    if (isBoss) {
        checkVictoryCondition();
    } else if (wave >= 50) {
        checkVictoryCondition();
    } else {
        respawnQueue.push({

        time: Date.now() + 500

        });
    }

    break;

}
        }

        }

        if (
    currentWeapon === "shotgun" &&
    bullet.distance > 350
    ) {

    bullets.splice(i, 1);
    continue;

}

        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(bullet.angle);
        ctx.globalAlpha = progressFade;

        if (bullet.weapon === "shotgun") {

            // Small round pellet
            ctx.fillStyle = "#ffb347";
            ctx.shadowColor = "#ff8c00";
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (bullet.weapon === "machinegun") {

            // Thin fast tracer streak
            ctx.fillStyle = "#d6faff";
            ctx.shadowColor = "#4ad6ff";
            ctx.shadowBlur = 7;
            ctx.fillRect(-10, -1.2, 20, 2.4);
            ctx.shadowBlur = 0;

        } else {

            // Pistol: elongated round-tipped slug
            ctx.fillStyle = "yellow";
            ctx.strokeStyle = "#b8860b";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

        }

        ctx.restore();

        if (
            bullet.x > canvas.width ||
            bullet.x < 0 ||
            bullet.y > canvas.height ||
            bullet.y < 0
        ) {
            bullets.splice(i, 1);
        }
    }
}


// =====================
// ENEMY BULLETS
// =====================
function updateEnemyBullets(currentTime) {

    const slowFactor = freezeActive ? FREEZE_SLOW_FACTOR : 1;

   for (let i = enemyBullets.length - 1; i >= 0; i--) {

        let bullet = enemyBullets[i];

        bullet.x += Math.cos(bullet.angle) * 10 * slowFactor;
        bullet.y += Math.sin(bullet.angle) * 10 * slowFactor;

        let blockedByCover = false;

        for (let c = coverBlocks.length - 1; c >= 0; c--) {

            const block = coverBlocks[c];

            if (
                bullet.x > block.x - block.width / 2 &&
                bullet.x < block.x + block.width / 2 &&
                bullet.y > block.y - block.height / 2 &&
                bullet.y < block.y + block.height / 2
            ) {

                block.health--;
                block.flash = 6;

                playSound(sfx.playerDamage);

                for (let k = 0; k < 6; k++) {

                    particles.push({
                        x: bullet.x,
                        y: bullet.y,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        life: 14
                    });

                }

                if (block.health <= 0) {
                    coverBlocks.splice(c, 1);
                }

                enemyBullets.splice(i, 1);
                blockedByCover = true;
                break;

            }

        }

        if (blockedByCover) continue;

        let dx = (x + 40) - bullet.x;
        let dy = (y + 40) - bullet.y;
        let distance = Math.hypot(dx, dy);

        if (distance < PLAYER_HIT_RADIUS) {

            if (shieldActive) {

                shieldBlockFlash = 10;
                enemyBullets.splice(i, 1);

                for (let k = 0; k < 4; k++) {

                    particles.push({
                        x: bullet.x,
                        y: bullet.y,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        life: 12
                    });

                }

                continue;

            }

            playerHealth -= (bullet.damage || 10);
            healthFlash = 8;
            lastHitTime = Date.now();
            enemyBullets.splice(i, 1);

            if (playerHealth > 0) {
                playSound(sfx.playerDamage);
            }

            addPlayerDamageMark();
        }

        if (playerHealth <= 0) {
            playerHealth = 0;
            triggerGameOver();
        }

        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(bullet.angle);

        if (bullet.type === "boss") {

            // Heavy black-and-yellow tracer round
            ctx.fillStyle = "#ffd400";
            ctx.shadowColor = "#ffd400";
            ctx.shadowBlur = 8;
            ctx.fillRect(-10, -3, 20, 6);
            ctx.fillStyle = "#141414";
            ctx.fillRect(-4, -3, 8, 6);
            ctx.shadowBlur = 0;

        } else if (bullet.type === "tank") {

            // Chunky thick slug
            ctx.fillStyle = "red";
            ctx.shadowColor = "#ff4d4d";
            ctx.shadowBlur = 6;
            ctx.fillRect(-7, -4, 14, 8);
            ctx.shadowBlur = 0;

        } else if (bullet.type === "scout") {

            // Small fast spike/triangle
            ctx.fillStyle = "yellow";
            ctx.shadowColor = "#fff066";
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.moveTo(7, 0);
            ctx.lineTo(-5, -3);
            ctx.lineTo(-5, 3);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

        } else {

            // Grunt: diamond-shaped pellet
            ctx.fillStyle = "orange";
            ctx.shadowColor = "#ffae42";
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.moveTo(6, 0);
            ctx.lineTo(0, -4);
            ctx.lineTo(-6, 0);
            ctx.lineTo(0, 4);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

        }

        ctx.restore();

        if (
            bullet.x > canvas.width ||
            bullet.x < 0 ||
            bullet.y > canvas.height ||
            bullet.y < 0
        ) {
            enemyBullets.splice(i, 1);
        }
    }
}



// =====================
// UPDATE ENEMIES
// =====================
// Traces (beginPath + path only, no fill/stroke) the body silhouette for a
// given enemy type at the given radius, in the enemy's local rotated frame
// (facing +x). Used for both the fill and the tier-color outline so they
// always stay in sync.
function traceEnemyShape(type, radius) {

    ctx.beginPath();

    if (type === "tank") {

        // Big, heavily rounded hull - like a tank body with chamfered armor plating.
        const r = radius;
        const c = r * 0.5;

        ctx.moveTo(-r + c, -r);
        ctx.lineTo(r - c, -r);
        ctx.arcTo(r, -r, r, -r + c, c);
        ctx.lineTo(r, r - c);
        ctx.arcTo(r, r, r - c, r, c);
        ctx.lineTo(-r + c, r);
        ctx.arcTo(-r, r, -r, r - c, c);
        ctx.lineTo(-r, -r + c);
        ctx.arcTo(-r, -r, -r + c, -r, c);
        ctx.closePath();

    } else if (type === "scout") {

        // Streamlined "fast runner" silhouette (previously used by the
        // grunt), reused here for the scout but at a larger radius.
        const r = radius;

        ctx.moveTo(r * 1.2, 0);
        ctx.lineTo(r * 0.3, -r * 0.75);
        ctx.lineTo(-r * 0.9, -r * 0.5);
        ctx.lineTo(-r * 1.1, 0);
        ctx.lineTo(-r * 0.9, r * 0.5);
        ctx.lineTo(r * 0.3, r * 0.75);
        ctx.closePath();

    } else {

        // Grunt, boss / default - circular silhouette.
        ctx.arc(0, 0, radius, 0, Math.PI * 2);

    }

}

function updateEnemies(currentTime, frozen) {

   const slowFactor = freezeActive ? FREEZE_SLOW_FACTOR : 1;
   const effectiveShootCooldown = freezeActive ? enemyShootCooldown / FREEZE_SLOW_FACTOR : enemyShootCooldown;

   anyEnemyMoving = false;

   for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy.type === "boss") {
            updateBossEntity(enemy, currentTime, frozen);
            if (enemy.markForRemoval) {
                enemies.splice(i, 1);
                i--;
            }
            continue;
        }

        let enemyDx = (x + 40) - enemy.x;
        let enemyDy = (y + 40) - enemy.y;
        let enemyAngle = Math.atan2(enemyDy, enemyDx);
        let enemyDistance = Math.hypot(enemyDx, enemyDy);

        if (!frozen) {

        const enemyOwnStopDistance = enemy.shootDistance || enemyStopDistance;

        if (enemyDistance > enemyOwnStopDistance) {
            enemy.x += Math.cos(enemyAngle) * enemy.speed * slowFactor;
            enemy.y += Math.sin(enemyAngle) * enemy.speed * slowFactor;
            anyEnemyMoving = true;
        }

        for (let c = 0; c < coverBlocks.length; c++) {

            const block = coverBlocks[c];

            const halfW = block.width / 2 + ENEMY_HIT_RADIUS - 10;
            const halfH = block.height / 2 + ENEMY_HIT_RADIUS - 10;

            const edx = enemy.x - block.x;
            const edy = enemy.y - block.y;

            if (Math.abs(edx) < halfW && Math.abs(edy) < halfH) {

                const overlapX = halfW - Math.abs(edx);
                const overlapY = halfH - Math.abs(edy);

                if (overlapX < overlapY) {
                    enemy.x += (edx > 0 ? overlapX : -overlapX);
                } else {
                    enemy.y += (edy > 0 ? overlapY : -overlapY);
                }

            }

        }

        if (
            enemyDistance <= enemyOwnStopDistance &&
            currentTime - enemy.lastShot >  effectiveShootCooldown
        ) {
            enemyBullets.push({
                x: enemy.x,
                y: enemy.y,
                angle: enemyAngle,
                damage: enemy.bulletDamage,
                type: enemy.type
            });
            enemy.lastShot = currentTime;
        }

        }


        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemyAngle);
        let scale = 1;

if (enemy.spawnAnimation > 0) {

    scale = 1 - (enemy.spawnAnimation / 20);

    enemy.spawnAnimation--;

}

ctx.scale(scale, scale);

        if (enemy.flash > 0) {

    ctx.fillStyle = "white";
    enemy.flash--;

}
else {

    ctx.fillStyle = enemy.color;

}

        // Per-type silhouette: tank = big rounded hull, grunt = streamlined
        // runner arrow (same footprint as before), scout = enlarged boxy hull.
        // Boss/default keep the original circular silhouette.
        let radius = 25;

        if (enemy.type === "boss") {

    radius = 45;

        } else if (enemy.type === "tank") {

    radius = 36;

        } else if (enemy.type === "scout") {

    radius = 32;

        } else if (enemy.type === "grunt") {

    radius = 29;

        }

        traceEnemyShape(enemy.type, radius);
        ctx.fill();

        if (enemy.tierColor && enemy.tierColor !== "#ffffff") {

            ctx.lineWidth = 3;
            ctx.strokeStyle = enemy.tierColor;
            ctx.shadowColor = enemy.tierColor;
            ctx.shadowBlur = 10;
            traceEnemyShape(enemy.type, radius);
            ctx.stroke();
            ctx.shadowBlur = 0;

        }

// Enemy Core

ctx.fillStyle = "white";

ctx.beginPath();
let coreRadius = 8;

if (enemy.type === "tank") {

    coreRadius = 15;

}
else if (enemy.type === "scout") {

    coreRadius = 5;

}

ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);

ctx.fill();

if (enemy.type === "tank") {

    ctx.lineWidth = 4;

    ctx.strokeStyle = "#550000";

    ctx.stroke();

}

  
// Enemy Health Bar

let barWidth = enemy.type === "boss" ? 70 : 40;

// Bar sits just above the enemy's own body, so its vertical offset needs
// to track each type's radius instead of a fixed value.
const barTopY = -(radius + 13);

ctx.fillStyle = "red";
ctx.fillRect(-barWidth / 2, barTopY, barWidth, 5);

ctx.fillStyle = "lime";
ctx.fillRect(-barWidth / 2,barTopY,(Math.max(enemy.health, 0) / enemy.maxHealth) * barWidth,5);

ctx.strokeStyle = "white";
ctx.strokeRect(-barWidth / 2, barTopY, barWidth, 5);
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(radius + 10, 0);

ctx.strokeStyle = "white";
ctx.stroke();

ctx.restore();

   }
    

}




// =====================
// Explosion
// =====================
function updateParticles() {

    for (let i = particles.length - 1; i >= 0; i--) {

        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.life--;

        ctx.globalAlpha = particle.life / 20;

        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;

        if (particle.life <= 0) {
            particles.splice(i, 1);
        }

    }

}

// =====================
// Health Packs
// =====================

function regenPlayerHealth() {
    if (gameOver) return;
    if (playerHealth <= 0 || playerHealth >= maxPlayerHealth) return;

    // Only regen after a few seconds without taking a hit, so it
    // rewards surviving/kiting rather than tanking nonstop.
    if (Date.now() - lastHitTime > 4000) {
        playerHealth += 0.05;
        if (playerHealth > maxPlayerHealth) playerHealth = maxPlayerHealth;
    }
}

function updateHealthPacks() {

    for (let i = healthPacks.length - 1; i >= 0; i--) {

        let pack = healthPacks[i];
        pack.float += 0.08;

        let age = Date.now() - pack.spawnTime;

        if (age > pack.lifeTime) {

            healthPacks.splice(i, 1);

            continue;

        }

        let fadeAlphaPack = 1;
        let timeLeft = pack.lifeTime - age;

        if (timeLeft < 1500) {

            fadeAlphaPack = timeLeft / 1500;

        }

        let drawY = pack.y + Math.sin(pack.float) * 5;

        let dx = (x + PLAYER_CENTER) - pack.x;
        let dy = (y + PLAYER_CENTER) - pack.y;

        let distance = Math.hypot(dx, dy);

        if (distance < 40) {

            playerHealth += 20;

            if (playerHealth > maxPlayerHealth) {

                playerHealth = maxPlayerHealth;

            }

            playSound(sfx.itemPickup);

            healthPacks.splice(i, 1);

            continue;

        }

        ctx.globalAlpha = fadeAlphaPack;

        ctx.shadowColor = "hotpink";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "pink";

        ctx.beginPath();

        ctx.arc(pack.x, drawY, 12, 0, Math.PI * 2);

        ctx.fill();

        ctx.fillStyle = "white";

        ctx.font = "16px Arial";

        ctx.fillText("+", pack.x - 5, drawY + 5);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

    }

}

// =====================
// Ammo Pack
// =====================
function updateAmmoPacks() {

    for (let i = ammoPacks.length - 1; i >= 0; i--) {

        let pack = ammoPacks[i];
        pack.float += 0.08;

        let age = Date.now() - pack.spawnTime;

        if (age > pack.lifeTime) {

            ammoPacks.splice(i, 1);

            continue;

        }

        let fadeAlphaPack = 1;
        let timeLeft = pack.lifeTime - age;

        if (timeLeft < 1500) {

            fadeAlphaPack = timeLeft / 1500;

        }

        let drawY = pack.y + Math.sin(pack.float) * 5;

        let dx = (x + PLAYER_CENTER) - pack.x;
        let dy = (y + PLAYER_CENTER) - pack.y;

        let distance = Math.hypot(dx, dy);

        if (distance < 40) {

            ammo += 10;

            if (ammo > maxAmmo) {

                ammo = maxAmmo;

            }

            playSound(sfx.ammoGrenadePickup);

            ammoPacks.splice(i, 1);

            continue;

        }


        ctx.globalAlpha = fadeAlphaPack;

        ctx.shadowColor = "cyan";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "cyan";

        ctx.beginPath();
        ctx.arc(pack.x, drawY, 10, 0, Math.PI * 2)
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.fillText("A", pack.x - 5, drawY + 5);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

    }

}

// =====================
// Grenade Pack
// =====================
function updateGrenadePacks() {

    for (let i = grenadePacks.length - 1; i >= 0; i--) {

        let pack = grenadePacks[i];
        pack.float += 0.08;

        let age = Date.now() - pack.spawnTime;

        if (age > pack.lifeTime) {

            grenadePacks.splice(i, 1);

            continue;

        }

        let fadeAlphaPack = 1;
        let timeLeft = pack.lifeTime - age;

        if (timeLeft < 1500) {

            fadeAlphaPack = timeLeft / 1500;

        }

        let drawY = pack.y + Math.sin(pack.float) * 5;

        let dx = (x + PLAYER_CENTER) - pack.x;
        let dy = (y + PLAYER_CENTER) - pack.y;

        let distance = Math.hypot(dx, dy);

        if (distance < 40) {

            grenades++;

            if (grenades > MAX_GRENADES) {

                grenades = MAX_GRENADES;

            }

            playSound(sfx.ammoGrenadePickup);

            grenadePacks.splice(i, 1);

            continue;

        }

        ctx.globalAlpha = fadeAlphaPack;

        ctx.shadowColor = "#9bc53d";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#5a7a2e";

        ctx.beginPath();
        ctx.arc(pack.x, drawY, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#2e3d17";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#9bc53d";
        ctx.fillRect(pack.x - 2, drawY - 16, 4, 7);

        ctx.fillStyle = "white";
        ctx.font = "bold 13px Rajdhani";
        ctx.fillText("G", pack.x - 4, drawY + 4);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

    }

}

// =====================
// Shield Pack (instant pickup)
// =====================
function updateShieldPacks() {

    for (let i = shieldPacks.length - 1; i >= 0; i--) {

        let pack = shieldPacks[i];
        pack.float += 0.08;

        let age = Date.now() - pack.spawnTime;

        if (age > pack.lifeTime) {

            shieldPacks.splice(i, 1);

            continue;

        }

        let fadeAlphaPack = 1;
        let timeLeft = pack.lifeTime - age;

        if (timeLeft < 1500) {

            fadeAlphaPack = timeLeft / 1500;

        }

        let drawY = pack.y + Math.sin(pack.float) * 5;

        let dx = (x + PLAYER_CENTER) - pack.x;
        let dy = (y + PLAYER_CENTER) - pack.y;

        let distance = Math.hypot(dx, dy);

        if (distance < 40) {

            // Instant activation on pickup
            shieldActive = true;
            shieldEndTime = Date.now() + SHIELD_DURATION;

            playSound(sfx.shieldPickup);

            shieldPacks.splice(i, 1);

            continue;

        }

        ctx.globalAlpha = fadeAlphaPack;

        ctx.shadowColor = "#3cff6b";
        ctx.shadowBlur = 22;
        ctx.fillStyle = "#1f7a3a";

        ctx.beginPath();
        ctx.arc(pack.x, drawY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#3cff6b";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Little shield glyph
        ctx.beginPath();
        ctx.moveTo(pack.x, drawY - 6);
        ctx.lineTo(pack.x + 5, drawY - 3);
        ctx.lineTo(pack.x + 5, drawY + 3);
        ctx.lineTo(pack.x, drawY + 7);
        ctx.lineTo(pack.x - 5, drawY + 3);
        ctx.lineTo(pack.x - 5, drawY - 3);
        ctx.closePath();
        ctx.fillStyle = "#9bffb8";
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

    }

}

// =====================
// Freeze Pack (stored, activated with F)
// =====================
function updateFreezePacks() {

    for (let i = freezePacks.length - 1; i >= 0; i--) {

        let pack = freezePacks[i];
        pack.float += 0.08;

        let age = Date.now() - pack.spawnTime;

        if (age > pack.lifeTime) {

            freezePacks.splice(i, 1);

            continue;

        }

        let fadeAlphaPack = 1;
        let timeLeft = pack.lifeTime - age;

        if (timeLeft < 1500) {

            fadeAlphaPack = timeLeft / 1500;

        }

        let drawY = pack.y + Math.sin(pack.float) * 5;

        let dx = (x + PLAYER_CENTER) - pack.x;
        let dy = (y + PLAYER_CENTER) - pack.y;

        let distance = Math.hypot(dx, dy);

        if (distance < 40) {

            freezeCharges++;

            if (freezeCharges > MAX_FREEZE) {

                freezeCharges = MAX_FREEZE;

            }

            playSound(sfx.itemPickup);

            freezePacks.splice(i, 1);

            continue;

        }

        ctx.globalAlpha = fadeAlphaPack;

        ctx.shadowColor = "#4ad6ff";
        ctx.shadowBlur = 22;
        ctx.fillStyle = "#1a5f7a";

        ctx.beginPath();
        ctx.arc(pack.x, drawY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#4ad6ff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Snowflake-ish glyph
        ctx.strokeStyle = "#dff8ff";
        ctx.lineWidth = 2;
        for (let s = 0; s < 3; s++) {
            const a = (Math.PI / 3) * s;
            ctx.beginPath();
            ctx.moveTo(pack.x - Math.cos(a) * 6, drawY - Math.sin(a) * 6);
            ctx.lineTo(pack.x + Math.cos(a) * 6, drawY + Math.sin(a) * 6);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

    }

}

function activateFreeze() {

    if (freezeCharges <= 0) return;
    if (freezeActive) return;

    freezeCharges--;
    freezeActive = true;
    freezeEndTime = Date.now() + FREEZE_DURATION;

    playSound(sfx.freeze);

}

// =====================
// Freeze Screen Overlay (subtle blue waves)
// =====================
function drawFreezeOverlay() {

    const t = Date.now() / 1000;

    ctx.save();

    // Faint base tint
    ctx.fillStyle = "rgba(74, 214, 255, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = "lighter";

    const waveCount = 3;

    for (let w = 0; w < waveCount; w++) {

        const amp = 14 + w * 7;
        const speed = 1.1 + w * 0.35;
        const yBase = canvas.height * (0.22 + w * 0.3);
        const alpha = 0.05 - w * 0.012;

        ctx.beginPath();

        for (let px = 0; px <= canvas.width; px += 18) {

            const wy = yBase + Math.sin(px * 0.012 + t * speed + w * 2.1) * amp;

            if (px === 0) {
                ctx.moveTo(px, wy);
            } else {
                ctx.lineTo(px, wy);
            }

        }

        ctx.strokeStyle = "rgba(120, 220, 255, " + alpha + ")";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#4ad6ff";
        ctx.shadowBlur = 14;
        ctx.stroke();

    }

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();

}

// =====================
// Shield Visual Effect (player buff)
// =====================
function updatePlayerShield() {

    if (shieldBlockFlash > 0) shieldBlockFlash--;

    if (!shieldActive) return;

    if (Date.now() >= shieldEndTime) {

        shieldActive = false;
        return;

    }

    const timeLeft = shieldEndTime - Date.now();
    const totalProgress = 1 - (timeLeft / SHIELD_DURATION); // 0 -> 1 over the shield's life

    const centerX = x + PLAYER_CENTER;
    const centerY = y + PLAYER_CENTER;

    // Ring fades inward: starts wide, shrinks toward the player over time
    const outerRadius = 72 - totalProgress * 16;
    const innerFadeRadius = 50 + totalProgress * 10;

    // Slow blink: subtle pulsing alpha
    const blink = 0.45 + 0.25 * Math.sin(Date.now() / 280);

    // Extra urgency flicker in the last second
    const urgentFlicker = timeLeft < 1000
        ? (0.5 + 0.5 * Math.sin(Date.now() / 60))
        : 1;

    const rotation = Date.now() / 900;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Soft radial glow fill, fading inward
    const gradient = ctx.createRadialGradient(0, 0, innerFadeRadius * 0.3, 0, 0, outerRadius);
    gradient.addColorStop(0, "rgba(60,255,107,0)");
    gradient.addColorStop(0.55, "rgba(60,255,107," + (0.09 * blink * urgentFlicker) + ")");
    gradient.addColorStop(1, "rgba(60,255,107,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Rotating dashed inner ring
    ctx.save();
    ctx.rotate(rotation);
    ctx.globalAlpha = 0.55 * blink * urgentFlicker;
    ctx.strokeStyle = "#9bffb8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius - 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Secondary counter-rotating dashed ring for a hex-shield feel
    ctx.save();
    ctx.rotate(-rotation * 1.4);
    ctx.globalAlpha = 0.35 * blink * urgentFlicker;
    ctx.strokeStyle = "#3cff6b";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 14]);
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius - 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Main solid outer ring with glow
    ctx.globalAlpha = blink * urgentFlicker;
    ctx.strokeStyle = "#3cff6b";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#3cff6b";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Orbiting sparkles around the ring
    const sparkleCount = 6;

    for (let s = 0; s < sparkleCount; s++) {

        const sAngle = rotation * -1.6 + (Math.PI * 2 / sparkleCount) * s;
        const sx = Math.cos(sAngle) * (outerRadius - 2);
        const sy = Math.sin(sAngle) * (outerRadius - 2);

        ctx.globalAlpha = 0.75 * blink * urgentFlicker;
        ctx.fillStyle = "#d6ffe0";
        ctx.shadowColor = "#3cff6b";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

    }

    if (shieldBlockFlash > 0) {

        ctx.globalAlpha = shieldBlockFlash / 10;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

    }

    ctx.restore();

}

// =====================
// Throwable Grenades
// =====================
function throwGrenade() {

    if (grenades <= 0) return;

    grenades--;

    playSound(sfx.grenadeThrow);

    const startX = x + PLAYER_CENTER;
    const startY = y + PLAYER_CENTER;

    let targetX = mouseX;
    let targetY = mouseY;

    // Cap throw distance so grenades can't be lobbed across the whole map
    const maxThrowDistance = 480;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const throwDist = Math.hypot(dx, dy);

    if (throwDist > maxThrowDistance) {
        const ratio = maxThrowDistance / throwDist;
        targetX = startX + dx * ratio;
        targetY = startY + dy * ratio;
    }

    thrownGrenades.push({
        startX: startX,
        startY: startY,
        x: startX,
        y: startY,
        targetX: targetX,
        targetY: targetY,
        frame: 0,
        totalFrames: GRENADE_FUSE_FRAMES,
        rotation: 0
    });

}

function updateThrownGrenades() {

    for (let i = thrownGrenades.length - 1; i >= 0; i--) {

        const g = thrownGrenades[i];

        g.frame += (freezeActive ? FREEZE_SLOW_FACTOR : 1);
        g.rotation += 0.3 * (freezeActive ? FREEZE_SLOW_FACTOR : 1);

        const progress = Math.min(g.frame / g.totalFrames, 1);

        // Simple parabolic arc for the throw animation
        g.x = g.startX + (g.targetX - g.startX) * progress;
        g.y = g.startY + (g.targetY - g.startY) * progress;
        g.arcHeight = Math.sin(progress * Math.PI) * 60;

        if (progress >= 1) {

            explodeGrenade(g.x, g.y, g.playerDamageMultiplier || 1);
            thrownGrenades.splice(i, 1);
            continue;

        }

        // Draw shadow on the ground
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.ellipse(g.x, g.y, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        const drawY = g.y - g.arcHeight;

        ctx.save();
        ctx.translate(g.x, drawY);
        ctx.rotate(g.rotation);

        ctx.fillStyle = "#3a4a2e";
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#1d2615";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#9bc53d";
        ctx.fillRect(-2, -13, 4, 6);

        ctx.restore();

    }

}

function explodeGrenade(gx, gy, playerDamageMultiplier) {

    if (playerDamageMultiplier === undefined) playerDamageMultiplier = 1;

    screenShake = 14;

    playSound(sfx.grenadeBlast);

    explosionEffects.push({
        x: gx,
        y: gy,
        radius: 0,
        maxRadius: GRENADE_KILL_RADIUS,
        life: 22,
        maxLife: 22
    });

    // Explosion particles
    for (let k = 0; k < 30; k++) {

        particles.push({
            x: gx,
            y: gy,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 26
        });

    }

    // Damage enemies in radius, with falloff based on distance
    for (let j = enemies.length - 1; j >= 0; j--) {

        const enemy = enemies[j];

        const dist = Math.hypot(enemy.x - gx, enemy.y - gy);

        if (dist > GRENADE_KILL_RADIUS) continue;

        if (enemy.type === "boss" && enemy.invulnerable) {
            enemy.flash = 8;
            continue;
        }

        const falloff = 1 - dist / GRENADE_KILL_RADIUS;
        const damage = Math.max(1, Math.round(GRENADE_MAX_DAMAGE * falloff));

        enemy.health -= damage;
        enemy.flash = 8;

        damageTexts.push({
            x: enemy.x,
            y: enemy.y,
            text: "-" + damage,
            life: 30
        });

        if (enemy.health > 0) {
            playSound(sfx.fleshImpact);
        }

        if (enemy.health <= 0) {

            const isBoss = enemy.type === "boss";

            playSound(sfx.enemyDeath);

            score++;

            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }

            scoreTexts.push({
                x: enemy.x,
                y: enemy.y,
                text: isBoss ? "BOSS DOWN" : "+1",
                life: 40
            });

            if (!isBoss && score % 10 === 0 && wave < 50) {

                advanceWave();

            }

            for (let b = 0; b < 18; b++) {

                bloodParticles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    size: Math.random() * 3 + 2,
                    color: Math.random() < 0.5 ? "#8b0000" : "#b30000",
                    life: 25
                });

            }

            bloodPools.push({
                x: enemy.x,
                y: enemy.y,
                radius: 18 + Math.random() * 8,
                alpha: 0.45
            });

            deathFlashes.push({
                x: enemy.x,
                y: enemy.y,
                radius: 15,
                life: 12
            });

            enemies.splice(j, 1);

            if (isBoss) {
                checkVictoryCondition();
            } else if (wave >= 50) {
                checkVictoryCondition();
            } else {
                respawnQueue.push({
                    time: Date.now() + 500
                });
            }

        }

    }

    // Damage the player if they're caught too close to the blast
    const playerDist = Math.hypot((x + PLAYER_CENTER) - gx, (y + PLAYER_CENTER) - gy);

    if (playerDist <= GRENADE_PLAYER_RADIUS) {

        const playerFalloff = 1 - playerDist / GRENADE_PLAYER_RADIUS;
        const playerDamage = Math.round(GRENADE_PLAYER_MAX_DAMAGE * playerFalloff * playerDamageMultiplier);

        playerHealth -= playerDamage;
        healthFlash = 10;
        lastHitTime = Date.now();

        if (playerHealth <= 0) {
            playerHealth = 0;
            triggerGameOver();
        }

    }

}



function updateDamageTexts() {

    for (let i = damageTexts.length - 1; i >= 0; i--) {

        let text = damageTexts[i];

        text.y -= 1;
        text.life--;

        ctx.globalAlpha = text.life / 30;

if (text.text.includes("CRIT")) {

ctx.fillStyle = "gold";

}
else {

    ctx.fillStyle = "white";

}
        ctx.font = "20px Arial";
        ctx.fillText(text.text, text.x, text.y);

        ctx.globalAlpha = 1;

        if (text.life <= 0) {

            damageTexts.splice(i, 1);

        }

    }

}

// =====================
// DRAW Wave
// =====================
function drawWaveText() {

    if (waveTextTimer <= 0) return;

    // Dark overlay
    ctx.fillStyle = "rgba(0,0,0," + waveOverlayAlpha + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Wave text
    ctx.fillStyle = "white";
    ctx.font = "70px Arial";
    ctx.textAlign = "center";
    ctx.globalAlpha = progressFade;

    ctx.fillText(
        "WAVE " + wave,
        canvas.width / 2,
        canvas.height / 2
    );

    if (getBoss()) {

        ctx.font = "600 26px Rajdhani, Arial";
        ctx.fillStyle = "#ffd400";
        ctx.fillText(
            wave === 50 ? "THE COMMANDER - FINISH IT" : "ARMORED COMMANDER INCOMING",
            canvas.width / 2,
            canvas.height / 2 + 54
        );

    }

    ctx.globalAlpha = 1;

    waveOverlayAlpha *= 0.98;

    waveTextTimer--;

}

// =====================
// Update Score
// =====================
function updateScoreTexts() {

    for (let i = scoreTexts.length - 1; i >= 0; i--) {

        let text = scoreTexts[i];

        text.y -= 0.8;
        text.life--;

        ctx.globalAlpha = text.life / 40;

        ctx.fillStyle = "gold";
        ctx.font = "24px Arial";
        ctx.fillText(text.text, text.x, text.y);

        ctx.globalAlpha = 1;

        if (text.life <= 0) {

            scoreTexts.splice(i, 1);

        }

    }

}

// =====================
// Bullet Trail
// =====================
function updateBulletTrails() {

    for (let i = bulletTrails.length - 1; i >= 0; i--) {

        let trail = bulletTrails[i];

        trail.life--;

        ctx.globalAlpha = trail.life / 8;

        ctx.fillStyle = "yellow";

        ctx.beginPath();
        ctx.arc(trail.x, trail.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;

        if (trail.life <= 0) {

            bulletTrails.splice(i, 1);

        }

    }

}

// =====================
// Player trail
// =====================



function updatePlayerTrails() {

    for (let i = playerTrails.length - 1; i >= 0; i--) {

        let trail = playerTrails[i];

        trail.life--;

        ctx.save();

        ctx.globalAlpha = trail.life / 12;

        ctx.translate(trail.x + 40, trail.y + 40);

        ctx.rotate(trail.angle);

        ctx.fillStyle = "#ef5350";

        ctx.fillRect(-30, -30, 60, 60);

        ctx.restore();

        ctx.globalAlpha = 1;

        if (trail.life <= 0) {

            playerTrails.splice(i, 1);

        }

    }

}

// =====================
// Death Flash
// =====================
function updateExplosionEffects() {

    for (let i = explosionEffects.length - 1; i >= 0; i--) {

        const ex = explosionEffects[i];

        ex.life--;

        const progress = 1 - ex.life / ex.maxLife;

        // Fast outward growth (ease-out) so it covers the kill radius almost immediately
        ex.radius = ex.maxRadius * Math.min(1, progress * 2.2);

        const fadeAlpha = Math.max(0, ex.life / ex.maxLife);

        // Filled blast covering the whole kill area
        const gradient = ctx.createRadialGradient(
            ex.x, ex.y, 0,
            ex.x, ex.y, ex.radius
        );

        gradient.addColorStop(0, "rgba(255, 220, 120, " + (0.55 * fadeAlpha) + ")");
        gradient.addColorStop(0.5, "rgba(255, 140, 40, " + (0.35 * fadeAlpha) + ")");
        gradient.addColorStop(1, "rgba(255, 60, 0, 0)");

        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
        ctx.fill();

        // Bright rim outlining exactly how far the kill radius reaches
        ctx.globalAlpha = fadeAlpha;
        ctx.strokeStyle = "#ffd27a";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1;

        if (ex.life <= 0) {

            explosionEffects.splice(i, 1);

        }

    }

}

function updateDeathFlashes() {

    for (let i = deathFlashes.length - 1; i >= 0; i--) {

        let flash = deathFlashes[i];

        flash.radius += 3;

        flash.life--;

        ctx.globalAlpha = flash.life / 12;

        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1;

        if (flash.life <= 0) {

            deathFlashes.splice(i, 1);

        }

    }

}

// =====================
// Blood
// =====================
function updateBlood() {

    for (let i = bloodPools.length - 1; i >= 0; i--) {

        let pool = bloodPools[i];

        ctx.globalAlpha = pool.alpha;

        ctx.fillStyle = "#4b0000";

        ctx.beginPath();

        ctx.arc(
            pool.x,
            pool.y,
            pool.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.globalAlpha = 1;

        pool.alpha -= 0.0006;

        if (pool.alpha <= 0) {

            bloodPools.splice(i, 1);

        }

    }

    for (let i = bloodParticles.length - 1; i >= 0; i--) {

        let blood = bloodParticles[i];

        blood.x += blood.vx;

        blood.y += blood.vy;

        blood.vx *= 0.96;

        blood.vy *= 0.96;

        blood.life--;

        ctx.globalAlpha = blood.life / 25;

        ctx.fillStyle = blood.color;

        ctx.beginPath();

        ctx.arc(
            blood.x,
            blood.y,
            blood.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.globalAlpha = 1;

        if (blood.life <= 0) {

            bloodParticles.splice(i, 1);

        }

    }

}

// =====================
// Update Respawn 
// =====================
function updateRespawns() {

    const currentTime = Date.now();

    for (let i = respawnQueue.length - 1; i >= 0; i--) {

        if (currentTime >= respawnQueue[i].time) {

            spawnEnemy();

            respawnQueue.splice(i, 1);

        }

    }

}
// =====================
// DRAW Crate
// =====================
function drawCrate(x, y) {

    floorCtx.fillStyle = "#3b2d20";
    floorCtx.fillRect(x, y, 46, 46);

    floorCtx.strokeStyle = "#5d4630";
    floorCtx.lineWidth = 3;
    floorCtx.strokeRect(x, y, 46, 46);

    floorCtx.beginPath();
    floorCtx.moveTo(x, y);
    floorCtx.lineTo(x + 46, y + 46);

    floorCtx.moveTo(x + 46, y);
    floorCtx.lineTo(x, y + 46);

    floorCtx.stroke();

}



// =====================
// DRAW FLOOR
// =====================
function drawFloor() {

    ctx.drawImage(floorCanvas, 0, 0);

}

// =====================
// Draw Cover Blocks
// =====================
function drawCoverBlocks() {

    for (let i = 0; i < coverBlocks.length; i++) {

        const block = coverBlocks[i];
        const dmgRatio = block.health / block.maxHealth;

        ctx.save();
        ctx.translate(block.x, block.y);

        // Drop shadow
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(
            -block.width / 2 + 5,
            -block.height / 2 + 7,
            block.width,
            block.height
        );

        // Main metal body
        ctx.fillStyle = dmgRatio > 0.5 ? "#3a3a3a" : "#332626";
        ctx.fillRect(
            -block.width / 2,
            -block.height / 2,
            block.width,
            block.height
        );

        // Hazard stripe band along the top
        ctx.save();
        ctx.beginPath();
        ctx.rect(-block.width / 2, -block.height / 2, block.width, 10);
        ctx.clip();

        for (let s = -block.width; s < block.width; s += 14) {

            ctx.fillStyle = ((s / 14) % 2 === 0) ? "#ff8f00" : "#1a1a1a";

            ctx.beginPath();
            ctx.moveTo(s, -block.height / 2 - 4);
            ctx.lineTo(s + 14, -block.height / 2 - 4);
            ctx.lineTo(s + 4, -block.height / 2 + 14);
            ctx.lineTo(s - 10, -block.height / 2 + 14);
            ctx.fill();

        }

        ctx.restore();

        // Inner armor plate
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(
            -block.width / 2 + 8,
            -block.height / 2 + 14,
            block.width - 16,
            block.height - 22
        );

        // Center emblem to match player's cockpit accent
        ctx.fillStyle = "#c62828";
        ctx.fillRect(-10, -10, 20, 20);
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        ctx.strokeRect(-10, -10, 20, 20);

        // Rivets at corners
        ctx.fillStyle = "#1a1a1a";
        const rivetOffsets = [
            [-block.width / 2 + 7, -block.height / 2 + 7],
            [block.width / 2 - 7, -block.height / 2 + 7],
            [-block.width / 2 + 7, block.height / 2 - 7],
            [block.width / 2 - 7, block.height / 2 - 7]
        ];

        for (let r = 0; r < rivetOffsets.length; r++) {
            ctx.beginPath();
            ctx.arc(rivetOffsets[r][0], rivetOffsets[r][1], 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Damage cracks once it's taken some hits
        if (dmgRatio < 0.7) {

            ctx.strokeStyle = "rgba(0,0,0,0.65)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-12, -block.height / 2 + 12);
            ctx.lineTo(4, -2);
            ctx.lineTo(-6, block.height / 2 - 10);
            ctx.stroke();

        }

        if (dmgRatio < 0.35) {

            ctx.strokeStyle = "rgba(0,0,0,0.65)";
            ctx.beginPath();
            ctx.moveTo(block.width / 2 - 10, -block.height / 2 + 16);
            ctx.lineTo(6, 6);
            ctx.stroke();

        }

        // Outline
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            -block.width / 2,
            -block.height / 2,
            block.width,
            block.height
        );

        // Hit flash
        if (block.flash > 0) {

            ctx.fillStyle = "rgba(255,255,255," + (block.flash / 6) + ")";
            ctx.fillRect(
                -block.width / 2,
                -block.height / 2,
                block.width,
                block.height
            );
            block.flash--;

        }

        ctx.restore();

    }

}


// =====================
// Generate Floor
// =====================
function generateFloor() {

    const tileSize = 64;

    for (let x = 0; x < floorCanvas.width; x += tileSize) {

        for (let y = 0; y < floorCanvas.height; y += tileSize) {

            floorCtx.fillStyle =
                (x / tileSize + y / tileSize) % 2 === 0
                ? "#232323"
                : "#2a2a2a";

            floorCtx.fillRect(x, y, tileSize, tileSize);

            floorCtx.strokeStyle = "#1a1a1a";
            floorCtx.strokeRect(x, y, tileSize, tileSize);
            for (let i = 0; i < 8; i++) {

    floorCtx.fillStyle = "rgba(255,255,255,0.015)";

    floorCtx.fillRect(

        x + Math.random() * tileSize,

        y + Math.random() * tileSize,

        2,

        2

    );
    if (Math.random() < 0.22) {

    floorCtx.strokeStyle = "rgba(0,0,0,0.18)";
    floorCtx.lineWidth = 1;

    floorCtx.beginPath();

    let sx = x + Math.random() * tileSize;
    let sy = y + Math.random() * tileSize;

    floorCtx.moveTo(sx, sy);

    floorCtx.lineTo(
        sx + (Math.random() - 0.5) * 25,
        sy + (Math.random() - 0.5) * 25
    );

    floorCtx.stroke();

}

}
if (Math.random() < 0.08) {

    floorCtx.fillStyle = "rgba(0,0,0,0.10)";

    floorCtx.beginPath();

    floorCtx.arc(

        x + tileSize / 2,

        y + tileSize / 2,

        18 + Math.random() * 12,

        0,

        Math.PI * 2

    );

    floorCtx.fill();

}

        }
       

    }
for (let i = 0; i < 18; i++) {

    drawCrate(

        Math.random() * (floorCanvas.width - 60),

        Math.random() * (floorCanvas.height - 60)

    );

}    

}

// =====================
// Round Bars
// =====================
function roundRect(x, y, width, height, radius) {

    ctx.beginPath();

    ctx.moveTo(x + radius, y);

    ctx.lineTo(x + width - radius, y);

    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

    ctx.lineTo(x + width, y + height - radius);

    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

    ctx.lineTo(x + radius, y + height);

    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

    ctx.lineTo(x, y + radius);

    ctx.quadraticCurveTo(x, y, x + radius, y);

    ctx.closePath();

}
// =====================
// Create Main Menu Particles
// =====================
function createMenuParticles() {

    menuParticles = [];

    for (let i = 0; i < 80; i++) {

        menuParticles.push({

            x: Math.random() * canvas.width,

            y: Math.random() * canvas.height,

            radius: Math.random() * 2 + 1,

            speed: Math.random() * 0.3 + 0.1,

            alpha: Math.random() * 0.5

        });

    }

}

// =====================
// CONTROLS
// =====================

const left = canvas.width / 2 - 170;
const right = canvas.width / 2 + 40;

ctx.textAlign = "left";

ctx.font = "26px Arial";
ctx.fillStyle = "white";
ctx.fillText("CONTROLS", left, 360);

ctx.font = "20px Arial";
ctx.fillStyle = "#9a9a9a";

ctx.fillText("W A S D", left, 410);
ctx.fillText("Move", right, 410);

ctx.fillText("Mouse", left, 450);
ctx.fillText("Aim", right, 450);

ctx.fillText("Left Click", left, 490);
ctx.fillText("Shoot", right, 490);

ctx.fillText("R", left, 530);
ctx.fillText("Reload", right, 530);

ctx.fillText("Shift", left, 570);
ctx.fillText("Dash", right, 570);

ctx.fillText("1 2 3", left, 610);
ctx.fillText("Switch Weapon", right, 610);

ctx.fillText("Esc", left, 650);
ctx.fillText("Pause", right, 650);

// =====================
// HIGH SCORE
// =====================

ctx.textAlign = "center";

ctx.font = "22px Arial";

ctx.fillStyle = "white";

ctx.fillText(
    "BEST SCORE : " + highScore,
    canvas.width / 2,
    740
);

ctx.font = "16px Arial";

ctx.fillStyle = "#666";

ctx.fillText(
    "Version 0.1",
    canvas.width / 2,
    770
);


// =====================
// DRAW Menu Particles
// =====================
function drawMenuParticles() {

    for (let p of menuParticles) {

        p.y += p.speed;

        if (p.y > canvas.height) {

            p.y = 0;

            p.x = Math.random() * canvas.width;

        }

        ctx.globalAlpha = p.alpha;

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.globalAlpha = 1;

}



// =====================
// DRAW UI
// =====================
function drawUI() {
displayedHealth += (playerHealth - displayedHealth) * 0.12;

ctx.strokeStyle = hitMarker > 0 ? "red" : "white";
ctx.fillStyle = hitMarker > 0 ? "red" : "white";
ctx.lineWidth = 2;

// Outer Circle
ctx.beginPath();
ctx.arc(mouseX, mouseY, 12, 0, Math.PI * 2);
ctx.stroke();

ctx.moveTo(mouseX, mouseY - 20);
ctx.lineTo(mouseX, mouseY - crosshairGap);

ctx.moveTo(mouseX, mouseY + crosshairGap);
ctx.lineTo(mouseX, mouseY + 20);

ctx.moveTo(mouseX - 20, mouseY);
ctx.lineTo(mouseX - crosshairGap, mouseY);

ctx.moveTo(mouseX + crosshairGap, mouseY);
ctx.lineTo(mouseX + 20, mouseY);

// Center Dot
ctx.fillStyle = "white";
ctx.beginPath();
ctx.arc(mouseX, mouseY, 2, 0, Math.PI * 2);
ctx.fill();

    if (hitMarker > 0) {

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(mouseX - 10, mouseY - 10);
    ctx.lineTo(mouseX - 4, mouseY - 4);

    ctx.moveTo(mouseX + 10, mouseY - 10);
    ctx.lineTo(mouseX + 4, mouseY - 4);

    ctx.moveTo(mouseX - 10, mouseY + 10);
    ctx.lineTo(mouseX - 4, mouseY + 4);

    ctx.moveTo(mouseX + 10, mouseY + 10);
    ctx.lineTo(mouseX + 4, mouseY + 4);

    ctx.stroke();

    hitMarker--;

}

// =====================================================
// HUD LAYOUT
// =====================================================
if (hudMode === 0) {
ctx.textAlign = "left";
ctx.textBaseline = "alphabetic";
ctx.lineWidth = 2;
ctx.shadowBlur = 0;

const HUD = {

    x: 20,
    y: 20,

    width: 248,
    height: (grenades > 0 || freezeCharges > 0) ? 268 : 212,

    padding: 14

};

ctx.shadowColor = "rgba(0,0,0,.45)";
ctx.shadowBlur = 14;

ctx.fillStyle = "rgba(14,14,18,.82)";


roundRect(
    HUD.x,
    HUD.y,
    HUD.width,
    HUD.height,
    10
);

ctx.fill();
ctx.shadowBlur = 0;

ctx.strokeStyle = "rgba(255,255,255,0.12)";
ctx.lineWidth = 1.5;
ctx.stroke();


// =====================================================
// HEALTH
// =====================================================

let healthColor = "#3cff6b";
let healthPercent = (displayedHealth / maxPlayerHealth) * 100;

if (healthPercent < 60)
    healthColor = "#ffd43b";

if (healthPercent < 30)
    healthColor = "#ff4d4d";

ctx.font = "600 11px Rajdhani";
ctx.fillStyle = "#888";

ctx.fillText(
    "HEALTH",
    HUD.x + HUD.padding,
    HUD.y + 18
);

ctx.fillStyle = "#2a2a2a";

roundRect(
    HUD.x + HUD.padding,
    HUD.y + 26,
    176,
    6,
    3
);

ctx.fill();

ctx.fillStyle = healthColor;

if (healthFlash > 0) {

    ctx.shadowBlur = 18;
    ctx.shadowColor = "white";

    healthFlash--;

}

roundRect(
    HUD.x + HUD.padding,
    HUD.y + 26,
    176 * (displayedHealth / maxPlayerHealth),
    6,
    3
);

ctx.fill();
ctx.shadowBlur = 0;

ctx.font = "700 22px Rajdhani";
ctx.fillStyle = "white";

ctx.fillText(
    Math.round(displayedHealth) + " / " + maxPlayerHealth,
    HUD.x + HUD.padding,
    HUD.y + 60
);

// ======================================
// DIVIDER
// ======================================

ctx.strokeStyle = "rgba(255,255,255,0.08)";
ctx.lineWidth = 1;

ctx.beginPath();
ctx.moveTo(HUD.x + 14, HUD.y + 76);
ctx.lineTo(HUD.x + HUD.width - 14, HUD.y + 76);
ctx.stroke();

// ======================================
// AMMO
// ======================================

ctx.font = "600 10px Rajdhani";
ctx.fillStyle = "#7d7d7d";
ctx.fillText(
    "AMMO",
    HUD.x + 14,
    HUD.y + 94
);

if (!reloadState[currentWeapon]) {

    ctx.font = "700 21px Reloading";
    ctx.fillStyle = "white";

    ctx.fillText(
        ammo + " / " + maxAmmo,
        HUD.x + 14,
        HUD.y + 116
    );

}
else {

    const progress =
        (Date.now() - reloadStartTimes[currentWeapon]) / RELOAD_DURATION;

    ctx.fillStyle = "#2a2a2a";

    roundRect(
        HUD.x + 14,
        HUD.y + 104,
        96,
        6,
        3
    );

    ctx.fill();

    ctx.fillStyle = "#4aa8ff";

    roundRect(
        HUD.x + 14,
        HUD.y + 104,
        96 * Math.min(progress, 1),
        6,
        3
    );

    ctx.fill();

}



// ======================================
// WEAPON
// ======================================

ctx.font = "600 10px Rajdhani";
ctx.fillStyle = "#7d7d7d";

ctx.fillText(
    "WEAPON",
    HUD.x + 138,
    HUD.y + 94
);

ctx.font = "700 17px Rajdhani";
ctx.fillStyle = "white";

ctx.fillText(
    currentWeapon.toUpperCase(),
    HUD.x + 138,
    HUD.y + 116
);

ctx.fill();

ctx.shadowBlur = 0;

// ======================================
// DIVIDER
// ======================================

ctx.strokeStyle = "rgba(255,255,255,0.08)";
ctx.lineWidth = 1;

ctx.beginPath();
ctx.moveTo(HUD.x + 14, HUD.y + 130);
ctx.lineTo(HUD.x + HUD.width - 14, HUD.y + 130);
ctx.stroke();

// ======================================
// SCORE
// ======================================

ctx.font = "600 10px Rajdhani";
ctx.fillStyle = "#7d7d7d";

ctx.fillText(
    "SCORE",
    HUD.x + 14,
    HUD.y + 148
);

ctx.font = "700 19px Rajdhani";
ctx.fillStyle = "white";

ctx.fillText(
    score,
    HUD.x + 14,
    HUD.y + 170
);


// ======================================
// WAVE
// ======================================

ctx.font = "600 10px Rajdhani";
ctx.fillStyle = "#7d7d7d";

ctx.fillText(
    "WAVE",
    HUD.x + 146,
    HUD.y + 148
);

ctx.font = "700 19px Rajdhani";
ctx.fillStyle = "white";

ctx.fillText(
    wave,
    HUD.x + 146,
    HUD.y + 170
);

// ======================================
// DIVIDER
// ======================================

ctx.beginPath();
ctx.moveTo(HUD.x + 14, HUD.y + 184);
ctx.lineTo(HUD.x + HUD.width - 14, HUD.y + 184);
ctx.stroke();

// ======================================
// DASH
// ======================================

ctx.font = "600 14px Rajdhani";
ctx.fillStyle = "#7d7d7d";

ctx.fillText(
    "DASH",
    HUD.x + 14,
    HUD.y + 202
);

if (dashCooldown <= 0) {

    ctx.fillStyle = "#3cff6b";
    ctx.font = "700 14px Rajdhani";

    ctx.fillText(
        "READY",
        HUD.x + 64,
        HUD.y + 202
    );

}
else {

    const dashProgress = 1 - (dashCooldown / 120);

    ctx.fillStyle = "#2a2a2a";

    roundRect(
        HUD.x + 64,
        HUD.y + 194,
        96,
        6,
        3
    );

    ctx.fill();

    ctx.fillStyle = "#ffb347";

    roundRect(
        HUD.x + 64,
        HUD.y + 194,
        96 * dashProgress,
        6,
        3
    );

    ctx.fill();

}




if (grenades > 0 || freezeCharges > 0) {

    // ======================================
    // DIVIDER
    // ======================================

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(HUD.x + 14, HUD.y + 218);
    ctx.lineTo(HUD.x + HUD.width - 14, HUD.y + 218);
    ctx.stroke();

    // ======================================
    // GRENADES (left column)
    // ======================================

    if (true) {

        ctx.font = "600 10px Rajdhani";
        ctx.fillStyle = "#7d7d7d";

        ctx.fillText(
            "GRENADES",
            HUD.x + 14,
            HUD.y + 236
        );

        ctx.fillStyle = "#9bc53d";
        ctx.font = "700 16px Rajdhani";

        ctx.fillText(
            grenades + " / " + MAX_GRENADES,
            HUD.x + 14,
            HUD.y + 256
        );

    }

    // ======================================
    // FREEZE (right column)
    // ======================================

    if (true) {

        ctx.font = "600 10px Rajdhani";
        ctx.fillStyle = "#7d7d7d";

        ctx.fillText(
            "FREEZE [F]",
            HUD.x + 138,
            HUD.y + 236
        );

        ctx.fillStyle = freezeActive ? "#4ad6ff" : "#dff8ff";
        ctx.font = "700 16px Rajdhani";

        ctx.fillText(
            freezeCharges + " / " + MAX_FREEZE,
            HUD.x + 138,
            HUD.y + 256
        );

    }

}

} else if (hudMode === 1) {

    drawCompactHUD();

}


    if (crosshairGap > 8) {

    crosshairGap -= 0.8;

    }


}


// ======================================
// COMPACT HUD (hudMode === 1)
// A slim, wide, top-left readout of the same core stats as the
// full HUD panel, using shorthand labels so it takes up as
// little vertical space as possible.
// ======================================
function drawCompactHUD() {

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;

    let healthColor = "#3cff6b";
    const healthPercent = (displayedHealth / maxPlayerHealth) * 100;

    if (healthPercent < 60) healthColor = "#ffd43b";
    if (healthPercent < 30) healthColor = "#ff4d4d";

    const segments = [
        {
            label: "HP",
            value: Math.round(displayedHealth) + "/" + maxPlayerHealth,
            color: healthColor
        },
        {
            label: "AMO",
            value: reloadState[currentWeapon] ? "RLD" : (ammo + "/" + maxAmmo),
            color: reloadState[currentWeapon] ? "#4aa8ff" : "#ffffff"
        },
        {
            label: "WPN",
            value: currentWeapon.slice(0, 3).toUpperCase(),
            color: "#ffffff"
        },
        {
            label: "SC",
            value: String(score),
            color: "#ffffff"
        },
        {
            label: "WV",
            value: String(wave),
            color: "#ffffff"
        },
        {
            label: "DSH",
            value: dashCooldown <= 0 ? "RDY" : "CD",
            color: dashCooldown <= 0 ? "#3cff6b" : "#ffb347"
        }
    ];

    if (grenades > 0) {
        segments.push({
            label: "GR",
            value: grenades + "/" + MAX_GRENADES,
            color: "#9bc53d"
        });
    }

    if (freezeCharges > 0) {
        segments.push({
            label: "FZ",
            value: freezeCharges + "/" + MAX_FREEZE,
            color: freezeActive ? "#4ad6ff" : "#dff8ff"
        });
    }

    const labelFont = "600 9px Rajdhani";
    const valueFont = "700 13px Rajdhani";
    const innerGap = 14;
    const padding = 12;

    const segWidths = [];
    let contentWidth = 0;

    for (let i = 0; i < segments.length; i++) {

        ctx.font = labelFont;
        const labelWidth = ctx.measureText(segments[i].label).width;

        ctx.font = valueFont;
        const valueWidth = ctx.measureText(segments[i].value).width;

        const w = Math.max(labelWidth, valueWidth);
        segWidths.push(w);
        contentWidth += w;

    }

    contentWidth += innerGap * (segments.length - 1);

    const barX = 20;
    const barY = 20;
    const barWidth = contentWidth + padding * 2;
    const barHeight = 40;

    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "rgba(14,14,18,.82)";

    roundRect(barX, barY, barWidth, barHeight, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    let cursorX = barX + padding;

    for (let i = 0; i < segments.length; i++) {

        ctx.font = labelFont;
        ctx.fillStyle = "#7d7d7d";
        ctx.fillText(segments[i].label, cursorX, barY + 15);

        ctx.font = valueFont;
        ctx.fillStyle = segments[i].color;
        ctx.fillText(segments[i].value, cursorX, barY + 32);

        cursorX += segWidths[i];

        if (i < segments.length - 1) {

            const dividerX = cursorX + innerGap / 2;

            ctx.strokeStyle = "rgba(255,255,255,0.08)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(dividerX, barY + 8);
            ctx.lineTo(dividerX, barY + barHeight - 8);
            ctx.stroke();

            cursorX += innerGap;

        }

    }

}


// ======================================
// GAME LOOP
// ====================================== 
function gameLoop() {

updateAudioState();

ctx.save();
cameraZoom += (targetZoom - cameraZoom) * 0.08;

if (screenShake > 0) {

ctx.translate(

    shakeX + (Math.random() - 0.5) * 3,

    shakeY + (Math.random() - 0.5) * 3

);

    screenShake--;
    shakeX *= 0.8;
    shakeY *= 0.8;

}

ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.save();

ctx.translate(
    canvas.width / 2,
    canvas.height / 2
);

ctx.scale(
    cameraZoom,
    cameraZoom
);

ctx.translate(
    -canvas.width / 2,
    -canvas.height / 2
);

if (!gameStarted) {

    requestAnimationFrame(gameLoop);

    return;

}
drawFloor();

drawCoverBlocks();

updateBlood();

// =====================
// Game Pause
// =====================
if (paused) {

    const pauseElapsed = Date.now() - pauseStartTime;

    // Game stays visible underneath, just dimmed - this is a breath, not a blackout
    ctx.fillStyle = "rgba(0, 0, 0, 0.69)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const restDelay = 250;
    const restFadeInProgress = Math.max(0, Math.min((pauseElapsed - restDelay) / 1500, 1));
    const restFadeInEase = easeInOutCubic(restFadeInProgress);

    if (restFadeInEase > 0) {

        let restAlpha = restFadeInEase;

        if (restFadeInProgress >= 1) {
            const breathe = Math.sin((pauseElapsed - restDelay - 1500) / 1300);
            restAlpha = 0.9 + breathe * 0.1;
        }

        const restRise = (1 - restFadeInEase) * 18;
        const restFontSize = Math.max(28, Math.min(48, canvas.width * 0.034));

        ctx.font = "700 " + restFontSize + "px Rajdhani, Arial";
        ctx.fillStyle = "rgba(228, 228, 234, " + Math.max(0, restAlpha) + ")";
        ctx.fillText("You can rest for a while, soldier.", canvas.width / 2, canvas.height / 2 + restRise);
    }

    ctx.textBaseline = "alphabetic";

    ctx.restore();
    ctx.restore();

    requestAnimationFrame(gameLoop);
    return;
}


// =====================
// Victory - Wave 50 Cleared
// =====================
if (gameWon) {

    const elapsed = Date.now() - gameWonTime;

    moveRight = false;
    moveLeft = false;
    moveUp = false;
    moveDown = false;
    shooting = false;

    // Walk the player toward the center of the screen for the closing shot
    const centerX = canvas.width / 2 - PLAYER_CENTER;
    const centerY = canvas.height / 2 - PLAYER_CENTER;
    x += (centerX - x) * 0.025;
    y += (centerY - y) * 0.025;

    // Face upward, victorious, rather than toward the old mouse position
    mouseX = x + PLAYER_CENTER;
    mouseY = y + PLAYER_CENTER - 200;

    updatePlayer();

    // First beat: bright, triumphant flashes over the live battlefield -
    // the immediate rush of having won, before the moment settles in
    const FLASH_PHASE_DURATION = 1800;

    if (elapsed < FLASH_PHASE_DURATION) {

        const flashCycle = (elapsed / 900) % 1;
        const flashAlpha = Math.max(0, Math.sin(flashCycle * Math.PI)) * 0.35;
        ctx.fillStyle = "rgba(255, 212, 0, " + flashAlpha + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.restore();
        ctx.restore();

        requestAnimationFrame(gameLoop);
        return;
    }

    // Second beat: the dark, reflective screen - same weight as defeat,
    // just lit by what's ahead instead of what's gone
    const screenElapsed = elapsed - FLASH_PHASE_DURATION;

    // Same dark base as the game-over screen - the fight left its mark either way
    const blackoutEase = easeInOutCubic(Math.min(screenElapsed / 1500, 1));
    ctx.fillStyle = "rgba(7, 7, 9, " + blackoutEase + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Slow drifting blobs, but warmed toward amber instead of grey -
    // the dark is the same, only what's glowing inside it has changed
    const t = screenElapsed / 1800;

    const blob1x = canvas.width * 0.28 + Math.sin(t * 0.22) * canvas.width * 0.13;
    const blob1y = canvas.height * 0.32 + Math.cos(t * 0.17) * canvas.height * 0.12;
    const blob2x = canvas.width * 0.72 + Math.cos(t * 0.15) * canvas.width * 0.13;
    const blob2y = canvas.height * 0.68 + Math.sin(t * 0.19) * canvas.height * 0.12;
    const blob3x = canvas.width * 0.5 + Math.sin(t * 0.13 + 2) * canvas.width * 0.16;
    const blob3y = canvas.height * 0.5 + Math.cos(t * 0.14 + 1) * canvas.height * 0.15;

    ctx.save();
    ctx.filter = "blur(" + Math.max(50, canvas.width * 0.045) + "px)";

    ctx.fillStyle = "rgba(74, 60, 30, " + (0.30 * blackoutEase) + ")";
    ctx.beginPath();
    ctx.arc(blob1x, blob1y, canvas.width * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(66, 54, 26, " + (0.26 * blackoutEase) + ")";
    ctx.beginPath();
    ctx.arc(blob2x, blob2y, canvas.width * 0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(58, 48, 22, " + (0.22 * blackoutEase) + ")";
    ctx.beginPath();
    ctx.arc(blob3x, blob3y, canvas.width * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Slow diagonal sweep - not a tired searchlight this time, more like a
    // first light breaking through, so it carries a soft gold tint
    const sweepCycle = (screenElapsed / 7000) % 1;
    const sweepX = -canvas.width * 0.4 + sweepCycle * canvas.width * 1.8;

    ctx.fillStyle = "rgba(150, 122, 54, " + (0.22 * blackoutEase) + ")";
    ctx.beginPath();
    ctx.ellipse(sweepX, canvas.height / 2, canvas.width * 0.08, canvas.height * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Main line - fades in once the dark has mostly settled, then breathes
    // gently, same rhythm as defeat, but the words finally land differently
    const titleDelay = 700;
    const titleFadeInProgress = Math.max(0, Math.min((screenElapsed - titleDelay) / 1800, 1));
    const titleFadeInEase = easeInOutCubic(titleFadeInProgress);

    if (titleFadeInEase > 0) {

        let titleAlpha = titleFadeInEase;

        if (titleFadeInProgress >= 1) {
            const breathe = Math.sin((screenElapsed - titleDelay - 1800) / 1300);
            titleAlpha = 0.9 + breathe * 0.1;
        }

        const titleRise = (1 - titleFadeInEase) * 18;
        const titleFontSize = Math.max(30, Math.min(52, canvas.width * 0.038));

        ctx.font = "700 " + titleFontSize + "px Rajdhani, Arial";
        ctx.fillStyle = "rgba(255, 224, 168, " + Math.max(0, titleAlpha) + ")";
        ctx.fillText("You did it, soldier.", canvas.width / 2, canvas.height / 2 - 52 + titleRise);
        ctx.fillText("The next journey awaits you.", canvas.width / 2, canvas.height / 2 - 12 + titleRise);
    }

    // Random thought to carry forward - arrives after the title, breathes on its own rhythm
    const quoteDelay = 2300;
    const quoteFadeInProgress = Math.max(0, Math.min((screenElapsed - quoteDelay) / 1800, 1));
    const quoteFadeInEase = easeInOutCubic(quoteFadeInProgress);

    if (quoteFadeInEase > 0) {

        let quoteAlpha = quoteFadeInEase;

        if (quoteFadeInProgress >= 1) {
            const breathe = Math.sin((screenElapsed - quoteDelay - 1800) / 1500 + 1.4);
            quoteAlpha = 0.88 + breathe * 0.12;
        }

        const quoteRise = (1 - quoteFadeInEase) * 10;
        const quoteFontSize = Math.max(20, Math.min(29, canvas.width * 0.02));
        ctx.font = "500 " + quoteFontSize + "px Rajdhani, Arial";
        ctx.fillStyle = "rgba(222, 202, 168, " + Math.max(0, quoteAlpha) + ")";

        const maxQuoteWidth = Math.min(canvas.width * 0.64, 720);
        const quoteLines = wrapTextLines(ctx, selectedVictoryQuote, maxQuoteWidth);
        const lineHeight = quoteFontSize * 1.5;
        const quoteStartY = canvas.height / 2 + 62 + quoteRise;

        for (let qi = 0; qi < quoteLines.length; qi++) {
            ctx.fillText(quoteLines[qi], canvas.width / 2, quoteStartY + qi * lineHeight);
        }
    }

    // Corner readouts - quiet, understated, last to settle
    const cornerDelay = 3300;
    const cornerProgress = easeInOutCubic(Math.max(0, Math.min((screenElapsed - cornerDelay) / 1000, 1)));

    if (cornerProgress > 0) {

        ctx.save();
        ctx.textBaseline = "alphabetic";

        // High score - bottom left
        ctx.textAlign = "left";
        ctx.font = "600 11px Rajdhani, Arial";
        ctx.fillStyle = "rgba(148, 132, 96, " + (0.6 * cornerProgress) + ")";
        ctx.fillText("HIGH SCORE", 34, canvas.height - 52);

        ctx.font = "700 17px Rajdhani, Arial";
        ctx.fillStyle = "rgba(226, 212, 182, " + (0.92 * cornerProgress) + ")";
        ctx.fillText("HS " + highScore, 34, canvas.height - 30);

        ctx.strokeStyle = "rgba(178, 158, 112, " + (0.32 * cornerProgress) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(34, canvas.height - 68);
        ctx.lineTo(170, canvas.height - 68);
        ctx.stroke();

        // Restart prompt - bottom right, quietly pulsing
        const pulse = 0.62 + Math.sin(Date.now() / 450) * 0.22;

        ctx.textAlign = "right";
        ctx.font = "600 11px Rajdhani, Arial";
        ctx.fillStyle = "rgba(148, 132, 96, " + (0.6 * cornerProgress) + ")";
        ctx.fillText("READY FOR WHAT'S NEXT", canvas.width - 34, canvas.height - 52);

        ctx.font = "700 17px Rajdhani, Arial";
        ctx.fillStyle = "rgba(255, 224, 168, " + (cornerProgress * pulse) + ")";
        ctx.fillText("PRESS ENTER TO PLAY AGAIN", canvas.width - 34, canvas.height - 30);

        ctx.strokeStyle = "rgba(178, 158, 112, " + (0.32 * cornerProgress) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width - 230, canvas.height - 68);
        ctx.lineTo(canvas.width - 34, canvas.height - 68);
        ctx.stroke();

        ctx.restore();
    }

    ctx.textBaseline = "alphabetic";

    ctx.restore();
    ctx.restore();

    requestAnimationFrame(gameLoop);
    return;
}


// =====================
// Game Over
// =====================
if (gameOver) {

    const elapsed = Date.now() - gameOverTime;

    // The world stays visible - enemies frozen in place, player blown apart -
    // right up until the black has fully taken over.
    if (elapsed < WORLD_FADE_DURATION) {
        updateEnemies(Date.now(), true);
        updatePlayerDeathExplosion(elapsed);
    }

    // Dark grey-black base, not flat black
    const blackoutEase = easeInOutCubic(Math.min(elapsed / 1500, 1));
    ctx.fillStyle = "rgba(7, 7, 9, " + blackoutEase + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Slow drifting grey blobs - smooth gaussian blur instead of stepped gradients
    const t = elapsed / 1800;

    const blob1x = canvas.width * 0.28 + Math.sin(t * 0.22) * canvas.width * 0.13;
    const blob1y = canvas.height * 0.32 + Math.cos(t * 0.17) * canvas.height * 0.12;
    const blob2x = canvas.width * 0.72 + Math.cos(t * 0.15) * canvas.width * 0.13;
    const blob2y = canvas.height * 0.68 + Math.sin(t * 0.19) * canvas.height * 0.12;
    const blob3x = canvas.width * 0.5 + Math.sin(t * 0.13 + 2) * canvas.width * 0.16;
    const blob3y = canvas.height * 0.5 + Math.cos(t * 0.14 + 1) * canvas.height * 0.15;

    ctx.save();
    ctx.filter = "blur(" + Math.max(50, canvas.width * 0.045) + "px)";

    ctx.fillStyle = "rgba(54, 54, 60, " + (0.32 * blackoutEase) + ")";
    ctx.beginPath();
    ctx.arc(blob1x, blob1y, canvas.width * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(48, 48, 54, " + (0.27 * blackoutEase) + ")";
    ctx.beginPath();
    ctx.arc(blob2x, blob2y, canvas.width * 0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(42, 42, 48, " + (0.22 * blackoutEase) + ")";
    ctx.beginPath();
    ctx.arc(blob3x, blob3y, canvas.width * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Slow diagonal sweep of light grey, like a tired searchlight passing through
    const sweepCycle = (elapsed / 7000) % 1;
    const sweepX = -canvas.width * 0.4 + sweepCycle * canvas.width * 1.8;

    ctx.fillStyle = "rgba(62, 62, 68, " + (0.22 * blackoutEase) + ")";
    ctx.beginPath();
    ctx.ellipse(sweepX, canvas.height / 2, canvas.width * 0.08, canvas.height * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Main line - fades in once the black has mostly taken hold,
    // then breathes gently in and out and bobs ever so slightly, like a slow, tired exhale
    const titleDelay = 700;
    const titleFadeInProgress = Math.max(0, Math.min((elapsed - titleDelay) / 1800, 1));
    const titleFadeInEase = easeInOutCubic(titleFadeInProgress);

    if (titleFadeInEase > 0) {

        let titleAlpha = titleFadeInEase;

        if (titleFadeInProgress >= 1) {
            const breathe = Math.sin((elapsed - titleDelay - 1800) / 1300);
            titleAlpha = 0.9 + breathe * 0.1;
        }

        const titleRise = (1 - titleFadeInEase) * 18;
        const titleFontSize = Math.max(32, Math.min(56, canvas.width * 0.04));

        ctx.font = "700 " + titleFontSize + "px Rajdhani, Arial";
        ctx.fillStyle = "rgba(228, 228, 234, " + Math.max(0, titleAlpha) + ")";
        ctx.fillText("You gave your best, soldier.", canvas.width / 2, canvas.height / 2 - 30 + titleRise);
    }

    // Random thought of hope - arrives after the title, breathes and bobs on its own rhythm
    const quoteDelay = 2300;
    const quoteFadeInProgress = Math.max(0, Math.min((elapsed - quoteDelay) / 1800, 1));
    const quoteFadeInEase = easeInOutCubic(quoteFadeInProgress);

    if (quoteFadeInEase > 0) {

        let quoteAlpha = quoteFadeInEase;

        if (quoteFadeInProgress >= 1) {
            const breathe = Math.sin((elapsed - quoteDelay - 1800) / 1500 + 1.4);
            quoteAlpha = 0.88 + breathe * 0.12;
        }

        const quoteRise = (1 - quoteFadeInEase) * 10;
        const quoteFontSize = Math.max(20, Math.min(29, canvas.width * 0.02));
        ctx.font = "500 " + quoteFontSize + "px Rajdhani, Arial";
        ctx.fillStyle = "rgba(195, 195, 204, " + Math.max(0, quoteAlpha) + ")";

        const maxQuoteWidth = Math.min(canvas.width * 0.64, 720);
        const quoteLines = wrapTextLines(ctx, selectedQuote, maxQuoteWidth);
        const lineHeight = quoteFontSize * 1.5;
        const quoteStartY = canvas.height / 2 + 48 + quoteRise;

        for (let qi = 0; qi < quoteLines.length; qi++) {
            ctx.fillText(quoteLines[qi], canvas.width / 2, quoteStartY + qi * lineHeight);
        }
    }

    // Corner readouts - quiet, understated, last to settle
    const cornerDelay = 3300;
    const cornerProgress = easeInOutCubic(Math.max(0, Math.min((elapsed - cornerDelay) / 1000, 1)));

    if (cornerProgress > 0) {

        ctx.save();
        ctx.textBaseline = "alphabetic";

        // High score - bottom left
        ctx.textAlign = "left";
        ctx.font = "600 11px Rajdhani, Arial";
        ctx.fillStyle = "rgba(140, 140, 148, " + (0.6 * cornerProgress) + ")";
        ctx.fillText("HIGH SCORE", 34, canvas.height - 52);

        ctx.font = "700 17px Rajdhani, Arial";
        ctx.fillStyle = "rgba(220, 220, 226, " + (0.92 * cornerProgress) + ")";
        ctx.fillText("HS " + highScore, 34, canvas.height - 30);

        ctx.strokeStyle = "rgba(170, 170, 178, " + (0.32 * cornerProgress) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(34, canvas.height - 68);
        ctx.lineTo(170, canvas.height - 68);
        ctx.stroke();

        // Restart prompt - bottom right, quietly pulsing
        const pulse = 0.62 + Math.sin(Date.now() / 450) * 0.22;

        ctx.textAlign = "right";
        ctx.font = "600 11px Rajdhani, Arial";
        ctx.fillStyle = "rgba(140, 140, 148, " + (0.6 * cornerProgress) + ")";
        ctx.fillText("THE FIGHT ISN'T OVER", canvas.width - 34, canvas.height - 52);

        ctx.font = "700 17px Rajdhani, Arial";
        ctx.fillStyle = "rgba(220, 220, 226, " + (cornerProgress * pulse) + ")";
        ctx.fillText("PRESS ENTER TO RESTART", canvas.width - 34, canvas.height - 30);

        ctx.strokeStyle = "rgba(170, 170, 178, " + (0.32 * cornerProgress) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width - 230, canvas.height - 68);
        ctx.lineTo(canvas.width - 34, canvas.height - 68);
        ctx.stroke();

        ctx.restore();
    }

    ctx.textBaseline = "alphabetic";

    ctx.restore();
    ctx.restore();

    requestAnimationFrame(gameLoop);
    return;
}



targetZoom = 1;

progressFade = getProgressFade();

updatePlayer();

shootMachineGun();

const currentTime = Date.now();

updatePlayerBullets();

updateEnemyBullets();

updateEnemies(currentTime);

updateParticles();

updatePlayerTrails();

updateDeathFlashes();

updateExplosionEffects();

updateBulletTrails();

updateDamageTexts();

updateScoreTexts();

updateHealthPacks();

regenPlayerHealth();

updateAmmoPacks();

updateGrenadePacks();

updateShieldPacks();

updateFreezePacks();

updatePlayerShield();

if (freezeActive && Date.now() >= freezeEndTime) {
    freezeActive = false;
}

updateThrownGrenades();

updateRespawns();

ctx.restore();

if (freezeActive) {

    drawFreezeOverlay();

}

drawUI();   

drawWaveText();

ctx.restore();

requestAnimationFrame(gameLoop);

}
createMenuParticles();
gameLoop();