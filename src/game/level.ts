import type { GameObject, Neighbor } from './types';
import { VALUE_OBJECTS, TOXIC_OBJECTS, OBSTACLES, GROUND_Y } from './types';

let nextId = 1;

export function generateLevel(level: number): { objects: GameObject[]; neighbors: Neighbor[] } {
  const objects: GameObject[] = [];
  const neighbors: Neighbor[] = [];

  // Place value objects across the level
  const valueCount = 8 + Math.min(level * 2, 6);
  const usedX = new Set<number>();

  for (let i = 0; i < valueCount; i++) {
    const x = 200 + (i * 1100) / valueCount + (Math.random() - 0.5) * 40;
    const y = GROUND_Y - 40 - Math.random() * 100;
    const def = VALUE_OBJECTS[Math.floor(Math.random() * VALUE_OBJECTS.length)];
    objects.push({
      id: nextId++,
      x,
      y,
      w: 50,
      h: 50,
      type: 'value',
      label: def.label,
      icon: def.icon,
      value: def.value,
      deposited: false,
      broken: false,
      depositProgress: 0,
      hitFlash: 0,
      collected: false,
    });
  }

  // Place obstacles (brick walls blocking the path)
  const obstacleCount = 2 + Math.min(level, 4);
  for (let i = 0; i < obstacleCount; i++) {
    const x = 400 + (i * 1200) / obstacleCount + (Math.random() - 0.5) * 60;
    objects.push({
      id: nextId++,
      x,
      y: GROUND_Y - 60,
      w: 40,
      h: 60,
      type: 'obstacle',
      label: OBSTACLES[0].label,
      icon: OBSTACLES[0].icon,
      value: 0,
      deposited: false,
      broken: false,
      depositProgress: 0,
      hitFlash: 0,
      collected: false,
    });
  }

  // Place toxic hazards
  const toxicCount = 1 + Math.min(Math.floor(level / 2), 3);
  for (let i = 0; i < toxicCount; i++) {
    let x: number;
    let attempts = 0;
    do {
      x = 300 + Math.random() * 1000;
      attempts++;
    } while (usedX.has(Math.floor(x / 100)) && attempts < 10);
    usedX.add(Math.floor(x / 100));
    const def = TOXIC_OBJECTS[Math.floor(Math.random() * TOXIC_OBJECTS.length)];
    objects.push({
      id: nextId++,
      x,
      y: GROUND_Y - 35,
      w: 45,
      h: 35,
      type: 'toxic',
      label: def.label,
      icon: def.icon,
      value: 0,
      deposited: false,
      broken: false,
      depositProgress: 0,
      hitFlash: 0,
      collected: false,
    });
  }

  // Place neighbors (NPCs walking around)
  const neighborCount = 2 + Math.min(level, 3);
  for (let i = 0; i < neighborCount; i++) {
    const x = 200 + (i * 1000) / neighborCount;
    neighbors.push({
      id: i,
      x,
      y: GROUND_Y - 30,
      vx: (Math.random() > 0.5 ? 1 : -1) * 0.8,
      baseY: GROUND_Y - 30,
      state: 'idle',
      stateTimer: 0,
      walkPhase: 0,
    });
  }

  return { objects, neighbors };
}
