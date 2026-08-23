// =====================================================
// NEON COLLECTOR
// =====================================================


// ================================
// CANVAS
// ================================

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");


let W;
let H;


function resizeCanvas() {

    W =
        window.innerWidth;

    H =
        window.innerHeight - 75;

    canvas.width = W;
    canvas.height = H;

}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


// ================================
// GAME VARIABLES
// ================================

let gameRunning = false;

let score = 0;

let lives = 3;

let level = 1;

let crystalsCollected = 0;

let crystals = [];

let enemies = [];

let particles = [];

let stars = [];


// ================================
// PLAYER
// ================================

const player = {

    x: 100,

    y: 300,

    size: 18,

    speed: 5

};


// ================================
// KEYBOARD
// ================================

const keys = {};


window.addEventListener(
    "keydown",
    function(event) {

        keys[
            event.key.toLowerCase()
        ] = true;

    }
);


window.addEventListener(
    "keyup",
    function(event) {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


// ================================
// START GAME
// ================================

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        startGame
    );


function startGame() {

    score = 0;

    lives = 3;

    level = 1;

    crystalsCollected = 0;

    gameRunning = true;

    hide("startScreen");

    hide("gameOverScreen");

    hide("levelScreen");

    createLevel();

    updateHUD();

}


// ================================
// CREATE LEVEL
// ================================

function createLevel() {

    crystals = [];

    enemies = [];

    particles = [];

    player.x = 100;

    player.y =
        H / 2;


    // Background stars

    stars = [];


    for (
        let i = 0;
        i < 120;
        i++
    ) {

        stars.push({

            x:
                Math.random() * W,

            y:
                Math.random() * H,

            size:
                Math.random() * 2,

            speed:
                Math.random() * .5

        });

    }


    // =========================
    // CRYSTALS
    // =========================

    const crystalCount =
        8 + level * 3;


    for (
        let i = 0;
        i < crystalCount;
        i++
    ) {

        crystals.push({

            x:
                150 +
                Math.random() *
                (W - 200),

            y:
                100 +
                Math.random() *
                (H - 180),

            size: 11,

            collected: false,

            rotation:
                Math.random() *
                Math.PI * 2

        });

    }


    // =========================
    // ENEMIES
    // =========================

    const enemyCount =
        2 + level;


    for (
        let i = 0;
        i < enemyCount;
        i++
    ) {

        enemies.push({

            x:
                300 +
                Math.random() *
                (W - 350),

            y:
                100 +
                Math.random() *
                (H - 180),

            size: 18,

            vx:
                (Math.random() >
                .5 ? 1 : -1) *
                (
                    1.5 +
                    level * .25
                ),

            vy:
                (Math.random() >
                .5 ? 1 : -1) *
                (
                    1 +
                    level * .2
                )

        });

    }

}


// ================================
// UPDATE PLAYER
// ================================

function updatePlayer() {

    if (
        keys["arrowup"] ||
        keys["w"]
    ) {

        player.y -=
            player.speed;

    }


    if (
        keys["arrowdown"] ||
        keys["s"]
    ) {

        player.y +=
            player.speed;

    }


    if (
        keys["arrowleft"] ||
        keys["a"]
    ) {

        player.x -=
            player.speed;

    }


    if (
        keys["arrowright"] ||
        keys["d"]
    ) {

        player.x +=
            player.speed;

    }


    // Keep player inside screen

    player.x =
        Math.max(
            player.size,
            Math.min(
                W - player.size,
                player.x
            )
        );


    player.y =
        Math.max(
            75 + player.size,
            Math.min(
                H - player.size,
                player.y
            )
        );

}


// ================================
// UPDATE ENEMIES
// ================================

function updateEnemies() {

    enemies.forEach(
        enemy => {

            enemy.x +=
                enemy.vx;

            enemy.y +=
                enemy.vy;


            if (
                enemy.x <
                enemy.size ||
                enemy.x >
                W - enemy.size
            ) {

                enemy.vx *= -1;

            }


            if (
                enemy.y <
                enemy.size ||
                enemy.y >
                H - enemy.size
            ) {

                enemy.vy *= -1;

            }

        }
    );

}


// ================================
// COLLECT CRYSTALS
// ================================

function updateCrystals() {

    crystals.forEach(
        crystal => {

            if (
                crystal.collected
            )
                return;


            crystal.rotation +=
                .05;


            const distance =
                getDistance(
                    player.x,
                    player.y,
                    crystal.x,
                    crystal.y
                );


            if (
                distance <
                player.size +
                crystal.size
            ) {

                crystal.collected =
                    true;


                crystalsCollected++;

                score += 100;


                createParticles(
                    crystal.x,
                    crystal.y
                );


                updateHUD();


                // Level complete

                if (
                    crystalsCollected >=
                    crystals.length
                ) {

                    levelComplete();

                }

            }

        }
    );

}


// ================================
// ENEMY COLLISION
// ================================

function checkEnemyCollision() {

    enemies.forEach(
        enemy => {

            const distance =
                getDistance(
                    player.x,
                    player.y,
                    enemy.x,
                    enemy.y
                );


            if (
                distance <
                player.size +
                enemy.size
            ) {

                loseLife();

            }

        }
    );

}


// ================================
// LOSE LIFE
// ================================

let hitCooldown = false;


function loseLife() {

    if (
        hitCooldown
    )
        return;


    hitCooldown = true;

    lives--;


    createParticles(
        player.x,
        player.y
    );


    updateHUD();


    player.x = 100;

    player.y =
        H / 2;


    setTimeout(
        () => {

            hitCooldown = false;

        },
        1000
    );


    if (
        lives <= 0
    ) {

        gameOver();

    }

}


// ================================
// PARTICLES
// ================================

function createParticles(
    x,
    y
) {

    for (
        let i = 0;
        i < 25;
        i++
    ) {

        particles.push({

            x: x,

            y: y,

            vx:
                (Math.random() - .5) *
                7,

            vy:
                (Math.random() - .5) *
                7,

            life: 1,

            size:
                2 +
                Math.random() * 4

        });

    }

}


function updateParticles() {

    particles.forEach(
        particle => {

            particle.x +=
                particle.vx;

            particle.y +=
                particle.vy;

            particle.life -=
                .025;

        }
    );


    particles =
        particles.filter(
            p =>
                p.life > 0
        );

}


// ================================
// DISTANCE
// ================================

function getDistance(
    x1,
    y1,
    x2,
    y2
) {

    const dx =
        x1 - x2;

    const dy =
        y1 - y2;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


// ================================
// DRAW BACKGROUND
// ================================

function drawBackground() {

    ctx.fillStyle =
        "#040712";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    // Grid

    ctx.strokeStyle =
        "rgba(0,246,255,.035)";

    const grid = 50;


    for (
        let x = 0;
        x < W;
        x += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            H
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < H;
        y += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            W,
            y
        );

        ctx.stroke();

    }


    // Stars

    stars.forEach(
        star => {

            star.y +=
                star.speed;


            if (
                star.y > H
            ) {

                star.y = 0;

            }


            ctx.fillStyle =
                "rgba(150,220,255,.5)";


            ctx.fillRect(
                star.x,
                star.y,
                star.size,
                star.size
            );

        }
    );

}


// ================================
// DRAW PLAYER
// ================================

function drawPlayer() {

    ctx.save();


    ctx.shadowBlur = 30;

    ctx.shadowColor =
        "#00f6ff";


    // Outer glow

    ctx.fillStyle =
        "rgba(0,246,255,.15)";


    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        35,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Player

    ctx.fillStyle =
        "#00f6ff";


    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.size,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Center

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();

    ctx.arc(
        player.x - 5,
        player.y - 5,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


// ================================
// DRAW CRYSTALS
// ================================

function drawCrystals() {

    crystals.forEach(
        crystal => {

            if (
                crystal.collected
            )
                return;


            ctx.save();


            ctx.translate(
                crystal.x,
                crystal.y
            );


            ctx.rotate(
                crystal.rotation
            );


            ctx.shadowBlur = 25;

            ctx.shadowColor =
                "#00f6ff";


            ctx.fillStyle =
                "#00f6ff";


            ctx.beginPath();

            ctx.moveTo(
                0,
                -crystal.size
            );

            ctx.lineTo(
                crystal.size,
                0
            );

            ctx.lineTo(
                0,
                crystal.size
            );

            ctx.lineTo(
                -crystal.size,
                0
            );

            ctx.closePath();

            ctx.fill();


            ctx.restore();

        }
    );

}


// ================================
// DRAW ENEMIES
// ================================

function drawEnemies() {

    enemies.forEach(
        enemy => {

            ctx.save();


            ctx.shadowBlur = 25;

            ctx.shadowColor =
                "#ff2d78";


            ctx.fillStyle =
                "#ff2d78";


            ctx.beginPath();

            ctx.arc(
                enemy.x,
                enemy.y,
                enemy.size,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // Inner core

            ctx.fillStyle =
                "#ff9bbd";


            ctx.beginPath();

            ctx.arc(
                enemy.x - 5,
                enemy.y - 5,
                4,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.restore();

        }
    );

}


// ================================
// DRAW PARTICLES
// ================================

function drawParticles() {

    particles.forEach(
        particle => {

            ctx.globalAlpha =
                particle.life;


            ctx.fillStyle =
                "#00f6ff";


            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );


    ctx.globalAlpha = 1;

}


// ================================
// HUD
// ================================

function updateHUD() {

    document.getElementById(
        "score"
    ).textContent =
        String(score)
        .padStart(4, "0");


    document.getElementById(
        "collected"
    ).textContent =
        crystalsCollected;


    document.getElementById(
        "lives"
    ).textContent =
        lives;


    document.getElementById(
        "level"
    ).textContent =
        level;

}


// ================================
// LEVEL COMPLETE
// ================================

function levelComplete() {

    gameRunning = false;


    document.getElementById(
        "levelScore"
    ).textContent =
        score;


    document.getElementById(
        "levelCrystals"
    ).textContent =
        crystalsCollected;


    show("levelScreen");

}


// ================================
// NEXT LEVEL
// ================================

document
    .getElementById("nextButton")
    .addEventListener(
        "click",
        function() {

            level++;

            crystalsCollected = 0;

            gameRunning = true;

            hide("levelScreen");

            createLevel();

            updateHUD();

        }
    );


// ================================
// GAME OVER
// ================================

function gameOver() {

    gameRunning = false;


    document.getElementById(
        "finalScore"
    ).textContent =
        String(score)
        .padStart(4, "0");


    show("gameOverScreen");

}


// ================================
// RESTART
// ================================

document
    .getElementById("restartButton")
    .addEventListener(
        "click",
        startGame
    );


// ================================
// SCREEN HELPERS
// ================================

function show(id) {

    document
        .getElementById(id)
        .classList
        .remove("hidden");

}


function hide(id) {

    document
        .getElementById(id)
        .classList
        .add("hidden");

}


// ================================
// MAIN GAME LOOP
// ================================

function gameLoop() {

    drawBackground();


    if (
        gameRunning
    ) {

        updatePlayer();

        updateEnemies();

        updateCrystals();

        checkEnemyCollision();

        updateParticles();

    }


    drawCrystals();

    drawEnemies();

    drawParticles();

    drawPlayer();


    requestAnimationFrame(
        gameLoop
    );

}


gameLoop();