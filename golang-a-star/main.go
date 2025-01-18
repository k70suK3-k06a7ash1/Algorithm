package main

import (
	"container/heap"
	"fmt"
	"math"
)

// Node: 探索するノード
type Node struct {
	x, y   int
	f, g, h float64
	prev   *Node
}

type PriorityQueue struct {
	elements map[string]*Node
	heap     []*Node
}

func NewPriorityQueue() *PriorityQueue {
	return &PriorityQueue{
		elements: make(map[string]*Node),
		heap:     []*Node{},
	}
}

func (pq *PriorityQueue) Len() int           { return len(pq.heap) }
func (pq *PriorityQueue) Less(i, j int) bool { return pq.heap[i].f < pq.heap[j].f }
func (pq *PriorityQueue) Swap(i, j int) {
	pq.heap[i], pq.heap[j] = pq.heap[j], pq.heap[i]
}
func (pq *PriorityQueue) Push(x interface{}) {
	node := x.(*Node)
	key := fmt.Sprintf("%d,%d", node.x, node.y)
	pq.elements[key] = node
	pq.heap = append(pq.heap, node)
}
func (pq *PriorityQueue) Pop() interface{} {
	n := len(pq.heap)
	node := pq.heap[n-1]
	pq.heap = pq.heap[:n-1]
	key := fmt.Sprintf("%d,%d", node.x, node.y)
	delete(pq.elements, key)
	return node
}
func (pq *PriorityQueue) Contains(x, y int) bool {
	key := fmt.Sprintf("%d,%d", x, y)
	_, exists := pq.elements[key]
	return exists
}

func (pq *PriorityQueue) Update(node *Node) {
	key := fmt.Sprintf("%d,%d", node.x, node.y)
	if _, exists := pq.elements[key]; exists {
		heap.Init(pq)
	}
}

// Grid: マップ情報
type Grid struct {
	width, height int
	obstacles     [][]bool
}

func NewGrid(width, height int, obstacles [][]bool) *Grid {
	return &Grid{width, height, obstacles}
}

func (g *Grid) isValid(x, y int) bool {
	return x >= 0 && x < g.width && y >= 0 && y < g.height && !g.obstacles[y][x]
}

func (g *Grid) getNeighbors(node *Node) []*Node {
	neighbors := []*Node{}
	directions := []struct{ dx, dy int }{
		{0, 1}, {0, -1}, {1, 0}, {-1, 0},
	}
	for _, d := range directions {
		nx, ny := node.x+d.dx, node.y+d.dy
		if g.isValid(nx, ny) {
			neighbors = append(neighbors, &Node{x: nx, y: ny})
		}
	}
	return neighbors
}

func heuristic(a, b *Node) float64 {
	return math.Abs(float64(a.x-b.x)) + math.Abs(float64(a.y-b.y))
}

func reconstructPath(current *Node) []*Node {
	path := []*Node{}
	for current != nil {
		path = append([]*Node{current}, path...)
		current = current.prev
	}
	return path
}

func aStar(grid *Grid, start, goal *Node) []*Node {
	openSet := NewPriorityQueue()
	heap.Push(openSet, start)
	closedSet := make(map[string]*Node)

	start.g = 0
	start.h = heuristic(start, goal)
	start.f = start.g + start.h

	for openSet.Len() > 0 {
		current := heap.Pop(openSet).(*Node)
		if current.x == goal.x && current.y == goal.y {
			return reconstructPath(current)
		}

		key := fmt.Sprintf("%d,%d", current.x, current.y)
		closedSet[key] = current

		for _, neighbor := range grid.getNeighbors(current) {
			neighborKey := fmt.Sprintf("%d,%d", neighbor.x, neighbor.y)
			if _, exists := closedSet[neighborKey]; exists {
				continue
			}

			tentativeG := current.g + 1
			if !openSet.Contains(neighbor.x, neighbor.y) {
				neighbor.g = tentativeG
				neighbor.h = heuristic(neighbor, goal)
				neighbor.f = neighbor.g + neighbor.h
				neighbor.prev = current
				heap.Push(openSet, neighbor)
			} else if tentativeG < neighbor.g {
				neighbor.g = tentativeG
				neighbor.f = neighbor.g + neighbor.h
				neighbor.prev = current
				openSet.Update(neighbor)
			}
		}
	}

	return nil
}

func printPath(grid *Grid, path []*Node) {
	for y := 0; y < grid.height; y++ {
		for x := 0; x < grid.width; x++ {
			found := false
			for _, node := range path {
				if node.x == x && node.y == y {
					fmt.Print("* ")
					found = true
					break
				}
			}
			if !found {
				if grid.obstacles[y][x] {
					fmt.Print("# ")
				} else {
					fmt.Print(". ")
				}
			}
		}
		fmt.Println()
	}
}

func main() {
	obstacles := [][]bool{
		{true, true, true, true, true, true, true, true, true, true},
		{true, false, false, false, false, false, false, false, false, true},
		{true, true, true, true, true, true, false, false, false, true},
		{true, false, false, false, false, true, false, false, false, true},
		{true, false, false, false, false, true, false, false, false, true},
		{true, false, true, true, true, true, false, false, false, true},
		{true, false, false, false, false, false, false, false, false, true},
		{true, true, true, true, true, true, true, true, true, true},
	}

	grid := NewGrid(len(obstacles[0]), len(obstacles), obstacles)
	start := &Node{x: 2, y: 1}
	goal := &Node{x: 7, y: 6}

	path := aStar(grid, start, goal)

	if path != nil {
		fmt.Println("経路:")
		printPath(grid, path)
	} else {
		fmt.Println("経路が見つかりませんでした")
	}
}
