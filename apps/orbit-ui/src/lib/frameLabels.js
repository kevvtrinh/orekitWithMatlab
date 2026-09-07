// Keep close targets readable without moving their actual frame coordinates.
export function layoutFrameLabels(markers, width, height) {
  const occupied = [];
  return markers.map((marker) => {
    const w = Math.min(width - 8, marker.name.length * 6 + 9), h = 17;
    let chosen;
    for (const [dx, dy] of [[10, -20], [10, 4], [10, 24], [-w - 10, -20], [-w - 10, 4], [10, -40], [10, 44]]) {
      const box = { x: Math.max(4, Math.min(width - w - 4, marker.x + dx)),
        y: Math.max(4, Math.min(height - h - 4, marker.y + dy)), w, h };
      chosen = box;
      if (!occupied.some((other) => box.x < other.x + other.w + 3 && box.x + w + 3 > other.x &&
        box.y < other.y + other.h + 3 && box.y + h + 3 > other.y)) break;
    }
    occupied.push(chosen);
    return { ...marker, labelX: chosen.x, labelY: chosen.y };
  });
}
