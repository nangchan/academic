/**
 * Priority Queue or min/max heap used to store semi-ordered list of elements.
 * Used for Dijkstras algorithm to pull min cost element from list of elements on working priority queue.
 */
class PriorityQueue {

    /**
     * Function used to compare elements in priority queue. Used when determining when to swap child and parent nodes in binary tree.
     * Eg. child < parent - means swap child and parent if child is less than parent making this a min-queue
     * Eg. child > parent - means swap child and parent if child is greater than parent making this a max-queue
     *
     * @callback compareFunction
     * @param {*} child - When element added to priority queue it is added as a child node
     * @param {*} parent - When re-balancing priority queue used to determine whether parent and child needs to be swapped
     */

    /**
     * Initialize priority queue with optional array and comparison function. Default min-queue.
     *
     * @param {*[]} [queue] - Array used to initialize priority queue (needs to be already ordered or semi-ordered)
     * @param {compareFunction} [compare] - Array used to initialize priority queue (needs to be already ordered or semi-ordered)
     */
    constructor(queue, compare=(child, parent) => child < parent) {
        this.queue = [...queue||[]];
        this.compare = compare;
    }
    /**
     * Used to get length of inner queue. Implmemented as a get since queue.length is dynamic
     * @returns {number} Number of elements in priority queue
     */
    get length() {
        return this.queue.length;
    }
    /**
     * Add to priority queue
     * @param {*} val - Element to add
     */
    push(val) {
        this.queue.push(val);
        this._pushBalance();
    }
    /**
     * Get min/max element
     * @return {*} - First element in queue
     */
    get() {
        return this.queue.length > 0 ? this.queue[0] : null;
    }
    /**
     * Get and remove min/max element
     * @return {*} - First element in queue
     */
    pop() {
        let max = null;
        if (this.queue.length > 0) {
            max = this.queue[0];
            this._popBalance();
        }
        return max;
    }
    /**
     * Private method used to rebalance after a push. Adds to end of queue and swaps with parent until balanced.
     * Child gets added in last position and child moves up in binary tree.
     */
    _pushBalance() {
        let pivotIndex = this.queue.length - 1;
        while (pivotIndex > 0) {
            let parentIndex = (pivotIndex - 1) >> 1;
            // determine which sibling matches the criteria for swap candidate (eg. for min-queue which sibling is smaller)
            let leftIndex = pivotIndex % 2 == 1 ? pivotIndex : pivotIndex-1;
            let rightIndex = pivotIndex % 2 == 0 ? pivotIndex : pivotIndex+1; // may be out-of-bounds
            let childIndex = -1;
            // compare returns true then chooe left child
            if (rightIndex >= this.queue.length || this.compare(this.queue[leftIndex], this.queue[rightIndex])) {
                childIndex = leftIndex;
            } else {
                childIndex = rightIndex;
            }
            // swap parent with child if child needs to be moved up
            if (this.compare(this.queue[childIndex], this.queue[parentIndex])) {
                [this.queue[parentIndex], this.queue[childIndex]] = [this.queue[childIndex], this.queue[parentIndex]];
            }
            // set new pivot as parent
            pivotIndex = parentIndex;
        }
    }
    /**
     * Private method used to rebalance after a pop. Last element removed and replaces first element then swaps with child until balanced.
     * Last element becomes new parent and parent moves down in binary tree.
     */
    _popBalance() {
        let pivotIndex = 0; // parent is pivot
        let newRoot = this.queue.pop();
        if (this.queue.length > 0) {
            this.queue[pivotIndex] = newRoot;
        }
        while (pivotIndex < this.queue.length - 1) {
            // determine which sibling matches the criteria for swap candidate (eg. for min-queue which sibling is smaller)
            let leftIndex = ((pivotIndex + 1) * 2) - 1;   // may be out-of-bounds
            let rightIndex = ((pivotIndex + 1) * 2);      // may be out-of-bounds
            let childIndex = Infinity;
            // only process if not out of bounds
            if (leftIndex < this.queue.length) {
                // compare returns true then chooe left child
                if (rightIndex >= this.queue.length || this.compare(this.queue[leftIndex], this.queue[rightIndex])) {
                    childIndex = leftIndex;
                } else {
                    childIndex = rightIndex;
                }

                // swap parent with child if parent needs to be moved down
                if (this.compare(this.queue[childIndex], this.queue[pivotIndex])) {
                    [this.queue[pivotIndex], this.queue[childIndex]] = [this.queue[childIndex], this.queue[pivotIndex]];
                }
            }
            // set new pivot as child
            pivotIndex = childIndex;
        }
    }
}

/**
 * Min-queue based on PriorityQueue class.
 */
class MinQueue extends PriorityQueue {
    constructor(queue) {
        super(queue, (child, parent) => child < parent);
    }
}

/**
 * Max-queue based on PriorityQueue class.
 */
class MaxQueue extends PriorityQueue {
    constructor(queue) {
        super(queue, (child, parent) => child > parent);
    }
}

/**
 * Class representing edges of a graph with associated costs
 */
class Edge {
    constructor(vertex, cost) {
        this.vertex = vertex;
        this.cost = cost;
    }
}
/**
 * Class representing vertices in a graph containing an array of edges
 */
class Vertex {
    constructor(val) {
        this.val = val;
        this.edges = [
            // [Edge]
        ];
    }
}
/**
 * Graph of vertex and edge with cost associated
 * Supports Dijstras algorithm to return distance map from source to destination
 */
class Graph {
    /**
     * Initialize a graph that stores a lookup table that maps { vertex-value => Vertex }
     */
    constructor() {
        this.lookup = {
            // [string] : [Vertex]
        };
    }
    /**
     * Builds a graph from a array of tuples that includes [source vertex name/id, destination vertex name/id, cost].
     * Stores all vertices in this.lookup table.
     *
     * @param {Object[][]} connections - Double array representing the source-destination cost [source vertex name/id, destination vertex name/id, cost] (eg. [['a','b',5],['a','c',2]...])
     * @returns {Graph} Newly created graph
     */
    static create(connections) {
        let graph = new Graph();
        for (let [src, dst, cost] of connections) {
            // create or get node
            let srcVertex = graph.lookup[src] || new Vertex(src);
            let dstVertex = graph.lookup[dst] || new Vertex(dst);

            // add destination to source edges
            srcVertex.edges.push(new Edge(dstVertex, cost));

            // store in lookup table if not already stored
            graph.lookup[src] = srcVertex;
            graph.lookup[dst] = dstVertex;
        }
        return graph;
    }
    /**
     * Function used to do some work when visiting all edges of a graph starting from the source vertex
     *
     * @callback workFunction
     * @param {Vertex} vertex - Vertex in the traversal
     * @param {Edge} edge - Edge in the traversal from the source vertex to all reachable destination vertex
     */

    /**
     * Breadth-first-seach traveral of graph using visited map to prevent infinity loops in a cycle.
     *
     * @param {Vertex} source - Starting vertex used for bfs traversal
     * @param {workFunction} [func] - Function used to do work when traversing each edge
     */
    static bfs(source, func=(vertex, edge) => console.log(vertex.val, edge.vertex.val, edge.cost)) {
        let visited = {
            // [string] : [boolean]
        };
        let queue = [source];
        while (queue.length > 0) {
            let currVert = queue.shift();
            if (!visited[currVert.val]) {
                for (let edge of currVert.edges) {
                    func(currVert, edge);
                    queue.push(edge.vertex);
                }
                visited[currVert.val] = true;
            }
        }
    }
    /**
     * Distras algorithm to return min distance from source to all reachable
     * destination via greedy algorithm implemented thru min-queue
     *
     * @param {Vertex} source - Source vertex used for distance determination
     * @returns {Object} Hash table of type {[number]:[number]} used to store mapping of { vertex-value => cost }
     */
    static dijkstra(source) {
        // tracks visited nodes to prevent infinite loop in graph with cycle
        let visited = {
            // [string] : [boolean]
        };
        // stores minimum distance from source to distination vertex
        // stores { [destination-vertex] => [cost] }
        let distance = {
            // [number] : [number]
            [source.val]: 0, // start with distance 0 to the source
        };
        // comparison works since distance map built up before vertices are added to the (min) priority queue
        let priorityQ = new PriorityQueue([source], (child, parent) => distance[child.val] < distance[parent.val]);
        while (priorityQ.length > 0) {
            let currVert = priorityQ.pop();
            if (!visited[currVert.val]) {
                visited[currVert.val] = true;
                for (let edge of currVert.edges) {
                    // relax neighboring vertices (ie. update distance table with minimum distance)
                    if (distance[edge.vertex.val] === undefined || distance[edge.vertex.val] > distance[currVert.val] + edge.cost) {
                        distance[edge.vertex.val] = distance[currVert.val] + edge.cost;
                    }
                    // add to priority queue
                    priorityQ.push(edge.vertex);
                }
            }
        }
        return distance;
    }
}
function main(connections) {
    let graph = Graph.create(connections);
    console.log(graph.lookup);
    console.log(Graph.dijkstra(graph.lookup[1]));
    Graph.bfs(graph.lookup[1]);
    let minq = new MaxQueue();
    minq.push(1);
    minq.push(2);
    minq.push(3);
    minq.push(4);
    minq.push(5);
    console.log(minq.queue);
    console.log(minq.pop());
    console.log(minq.pop());
    console.log(minq.pop());
    console.log(minq.pop());
    console.log(minq.pop());
}
main([
    [1,2,2],
    [1,3,4],
    [2,4,7],
    [2,3,1],
    [3,5,3],
    [4,6,1],
    [5,4,2],
    [5,6,5],
]);
