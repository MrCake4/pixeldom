function createNation(x,y) {
    console.log("creating Nation.")
    const newNation = {
        x: x,
        y: y,
        capital: [{ x: x, y: y}],
        provinces: [{ x: x, y: y}],
        food: 0,
        stability: 100,
        strength: 1,
        ideology: getIdeology("democracy"),
        color: getRandomColor(),
        name: getRandomNationName(), // Generate a random nation name
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

function getRandomNationName() {
    const nationNames = ["Junko", "Empire", "Republic", "Dynasty", "Federation"];
    return nationNames[Math.floor(Math.random() * nationNames.length)];
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getIdeology(ideology){
    switch(ideology){
        case "democracy":
            stability = 0;
            
            return "democracy";
        case "dictatorship":
            return "dictatorship";
        case "monarchy":
            return "monarchy";
        case "theocracy":
            return "theocracy";
        case "communism":
            return "communism";
        case "fascism":
            return "fascism";
        default:
            return "democracy";
    }
}