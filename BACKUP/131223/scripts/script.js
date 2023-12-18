const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

let mapsrc = "maps/testMap2.png";
const img = new Image();

const nations = [];
const nationCount = 2;
const drawIndices = new Set();

function startGame() {
    initNations(nationCount);
    gameLoop();
}

function gameLoop() {
    drawMap();
    expandAllNations()
    requestAnimationFrame(gameLoop);
}

// MAP GENERATION
let map = [];
var upscale = 1;

function loadMap() {
    img.src = mapsrc;

    img.onload = function() {
        canvas.width = img.width*upscale;
        canvas.height = img.height*upscale;
        ctx.drawImage(img, 0, 0, img.width*upscale, img.height*upscale);

        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        const data = imageData.data;

        for (let i = 0; i < data.length;i += 4){
            const red = data[i];
            const green = data[i+1];
            const blue = data[i+2];

            let provinceType;

            if (red < 128 && green < 128 && blue < 128)
                {provinceType = 1;} // LAND PROVINCE
            else if (red < 128 && green < 128 && blue > 128)
                {provinceType=2;}   // MOUNTAIN PROVINCE
            else
                {provinceType = 0;} // WATER PROVINCE

            map.push(provinceType);
        }
        startGame();
    }
}

function drawMap(){
    const pixelSize = 1;
    for(let i = 0; i < map.length; i++){
        const color = getColor(map[i]);
        ctx.fillStyle = color;
        const x = (i % img.width) * pixelSize;
        const y = Math.floor(i / img.width) * pixelSize;
        ctx.fillRect(x, y, pixelSize, pixelSize);
        drawBorder(x,y,i);
    }
}

function getColor(value){
    switch(value){
        case 1:
            return "green";
        case 2:
            return "brown";
        default:
            return nations.find(nation => nation.color === value)?.color || "blue";
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

// NATION GENERATION
function initNations(count){
    console.log("initiate Nations");
    for (let i = 0; i < count; i++){
        console.log("Attempting to create Nation "+i);
        const nation = createNation();
        console.log("Created Nation "+i);
        nations.push(nation);
    }
}

function createNation() {
    console.log("creating Nation.")
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
    } while ((map[newNation.y * img.width + newNation.x] !== 1) && (map[newNation.y * img.width + newNation.x] !== 2));

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

// EXPANSION
function expandAllNations() {
    for (const nation of nations) {
        expand(nation);
    }
}

function expand(currentNation) {
    const provincesCopy = [...currentNation.provinces];

    const expansionRadius = 1;

    for (const province of provincesCopy) {
        for (let dx = -expansionRadius; dx <= expansionRadius; dx++){
            for (let dy = -expansionRadius; dy<=expansionRadius; dy++){
                const x = province.x + dx;
                const y = province.y + dy;

                // wenn nachbarpixel = grün
                const index = y * img.width + x;

                if (
                    x >= 0 && x < img.width &&
                    y >= 0 && y < img.height &&
                    map[index] === 1 &&
                    !currentNation.provinces.some(p => p.x === x && p.y === y)
                ) {
                    map[index] = currentNation.color;
                    currentNation.provinces.push({ x, y });
                }
            }
        }
    }
}

// DIPLOMACY
function declareWar(nation1, nation2) {
    nations[nation1].atWar = true;
    nations[nation2].atWar = true;
    console.log(`Nations ${nations[nation1].name} & ${nations[nation2].name} are now at war`);
    attack(nation1, nation2);
}

function dmakePeace(nation1, nation2) {
    nations[nation1].atWar = false;
    nations[nation2].atWar = false;
    console.log(`Nations ${nations[nation1].name} & ${nations[nation2].name} are now at peace`);
}

// WAR-MECHANICS
function attack(nation1,nation2) {
    const provincesCopy1 = [...nations[nation1].provinces];
    const provincesCopy2 = [...nations[nation2].provinces];

    const attackRadius = 1;

    console.log("Start Attack.")
    for (const province of provincesCopy1) {
        for (let dx = -attackRadius; dx <= attackRadius; dx++){
            for (let dy = -attackRadius; dy<=attackRadius; dy++){
                const x = province.x + dx;
                const y = province.y + dy;

                // wenn nachbarpixel = grün
                const index = y * img.width + x;

                if (
                    x >= 0 && x < img.width &&
                    y >= 0 && y < img.height &&
                    map[index] === nations[nation2].color &&
                    !nations[nation1].provinces.some(p => p.x === x && p.y === y)
                ) {
                    map[index] = nations[nation1].color;
                    nations[nation1].provinces.push({ x, y });
                }
            }
        }
    }
}
loadMap();