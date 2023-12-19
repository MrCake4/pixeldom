const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

let mapsrc = "maps/europewwlow.png";
const img = new Image();

const nations = [];
let nationCount = 1;
const drawIndices = new Set();
let expansionSpeed = 100;
let intervalId; // To store the interval ID
const expansionRateSlider = document.getElementById("expansionRate");
const nationRateSlider = document.getElementById("nationRate");

let godMode = false;
let godBtn = document.getElementById("godMode");
let globalWarCheck = false;

// Buttons
let spwNat = document.getElementById("nationSpawner");
spwNat.addEventListener("click", function() { initNations(nationCount); });

let globalWarBtn = document.getElementById("globalWar");
globalWarBtn.addEventListener("click", globalWar);

function startGame() {
    intervalId = setInterval(expandAllNations, expansionSpeed);
    console.log("-GAME STARTED\n===CONSOLE LOG===");
    gameLoop();
}

function gameLoop() {
    drawMap();
    //expandAllNations();
    checkUserInput();
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
    const pixelSize = 1*upscale;
    for(let i = 0; i < map.length; i++){
        const color = getColor(map[i]);
        ctx.fillStyle = color;
        const x = (i % img.width) * pixelSize;
        const y = Math.floor(i / img.width) * pixelSize;
        ctx.fillRect(x, y, pixelSize, pixelSize);
        //drawBorder(x,y,i);
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

    /**do {
        newNation.x = Math.floor(Math.random() * img.width);
        newNation.y = Math.floor(Math.random() * img.height);
    } while ((map[newNation.y * img.width + newNation.x] !== 1) && (map[newNation.y * img.width + newNation.x] !== 2));

    map[newNation.y * img.width + newNation.x] = 3; // Use a different value to represent nations (e.g., 3)
    newNation.provinces.push({ x: newNation.x, y: newNation.y });

    return newNation;**/
}

function spawnNation(x,y) {
    console.log("creating Nation.")
    const newNation = createNation(x,y);

    nations.push(newNation);
    map[y * img.width + x] = 3;
}

// EXPANSION
function expandAllNations() {
    for (const nation of nations) {
        if (nation.atWar===false){expand(nation);}
        else {
            attack(0, 1);
            attack(1, 0);}
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
}

function makePeace(nation1, nation2) {
    nations[nation1].atWar = false;
    nations[nation2].atWar = false;
    console.log(`Nations ${nations[nation1].name} & ${nations[nation2].name} are now at peace`);
}

function globalWar() {
    if (globalWarCheck === false){
        for (const nation of nations) {
            nation.atWar = true;
        }
        console.log(`Global War has been declared`);
        globalWarBtn.innerHTML = "Global Peace";
        globalWarCheck = true;
    } else {
        for (const nation of nations) {
            nation.atWar = false;
        }
        console.log(`Global Peace has been declared`);
        globalWarBtn.innerHTML = "Global War";
        globalWarCheck = false;
    }
}

// WAR-MECHANICS
function attack(nation1,nation2) {
    const attacker = nations[nation1];
    const defender = nations[nation2];

    let dice;
    let attackStrength = attacker.strength;

    if (!attacker || !defender) {
        console.error("Invalid nation indices.");
        return;
    }

    const provincesCopy1 = [...attacker.provinces];
    const provincesCopy2 = [...defender.provinces];

    const attackRadius = 1;

    
    if (attacker.atWar === true && defender.atWar === true) {
        console.log(`${attacker.name} Start Attack on ${defender.name}.`);
        for (let i = 0; i < attackStrength; i++)
            for (const province of provincesCopy1) {
                dice = Math.floor(Math.random() * 6);
                if (dice >= 5) {
                for (let dx = -attackRadius; dx <= attackRadius; dx++){
                    
                    for (let dy = -attackRadius; dy<=attackRadius; dy++){
                        const x = province.x + dx;
                        const y = province.y + dy;

                        // wenn nachbarpixel = grün
                        const index = y * img.width + x;

                        if (
                            x >= 0 && x < img.width &&
                            y >= 0 && y < img.height &&
                            map[index] === defender.color &&
                            !attacker.provinces.some(p => p.x === x && p.y === y) && (dice >= 1)
                        ) {
                            map[index] = attacker.color;
                            const defenderProvinceIndex = defender.provinces.findIndex(p => p.x === x && p.y === y);
                            if (defenderProvinceIndex !== -1) {
                                defender.provinces.splice(defenderProvinceIndex, 1);
                            }

                            attacker.provinces.push({ x, y });
                            checkAnnex(attacker, defender);
                        }
                    }
                }
                
            }
        }
    }
}

function checkAnnex(attacker, defender) {
    if (defender.provinces.length <= 500) {
        
        const defenderIndex = nations.findIndex(n => n === defender);
        if (defenderIndex !== -1) {
            for (const province of defender.provinces) {
                map[province.y * img.width + province.x] = attacker.color;
                attacker.provinces.push(province);
            }
            //nations.splice(defenderIndex, 1);
        }
        console.log(`${attacker.name} has annexed ${defender.name}.`);
        attacker.atWar = false;
        defender.atWar = false;
        //makePeace(attacker, defender);
    }
}

// USER FUNCTIONS
function checkUserInput() {
    if (godBtn.checked && !godMode) {
        godMode = true;
        console.log("Godmode activated");
        canvas.addEventListener("click", handleCanvasClick);
    }
    else if (!godBtn.checked && godMode){
        godMode = false;
        console.log("Godmode deactivated");
        canvas.removeEventListener("click", handleCanvasClick);
    }
}

function handleCanvasClick(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    const mapX = Math.floor(mouseX / upscale);
    const mapY = Math.floor(mouseY / upscale);

    // Check if the clicked position is a land province
    if (isLandProvince(mapX, mapY)) {
        spawnNation(mapX, mapY);
    }
}

expansionRateSlider.addEventListener("input", function() {
    expansionSpeed = parseInt(expansionRateSlider.value)*10;
    document.getElementById("expansionRateLabel").innerHTML = "Expansion Speed: " + expansionSpeed;

    // Clear the existing interval and create a new one with the updated speed
    clearInterval(intervalId);
    intervalId = setInterval(expandAllNations, expansionSpeed);
});

nationRateSlider.addEventListener("input", function() {
    nationCount = parseInt(nationRateSlider.value);
    document.getElementById("nationRateLabel").innerHTML = "Nation Count: " + nationCount;
});

function isLandProvince(x, y) {
    const index = y * img.width + x;
    return map[index] === 1; // Assuming 1 represents a land province
}

loadMap();