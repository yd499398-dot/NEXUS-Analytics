const currentTenure = "9";
const points = [0];
if (currentTenure === 1) {
    points.push(1);
} else if (currentTenure === 2) {
    points.push(1);
    points.push(2);
} else if (currentTenure > 2) {
    const p1 = Math.round(currentTenure / 3);
    const p2 = Math.round((currentTenure * 2) / 3);
    if (p1 > 0 && p1 < currentTenure) points.push(p1);
    if (p2 > p1 && p2 < currentTenure) points.push(p2);
    points.push(currentTenure);
}
console.log(points);
