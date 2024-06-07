interface BusStop {
  bustop_id: number;
  bus: number[];
}

interface WalkingRoute {
  from: number;
  to: number;
}

interface RouteStep {
  stop: number;
  mode: string;  // either "bus" or "walk"
  route: number | null;  // bus number or null for walk
}

const busStops: BusStop[] = [
  { bustop_id: 1221, bus: [34, 291, 292, 8, 7,100] },
  { bustop_id: 1222, bus: [8, 7, 4] },
  { bustop_id: 1223, bus: [5, 678, 888] },
  { bustop_id: 1224, bus: [34, 5, 10, 40] },
  { bustop_id: 1225, bus: [300, 295,100] },
];

const walkingRoutes: WalkingRoute[] = [
  { from: 1221, to: 1222 },
  { from: 1224, to: 1225 },
];

// Function to create a map of bus stop connections
const createBusStopMap = (busStops: BusStop[], walkingRoutes: WalkingRoute[]) => {
  const busStopMap: Map<number, Set<number>> = new Map();
  const busRoutesMap: Map<string, number | null> = new Map();

  busStops.forEach(stop => {
    busStopMap.set(stop.bustop_id, new Set<number>());
    stop.bus.forEach(bus => {
      const key = `${stop.bustop_id},${bus}`;
      busRoutesMap.set(key, bus);
    });
  });

  busStops.forEach((stop1, index1) => {
    busStops.forEach((stop2, index2) => {
      if (index1 !== index2) {
        const commonBuses = stop1.bus.filter(bus => stop2.bus.includes(bus));
        if (commonBuses.length > 0) {
          busStopMap.get(stop1.bustop_id)?.add(stop2.bustop_id);
          busStopMap.get(stop2.bustop_id)?.add(stop1.bustop_id);
          commonBuses.forEach(bus => {
            const key1 = `${stop1.bustop_id},${stop2.bustop_id}`;
            const key2 = `${stop2.bustop_id},${stop1.bustop_id}`;
            busRoutesMap.set(key1, bus);
            busRoutesMap.set(key2, bus);
          });
        }
      }
    });
  });

  walkingRoutes.forEach(route => {
    busStopMap.get(route.from)?.add(route.to);
    busStopMap.get(route.to)?.add(route.from);
    const key1 = `${route.from},${route.to}`;
    const key2 = `${route.to},${route.from}`;
    busRoutesMap.set(key1, null);
    busRoutesMap.set(key2, null);
  });

  return { busStopMap, busRoutesMap };
};

// DFS to find all paths
const findAllRoutes = (start: number, destination: number, busStopMap: Map<number, Set<number>>, busRoutesMap: Map<string, number | null>): RouteStep[][] => {
  const allRoutes: RouteStep[][] = [];
  const visited: Set<number> = new Set();

  const dfs = (currentStop: number, path: RouteStep[]) => {
    if (currentStop === destination) {
      allRoutes.push([...path]);
      return;
    }

    visited.add(currentStop);

    const neighbors = busStopMap.get(currentStop);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const key = `${currentStop},${neighbor}`;
          const bus = busRoutesMap.get(key);
          const mode = bus === null ? "walk" : "bus";
          const newPath = [...path, { stop: neighbor, mode, route: bus }];
          dfs(neighbor, newPath);
        }
      }
    }

    visited.delete(currentStop);
  };

  dfs(start, [{ stop: start, mode: "start", route: null }]);
  return allRoutes;
};

// Main
const { busStopMap, busRoutesMap } = createBusStopMap(busStops, walkingRoutes);
const startStop = 1221;
const destinationStop = 1225;
const allRoutes = findAllRoutes(startStop, destinationStop, busStopMap, busRoutesMap);

if (allRoutes.length > 0) {
  console.log(`All routes from ${startStop} to ${destinationStop}:`);
  allRoutes.forEach((route, index) => {
    console.log(`Route ${index + 1}:`);
    route.forEach(step => {
      if (step.mode === "start") {
        console.log(`  Start at bus stop ${step.stop}`);
      } else if (step.mode === "walk") {
        console.log(`  Walk to bus stop ${step.stop}`);
      } else {
        console.log(`  Take bus number ${step.route} to bus stop ${step.stop}`);
      }
    });
  });
} else {
  console.log(`No route found from ${startStop} to ${destinationStop}`);
}
