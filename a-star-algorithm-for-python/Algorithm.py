# 優先度キューアルゴリズムを使うためのモジュール
import heapq

# 計算をするクラス
class CalculationAStarAlgorithm():
    def __init__(self, dungeon):
        self.dungeon = dungeon

    # 引数　search_criteria_charactor　は検索する際基準となる文字
    def getCharacotorCoordinates(self, search_criteria_charactor):
        self.search_criteria_charactor = search_criteria_charactor
        # 配列内の縦方向を展開する
        # i は縦方向展開なのでY軸となる
        # enumerate はインデックスと要素をそれぞれ抽出する
        for index_height, line in enumerate(self.dungeon):
            # 配列の横方向を展開する
            # jは横方向展開なのでx軸となる
            for index_wedth, charactor in enumerate(line):
                # 要素cから検索基準文字criteria_charactorが見つかった場合、以下の処理
                if charactor == search_criteria_charactor:
                    # i はY軸　jはX軸の値となることに注意
                    return (index_height, index_wedth)

    # 予測値の計算　ヒューリスティック関数
    # 公式f(n) = g(n) + h(n) におけるh(n) に該当するのが以下
    def heuristic(self, position, goal_coordinates):
        self.position = position
        self.goal_coordinates = goal_coordinates
        # マンハッタン距離を使った場合、計算スピードは早くなるが精度は落ちる
        # マンハッタン距離　＝　（ゴール座標X　ー　現時点の座標X）　＋　（ゴール座標Y　ー　現時点の座標Y）
        # 以下はユークリッド距離を算出する式となる
        return ((position[0] - goal_coordinates[0]) ** 2 + (position[1] - goal_coordinates[1]) ** 2) ** 0.5
        # 0.5 の指数計算は1/2に置き換えて考える。
        # よって((position[0] - goal_coordinates[0]) ** 2 + (position[1] - goal_coordinates[1]) ** 2)　の２乗根がreturn となるので、三平方の定理を利用していることがわかる
    
    # 公式f(n) = g(n) + h(n) におけるg(n) に該当するのが以下
    def distance(self, path):
        self.path = path
        # len は要素数を計算するpython の組み込み関数（デフォルトで使える関数）
        return len(path)

    # last_passed_position は最後に探索した座標
    # 探索中の座標から四方の座標を計算する
    def nextCandidatePosition(self, last_passed_position):
        self.last_passed_position = last_passed_position
        # wall は探索する際、通過できない箇所
        wall = "*"
        # zip() にて2つの配列{concave_cross_list, convex_cross_list}を結合する
        concave_cross_list = [' + 1', ' - 1', '', '']
        convex_cross_list =['', '', ' + 1', ' - 1']
        for a, b in zip(concave_cross_list, convex_cross_list):
            # [0] = y軸、 [1] = x軸
            # wallと　dungeon[eval('last_passed_position[0]' + a)][eval('last_passed_position[1]' + b)]　が一致しないことが条件
            # ecal('something') somethingは式として評価される
            if self.dungeon[eval('last_passed_position[0]' + a)][eval('last_passed_position[1]' + b)] != wall:
                # wallと一致しないならば、以下を返す　よって、実行結果は配列になる可能性がある
                # 探索中の座標から四方の座標を計算しwall出ないパターンを全て返す
                yield (eval('last_passed_position[0]' + a), eval('last_passed_position[1]' + b))

    # a*アルゴリズムを実装した関数は以下
    ## 引数　starting_point　探索を開始する地点
    ## 引数　goal　探索で目指すゴール地点
    def aStarAlgorithm(self, start_coordinates, goal_coordinates):
        self.start_coordinates = start_coordinates
        self.goal_coordinates = goal_coordinates
        # 探索した座標を格納する経路リスト
        # これがアルゴリズムで探索した履歴となる
        # スタート地点を格納
        passed_list = [start_coordinates]
        # 初期スコア
        # 開始点start_coordinates　と　ゴール地点goal_coordinates　との距離を計算
        # 公式f(n) = g(n) + h(n) におけるh(n) に該当するのが以下
        init_score = self.distance(passed_list) + self.heuristic(start_coordinates, goal_coordinates)
        
        # 探索済み座標と、その座標に辿り着いた経路のスコアを格納
        checked = {start_coordinates: init_score}
        # 経路リストとそのスコアを格納する探索ヒープ
        searching_heap = []
        # 優先度付きキューに要素を挿入する　メソッド:heapq.heappush()
        heapq.heappush(searching_heap, (init_score, passed_list))
        
        while len(searching_heap) > 0:
            # 優先度付きキューの中から最小値を取り出す　メソッド：heapq.heappop()
            score, passed_list = heapq.heappop(searching_heap)
            # list[-1] とすることで、リストに格納されている要素のうち、インデックスが最大のものを取り出すことができる
            # last_passed_positionは探索候補を探す際の基準となる地点
            last_passed_position = passed_list[-1]
            # 最後に探索した座標が目的地なら探索ヒープを返す
            # つまり、ゴールへ到達したという意味
            # 探索リストの中から最新のものを取り出し、その値がゴールと一致すれば、アルゴリズムを終了し、返り値として経路リストを返す
            if last_passed_position == goal_coordinates:
                # 経路探索した結果を返り値として返す
                return passed_list
            # ゴールに到達しなかった場合、以下の処理をする
            # 最後に探索した座標の四方を探索
            for position in self.nextCandidatePosition(last_passed_position):
                # 経路リストに探索中の座標を追加した一時リストを作成
                new_passed_list = passed_list + [position]
                # 一時リストのスコアを計算
                position_score = self.distance(new_passed_list) + self.heuristic(position, goal_coordinates)
                # 探索中の座標が、他の経路で探索済みかどうかチェック
                # 探索済みの場合、前回のスコアと今回のスコアを比較
                # 今回のスコアのほうが大きい場合、次の方角の座標の探索へ
                # 最少スコアが最短距離となる
                if position in checked and checked[position] <= position_score:
                    continue
                # 今回のスコアのほうが小さい場合、チェック済みリストに格納
                # 探索ヒープにスコアと経路リストを格納
                checked[position] = position_score
                heapq.heappush(searching_heap, (position_score, new_passed_list))
        return []

    # 計算された最短距離を元に、描画する処理が以下
    def renderPath(self, path):
        self.path = path
        # CalculationAStarAlgorithm.dungeon配列の要素をelementへ格納
        # さらにelementをdungeon_dotへ格納
        # よって、配列＞要素＞単体文字　へ粒度を細かくしていく
        structure = [[dungeon_dot for dungeon_dot in element] for element in self.dungeon]
        #  path[1:-1] 最初から１番目の文字から、最後から１つ前の文字　つまり経路
        # １番最初はスタート地点
        # １番最後はゴール地点
        for dot in path[1:-1]:
            # 探索痕跡は"$"とする
            structure[dot[0]][dot[1]] = "$"
        # path配列に格納されているS地点の座標
        structure[path[0][0]][path[0][1]] = "S"
        # path配列に格納されているG地点の座標
        structure[path[-1][0]][path[-1][1]] = "G"
        return ["".join(l) for l in structure]
        

# 計算結果を出力するクラス
class Result():
    # 探索する迷路を宣言
    dungeon = [
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
        ]
        
    calculation = CalculationAStarAlgorithm(dungeon)
    # 開始を意味する”S”の座標を検索する
    start_coordinates = calculation.getCharacotorCoordinates("S")
    # ゴールを意味する”G”の座標を検索する
    goal_coordinates = calculation.getCharacotorCoordinates("G")
    # aStarAlgorithm関数を使用して探索する
    path = calculation.aStarAlgorithm(start_coordinates, goal_coordinates)

    # 探索したリストになんらかの値が入っていれば以下の処理
    if len(path) > 0:
        print("\n".join(calculation.renderPath(path)))
    # 探索結果が出力されなかったとき、エラー
    else:
        print('failed')

