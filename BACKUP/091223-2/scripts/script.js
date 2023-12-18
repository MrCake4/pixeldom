const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
//canvas.width = window.innerWidth;
//canvas.height = window.innerHeight;

const playerNation = {
    x: 0,
    y:0,
    food: 0,
    provinces:[],
    color: "red",
};

const nations = [];
const drawnIndices = new Set();

// Start the game loop as soon as the image has been loaded
function startGame() {
    gameLoop();
}

function gameLoop() {
    drawMap();
    drawUI();
    expandPlayer();
    expandAllNations();
    requestAnimationFrame(gameLoop);
}

// MAP GENERATION
let map = [];

 const img = new Image();
 img.src = "maps/europewwlow.png";

 img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Iterate over pixels
    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];

        // Convert Colors
        const isLand = red < 128 && green < 128 && blue < 128;
        map.push(isLand ? 1 : 0);
    }
    //initPlayerNation();
    initNations(2);
    generateFood();
    startGame();
};

function drawMap() {
    const pixelSize = 1;
    for (let i = 0; i < map.length; i++) {
        const color = getColor(map[i]);
        ctx.fillStyle = color;
        const x = (i % img.width) * pixelSize;
        const y = Math.floor(i / img.width) * pixelSize;
        ctx.fillRect(x, y, pixelSize, pixelSize);
        drawBorder(x, y, i);
    }
}

function drawBorder(x, y, i) {
    const left = map[i - 1];
    const right = map[i + 1];
    const top = map[i - img.width];
    const bottom = map[i + img.width];

    if (left !== map[i] && left !== undefined) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, 1, 1);
    }
    if (right !== map[i] && right !== undefined) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x + 1, y, 1, 1);
    }
    if (top !== map[i] && top !== undefined) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, 1, 1);
    }
    if (bottom !== map[i] && bottom !== undefined) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y + 1, 1, 1);
    }
}

function initPlayerNation() {
    do {
        playerNation.x = Math.floor(Math.random() * img.width);
        playerNation.y = Math.floor(Math.random() * img.height);
    } while (map[playerNation.y * img.width + playerNation.x] !== 1);

    map[playerNation.y * img.width + playerNation.x] = 2; // Use a different value to represent player nation (e.g., 2)
    playerNation.provinces.push({ x: playerNation.x, y: playerNation.y });
}

function initNation(color) {
    nation.color = color;
    do {
        nation.x = Math.floor(Math.random() * img.width);
        nation.y = Math.floor(Math.random() * img.height);
    } while (map[nation.y * img.width + nation.x] !== 1);

    map[nation.y * img.width + nation.x] = 3; // Use a different value to represent player nation (e.g., 2)
    nation.provinces.push({ x: nation.x, y: nation.y });
}

function initNations(count) {
    for (let i = 0; i < count; i++) {
        const nation = createNation();
        nations.push(nation);
    }
}

function createNation() {
    const newNation = {
        x: 0,
        y: 0,
        food: 0,
        provinces: [],
        color: getRandomColor(),
        name: "Kingdom",
        atWar: false,
    };

    do {
        newNation.x = Math.floor(Math.random() * img.width);
        newNation.y = Math.floor(Math.random() * img.height);
    } while (map[newNation.y * img.width + newNation.x] !== 1);

    map[newNation.y * img.width + newNation.x] = 3; // Use a different value to represent nations (e.g., 3)
    newNation.provinces.push({ x: newNation.x, y: newNation.y });

    return newNation;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getColor(value) {
    switch (value) {
        case 1:
            return 'green';
        case 2:
            return playerNation.color;
        default:
            return nations.find(nation => nation.color === value)?.color || 'blue';
    }
}

// Function to generate food points every second
function generateFood() {
    setInterval(() => {
        playerNation.food += (playerNation.provinces.length);
        for (const nation of nations) {
            nation.food += (nation.provinces.length);
        }
    }, 1000);
}

function expandPlayer() {
    expand(playerNation);
}

function expand(currentNation) {
    const provincesCopy = [...currentNation.provinces];

    // Radius of expansion
    const expansionRadius = 1;

    // Iterate over all provinces belonging to the current nation
    for (const province of provincesCopy) {
        for (let dx = -expansionRadius; dx <= expansionRadius; dx++) {
            for (let dy = -expansionRadius; dy <= expansionRadius; dy++) {  // TODO: NEST THIS CODE IN A FUNCTION
                const x = province.x + dx;
                const y = province.y + dy;

                // Check if the neighboring pixel is a green province
                const index = y * img.width + x;

                if (
                    x >= 0 && x < img.width &&
                    y >= 0 && y < img.height &&
                    map[index] === 1 &&
                    currentNation.food >= 1 &&
                    !currentNation.provinces.some(p => p.x === x && p.y === y)
                ) {
                    currentNation.food -= 1;
                    map[index] = currentNation.color;
                    currentNation.provinces.push({ x, y });
                    currentNation.food += 1;
                }
            }
        }
    }
}

function expandAllNations() {
    for (const nation of nations) {
        expand(nation);
    }
}

// DIPLOMACY
function declareWar(nation1, nation2) {
    nation1.atWar = true;
    nation2.atWar = true;
}

function makePeace(nation1, nation2) {
    nation1.atWar = false;
    nation2.atWar = false;
}

function isAtWar(nation1, nation2) {
    return nation1.atWar && nation2.atWar;
}

// UI
function drawUI() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Food: ${playerNation.food}`, 10, 30);

    ctx.fillText(`Provinces: ${playerNation.provinces.length}`, 10, 60);

}