import { PriorityQueue } from '@datastructures-js/priority-queue';

class CalculationAStarAlgorithm {
    dungeon: string[][];

    constructor(dungeon: string[]) {
        this.dungeon = dungeon.map(row => row.split(''));
    }

    getCharacotorCoordinates(search_criteria_charactor: string): [number, number] | undefined {
        for (let indexHeight = 0; indexHeight < this.dungeon.length; indexHeight++) {
            const line = this.dungeon[indexHeight];
            for (let indexWedth = 0; indexWedth < line.length; indexWedth++) {
                const charactor = line[indexWedth];
                if (charactor === search_criteria_charactor) {
                    return [indexHeight, indexWedth];
                }
            }
        }
        return undefined;
    }

    heuristic(position: [number, number], goal_coordinates: [number, number]): number {
        return Math.sqrt(
            Math.pow(position[0] - goal_coordinates[0], 2) +
            Math.pow(position[1] - goal_coordinates[1], 2)
        );
    }

    distance(path: [number, number][]): number {
        return path.length;
    }

    *nextCandidatePosition(lastPassedPosition: [number, number]): Generator<[number, number]> {
        const wall = "*";
        const moves: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dy, dx] of moves) {
            const newY = lastPassedPosition[0] + dy;
            const newX = lastPassedPosition[1] + dx;
            if (
                newY >= 0 &&
                newY < this.dungeon.length &&
                newX >= 0 &&
                newX < this.dungeon[0].length &&
                this.dungeon[newY][newX] !== wall
            ) {
                yield [newY, newX];
            }
        }
    }

    aStarAlgorithm(start_coordinates: [number, number], goal_coordinates: [number, number]): [number, number][] {
        const passedList: [number, number][] = [start_coordinates];
        const initScore = this.distance(passedList) + this.heuristic(start_coordinates, goal_coordinates);

        const checked: { [key: string]: number } = { [start_coordinates.toString()]: initScore };
        const searchingHeap = new PriorityQueue<[number, [number, number][]]>(
               (a, b) => a[0] - b[0]
          )
        searchingHeap.enqueue([initScore, passedList]);

        while (!searchingHeap.isEmpty()) {
            const [_, passedList] = searchingHeap.dequeue() as [number, [number, number][]];
            const lastPassedPosition = passedList[passedList.length - 1];

            if (lastPassedPosition[0] === goal_coordinates[0] && lastPassedPosition[1] === goal_coordinates[1]) {
                return passedList;
            }

            for (const position of this.nextCandidatePosition(lastPassedPosition)) {
                const newPassedList = [...passedList, position];
                const positionScore = this.distance(newPassedList) + this.heuristic(position, goal_coordinates);

                if (checked[position.toString()] && checked[position.toString()] <= positionScore) {
                    continue;
                }

                checked[position.toString()] = positionScore;
                searchingHeap.enqueue([positionScore, newPassedList]);
            }
        }
        return [];
    }

    renderPath(path: [number, number][]): string[] {
        const structure = this.dungeon.map(row => [...row]);

        for (const dot of path.slice(1, -1)) {
            structure[dot[0]][dot[1]] = "$";
        }

        structure[path[0][0]][path[0][1]] = "S";
        structure[path[path.length - 1][0]][path[path.length - 1][1]] = "G";

        return structure.map(l => l.join(""));
    }
}

class Result {
    static dungeon = [
        '**************************',
        '* * *     S              *',
        '* * *  *  *************  *',
        '* *   *    ************  *',
        '*    *                   *',
        '************** ***********',
        '*                        *',
        '** ***********************',
        '*      *              G  *',
        '*  *      *********** *  *',
        '*    *        ******* *  *',
        '*       *                *',
        '**************************',
    ];

    static calculation = new CalculationAStarAlgorithm(Result.dungeon);
    static start_coordinates = Result.calculation.getCharacotorCoordinates("S");
    static goal_coordinates = Result.calculation.getCharacotorCoordinates("G");
    static path = Result.start_coordinates && Result.goal_coordinates ? Result.calculation.aStarAlgorithm(Result.start_coordinates, Result.goal_coordinates) : [];
    static printResult() {
        if (Result.path && Result.path.length > 0) {
            console.log(Result.calculation.renderPath(Result.path).join("\n"));
        } else {
            console.log('failed');
        }
    }
}

Result.printResult();