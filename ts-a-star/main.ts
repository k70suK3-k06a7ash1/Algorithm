import { PriorityQueue } from '@datastructures-js/priority-queue';

// 計算をするクラス
class CalculationAStarAlgorithm {
    dungeon: string[][];

    constructor(dungeon: string[]) {
        this.dungeon = dungeon.map(row => row.split(''));
    }

    // 引数　search_criteria_charactor　は検索する際基準となる文字
    getCharacotorCoordinates(search_criteria_charactor: string): [number, number] | undefined {
        for (let index_height = 0; index_height < this.dungeon.length; index_height++) {
            const line = this.dungeon[index_height];
            for (let index_wedth = 0; index_wedth < line.length; index_wedth++) {
                const charactor = line[index_wedth];
                if (charactor === search_criteria_charactor) {
                    return [index_height, index_wedth];
                }
            }
        }
        return undefined;
    }

    // 予測値の計算　ヒューリスティック関数
    // 公式f(n) = g(n) + h(n) におけるh(n) に該当するのが以下
    heuristic(position: [number, number], goal_coordinates: [number, number]): number {
        return Math.sqrt(
            Math.pow(position[0] - goal_coordinates[0], 2) +
            Math.pow(position[1] - goal_coordinates[1], 2)
        );
    }

    // 公式f(n) = g(n) + h(n) におけるg(n) に該当するのが以下
    distance(path: [number, number][]): number {
        return path.length;
    }

    // last_passed_position は最後に探索した座標
    // 探索中の座標から四方の座標を計算する
    *nextCandidatePosition(last_passed_position: [number, number]): Generator<[number, number]> {
        const wall = "*";
        const moves: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dy, dx] of moves) {
            const newY = last_passed_position[0] + dy;
            const newX = last_passed_position[1] + dx;
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

    // a*アルゴリズムを実装した関数は以下

    aStarAlgorithm(start_coordinates: [number, number], goal_coordinates: [number, number]): [number, number][] {
        const passed_list: [number, number][] = [start_coordinates];
        const init_score = this.distance(passed_list) + this.heuristic(start_coordinates, goal_coordinates);

        const checked: { [key: string]: number } = { [start_coordinates.toString()]: init_score };
        const searching_heap = new PriorityQueue<[number, [number, number][]]>(
               (a, b) => a[0] - b[0]
          )
        searching_heap.enqueue([init_score, passed_list]);

        while (!searching_heap.isEmpty()) {
            const [_, passed_list] = searching_heap.dequeue() as [number, [number, number][]];
            const last_passed_position = passed_list[passed_list.length - 1];

            if (last_passed_position[0] === goal_coordinates[0] && last_passed_position[1] === goal_coordinates[1]) {
                return passed_list;
            }

            for (const position of this.nextCandidatePosition(last_passed_position)) {
                const new_passed_list = [...passed_list, position];
                const position_score = this.distance(new_passed_list) + this.heuristic(position, goal_coordinates);

                if (checked[position.toString()] && checked[position.toString()] <= position_score) {
                    continue;
                }

                checked[position.toString()] = position_score;
                searching_heap.enqueue([position_score, new_passed_list]);
            }
        }
        return [];
    }

    // 計算された最短距離を元に、描画する処理が以下
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

// 計算結果を出力するクラス
class Result {
    // 探索する迷路を宣言
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
    // 開始を意味する”S”の座標を検索する
    static start_coordinates = Result.calculation.getCharacotorCoordinates("S");
    // ゴールを意味する”G”の座標を検索する
    static goal_coordinates = Result.calculation.getCharacotorCoordinates("G");
    // aStarAlgorithm関数を使用して探索する
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