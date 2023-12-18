const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

let mapsrc = "maps/testMap2.png";
const img = new Image();

const nations = [];
const nationCount = 2;
const drawIndices = new Set();

function startGame() {
    loadMap();
    gameLoop();
}

function gameLoop() {
    //drawMap();
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
        initNations(2);
        drawMap();
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
    }
}

function getColor(value){
    console.log("Random Color")
    switch(value){
        case 1:
            return "green";
        case 2:
            return "brown";
        default:
            return nations.find(nation => nation.color === value)?.color || "blue";
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
        color: "brown",
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
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random()*16)];
    }
    return color;
}

startGame();