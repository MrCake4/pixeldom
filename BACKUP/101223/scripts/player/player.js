const playerNation = {
    x: 0,
    y:0,
    food: 0,
    provinces:[],
    color: "red",
};

function initPlayerNation() {
    do {
        playerNation.x = Math.floor(Math.random() * img.width);
        playerNation.y = Math.floor(Math.random() * img.height);
    } while (map[playerNation.y * img.width + playerNation.x] !== 1);

    map[playerNation.y * img.width + playerNation.x] = 2; // Use a different value to represent player nation (e.g., 2)
    playerNation.provinces.push({ x: playerNation.x, y: playerNation.y });
}

function expandPlayer() {
    expand(playerNation);
}

//better function to get color
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

//UI
// UI
function drawUI() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Food: ${playerNation.food}`, 10, 30);

    ctx.fillText(`Provinces: ${playerNation.provinces.length}`, 10, 60);

}

// Player Food loop with other nations
// Function to generate food points every second
function generateFood() {
    setInterval(() => {
        playerNation.food += (playerNation.provinces.length);
        for (const nation of nations) {
            nation.food += (nation.provinces.length);
        }
    }, 1000);
}