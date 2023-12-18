function createNation(x,y) {
    console.log("creating Nation.")
    const newNation = {
        x: x,
        y: y,
        capitol: { x: x, y: y},
        food: 0,
        strength: 1,
        provinces: [{ x: x, y: y}],
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