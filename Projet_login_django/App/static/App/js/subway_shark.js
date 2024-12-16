// Références au canvas et au contexte
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variables de l'oiseau
const fish = {
    x: 250,
    y: canvas.height / 2,
    width: 100, // Taille visuelle de l'image
    height: 100,
    hitboxWidth: 40, // Zone de collision plus petite
    hitboxHeight: 30,
    hitboxOffsetX: 40, // Décalage de la hitbox par rapport à l'image
    hitboxOffsetY: 35,
    speed: 5,
    image: new Image()
};
fish.image.src = STATIC_URL + "poisson.png";

// Variables de l'ennemi
const enemy = {
    x: 30, // Position proche du bord gauche
    y: canvas.height / 2,
    width: 100,
    height: 100,
    hitboxWidth: 40,
    hitboxHeight: 30,
    hitboxOffsetX: 20,
    hitboxOffsetY: 35,
    speed: 2, // Vitesse de rapprochement
    image: new Image()
};
enemy.image.src = STATIC_URL + "requin.png";

// Load coral images
const coralImage1 = new Image();
const coralImage2 = new Image();
coralImage1.src = STATIC_URL + "corail.png";
coralImage2.src = STATIC_URL + "corail2.png";


// Variables des coraux
const corals = [];
const coralWidth = 100;
const coralGap = 150;
let coralSpeed = 2; // Vitesse des coraux
let coralFrequency = 110;
let frames = 0;
let score = 0;
let gameStarted = false;
let lastSpeedIncreaseTime = 0;
const SPEED_INCREASE_INTERVAL = 5000; // 5 secondes en millisecondes
const SPEED_INCREASE_AMOUNT = 0.5; // Augmentation de vitesse à chaque intervalle
const MAX_SPEED = 12; // Vitesse maximale pour éviter que le jeu devienne impossible


// Gestion des entrées utilisateur
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

function drawCoral(coral) {
    const coralImg = coral.type === 1 ? coralImage1 : coralImage2;
    
    // Draw top coral (inverted)
    ctx.save();
    ctx.translate(coral.x + coralWidth/2, coral.y/2);
    ctx.scale(1, -1);
    ctx.drawImage(coralImg, -coralWidth/2, -coral.y/2, coralWidth, coral.y);
    ctx.restore();
    
    // Draw bottom coral (normal)
    ctx.drawImage(coralImg, 
        coral.x, 
        coral.y + coralGap, 
        coralWidth, 
        canvas.height - (coral.y + coralGap)
    );
}

// Update corals
function updateCorals() {
    if (frames % coralFrequency === 0) {
        const y = Math.floor(Math.random() * (canvas.height - coralGap));
        const type = Math.random() < 0.5 ? 1 : 2; // Random selection between type 1 and 2
        corals.push({ x: canvas.width, y, type });
    }

    for (let i = corals.length - 1; i >= 0; i--) {
        corals[i].x -= coralSpeed;
        drawCoral(corals[i]);

        if (corals[i].x + coralWidth < 0) {
            corals.splice(i, 1);
            score++;
        }
    }
}

document.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault(); // Empêcher le défilement de la page
    }
});

document.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault(); // Empêcher le défilement de la page
    }
});

// Fonction pour démarrer le jeu
function startGame() {
    gameStarted = true;
    requestAnimationFrame(updateGameArea);
}

function updateGameSpeed() {
    const currentTime = Date.now();
    if (currentTime - lastSpeedIncreaseTime >= SPEED_INCREASE_INTERVAL) {
        if (coralSpeed < MAX_SPEED) {
            coralSpeed += SPEED_INCREASE_AMOUNT;
            enemy.speed += SPEED_INCREASE_AMOUNT;
        }
        lastSpeedIncreaseTime = currentTime;
    }
}

// Mettre à jour le jeu
function updateGameArea() {
    frames++;
    clearCanvas();
    updateGameSpeed(); // Ajouter cette ligne
    updateFish();
    updateEnemy();
    updateCorals();
    checkCoralPenalty();
    displayScore();
    if (gameStarted) {
        requestAnimationFrame(updateGameArea);
    }
}

// Efface le canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Mise à jour de l'oiseau
function updateFish() {
    // Mise à jour de la position en fonction des entrées utilisateur
    if (keys.ArrowUp && fish.y > 0) fish.y -= fish.speed;
    if (keys.ArrowDown && fish.y + fish.height < canvas.height) fish.y += fish.speed;

    // Dessin de l'oiseau
    ctx.drawImage(fish.image, fish.x, fish.y, fish.width, fish.height);

}

// Mise à jour de l'ennemi
function updateEnemy() {
    // L'ennemi suit le fish verticalement en utilisant la position de la hitbox
    const birdCenterY = fish.y + fish.hitboxOffsetY + (fish.hitboxHeight / 2);
    const enemyCenterY = enemy.y + (enemy.height / 2);

    if (enemyCenterY < birdCenterY) enemy.y += enemy.speed;
    else if (enemyCenterY > birdCenterY) enemy.y -= enemy.speed;

    ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);

    // DEBUG: Visualiser la hitbox
    //ctx.strokeStyle = "yellow";
    //ctx.strokeRect(enemy.x + enemy.hitboxOffsetX, enemy.y + enemy.hitboxOffsetY, enemy.hitboxWidth, enemy.hitboxHeight);


    // Vérification de collision plus précise avec la hitbox
    const birdLeft = fish.x + fish.hitboxOffsetX;
    const birdRight = birdLeft + fish.hitboxWidth;
    const birdTop = fish.y + fish.hitboxOffsetY;
    const birdBottom = birdTop + fish.hitboxHeight;

    const enemyRight = enemy.x + enemy.width;
    const enemyBottom = enemy.y + enemy.height;

    if (
        enemyRight >= birdLeft &&
        enemy.x <= birdRight &&
        enemyBottom >= birdTop &&
        enemy.y <= birdBottom
    ) {
        gameOver();
    }
}

// Update corals
function updateCorals() {
    if (frames % coralFrequency === 0) {
        const y = Math.floor(Math.random() * (canvas.height - coralGap));
        const type = Math.random() < 0.5 ? 1 : 2; // Random selection between type 1 and 2
        corals.push({ x: canvas.width, y, type });
    }

    for (let i = corals.length - 1; i >= 0; i--) {
        corals[i].x -= coralSpeed;
        drawCoral(corals[i]);

        if (corals[i].x + coralWidth < 0) {
            corals.splice(i, 1);
            score++;
        }
    }
}

let lastPenaltyTime = 0; // Variable pour stocker le temps de la dernière pénalité

function checkCoralPenalty() {
    const currentTime = Date.now();

    corals.forEach(coral => {
        // Vérifie si le poisson traverse un tuyau (sans bloquer son passage)
        if (
            (fish.x + fish.hitboxOffsetX + fish.hitboxWidth) > coral.x &&
            (fish.x + fish.hitboxOffsetX) < coral.x + coralWidth &&
            ((fish.y + fish.hitboxOffsetY) < coral.y || 
             (fish.y + fish.hitboxOffsetY + fish.hitboxHeight) > coral.y + coralGap)
        ) {
            // Applique la pénalité si le délai est respecté
            if (!coral.penalized && currentTime - lastPenaltyTime > 2000) {
                fish.x = Math.max(10, fish.x - 30);
                coral.penalized = true;
                lastPenaltyTime = currentTime;
            }
        } else {
            coral.penalized = false;
        }
    });
}

// Affichage du score
function displayScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.textAlign = "left"; // Aligner le texte à gauche
    const margin = 20; // Marge pour éviter le débordement
    ctx.fillText("Score: " + score, margin, margin + 10); // Position ajustée
    ctx.shadowBlur = 0; // Reset shadow for other drawings
}

// Fonction de fin de jeu
function gameOver() {
    gameStarted = false;
    let opacity = 0;
    let textSize = 30;
    let growing = true;

    const fadeEffect = setInterval(() => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background gradient
        let gradient = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 0,
            canvas.width/2, canvas.height/2, canvas.width/2
        );
        gradient.addColorStop(0, `rgba(255, 0, 0, ${opacity/2})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${opacity})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Animate text size
        if (growing) {
            textSize += 0.5;
            if (textSize >= 60) growing = false;
        } else {
            textSize -= 0.5;
            if (textSize <= 30) growing = true;
        }

        // Game Over text with shadow
        ctx.shadowColor = "red";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "white";
        ctx.font = `${textSize}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER!", canvas.width/2, canvas.height/2 - 50);
        
        // Score text
        ctx.font = "36px Arial";
        ctx.fillText(`Score Final: ${score}`, canvas.width/2, canvas.height/2 + 50);
        
        // Restart text with pulse effect
        ctx.font = `${Math.abs(Math.sin(Date.now()/500) * 5 + 25)}px Arial`;
        ctx.fillText("Cliquez pour recommencer", canvas.width/2, canvas.height/2 + 150);

        // Fade in
        if (opacity < 0.8) {
            opacity += 0.02;
        }
    }, 16);

    // Reset game on click
    canvas.addEventListener('click', function resetHandler() {
        clearInterval(fadeEffect);
        canvas.removeEventListener('click', resetHandler);
        resetGame();
    });

    fetch('/App/save_score/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            score: score
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'error') {
            console.error('Error saving score:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Fonction pour réinitialiser les variables et le jeu
function resetGame() {
    fish.y = canvas.height / 2;
    fish.x = 250;
    enemy.x = 10;
    enemy.y = canvas.height / 2;
    corals.length = 0;
    frames = 0;
    score = 0;
    coralSpeed = 2; // Réinitialiser la vitesse des coraux
    enemy.speed = 2; // Réinitialiser la vitesse de l'ennemi
    lastSpeedIncreaseTime = Date.now(); // Réinitialiser le timer de vitesse
}

// Démarrer le jeu au premier clic sur le canvas
canvas.addEventListener("click", () => {
    if (!gameStarted) {
        startGame();
    }
});
