/**
 * Test fixtures — kept separate from domain data (data.js).
 * Map of problemId -> array of assertions.
 *   { call: "<JS expression that uses the user's function/class>", expected: <value>, unordered?: true }
 * The expression is evaluated in the SAME scope as the user's code, so it can
 * reference functions/classes the user defined (e.g. isPrime, twoSum, MinStack).
 * `unordered: true` compares arrays ignoring order (deep-sorted) — for problems
 * whose valid output order isn't fixed.
 *
 * Problems without an entry here have no automated tests (self-check against the example).
 */
window.DSA = window.DSA || {};
DSA.TESTS = {
  // Level 1 — Math Basics
  "1-1": [{ call: "isPrime(7)", expected: true }, { call: "isPrime(1)", expected: false }, { call: "isPrime(12)", expected: false }, { call: "isPrime(29)", expected: true }, { call: "isPrime(2)", expected: true }, { call: "isPrime(0)", expected: false }, { call: "isPrime(97)", expected: true }],
  "1-2": [{ call: "isArmstrong(153)", expected: true }, { call: "isArmstrong(123)", expected: false }, { call: "isArmstrong(9474)", expected: true }, { call: "isArmstrong(370)", expected: true }, { call: "isArmstrong(100)", expected: false }, { call: "isArmstrong(1634)", expected: true }],
  "1-3": [{ call: "factorial(5)", expected: 120 }, { call: "factorial(0)", expected: 1 }, { call: "factorial(6)", expected: 720 }, { call: "factorial(1)", expected: 1 }, { call: "factorial(7)", expected: 5040 }],

  // Level 2 — Arrays
  "2-1": [{ call: "twoSum([2,7,11,15], 9)", expected: [0, 1] }, { call: "twoSum([3,2,4], 6)", expected: [1, 2] }, { call: "twoSum([3,3], 6)", expected: [0, 1] }],
  "2-2": [{ call: "maxProfit([7,1,5,3,6,4])", expected: 5 }, { call: "maxProfit([7,6,4,3,1])", expected: 0 }, { call: "maxProfit([1,2,3,4,5])", expected: 4 }, { call: "maxProfit([2,4,1])", expected: 2 }],
  "2-3": [{ call: "removeDuplicates([1,1,2])", expected: 2 }, { call: "removeDuplicates([0,0,1,1,1,2,2,3,3,4])", expected: 5 }, { call: "removeDuplicates([1,2,3])", expected: 3 }, { call: "removeDuplicates([5])", expected: 1 }],

  // Level 3 — Strings
  "3-1": [{ call: 'isAnagram("anagram","nagaram")', expected: true }, { call: 'isAnagram("rat","car")', expected: false }, { call: 'isAnagram("listen","silent")', expected: true }, { call: 'isAnagram("ab","a")', expected: false }],
  "3-2": [{ call: 'isPalindrome("A man, a plan, a canal: Panama")', expected: true }, { call: 'isPalindrome("race a car")', expected: false }, { call: 'isPalindrome("")', expected: true }, { call: 'isPalindrome("0P")', expected: false }],
  "3-3": [{ call: 'longestCommonPrefix(["flower","flow","flight"])', expected: "fl" }, { call: 'longestCommonPrefix(["dog","racecar","car"])', expected: "" }, { call: 'longestCommonPrefix(["throne","throne"])', expected: "throne" }, { call: 'longestCommonPrefix(["a"])', expected: "a" }],

  // Level 4 — Hashing
  "4-1": [{ call: "containsDuplicate([1,2,3,1])", expected: true }, { call: "containsDuplicate([1,2,3,4])", expected: false }, { call: "containsDuplicate([1,1,1,3,3,4,3,2,4,2])", expected: true }, { call: "containsDuplicate([5])", expected: false }],
  "4-2": [{ call: 'groupAnagrams(["eat","tea","tan","ate","nat","bat"])', expected: [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]], unordered: true }],
  "4-3": [{ call: "topKFrequent([1,1,1,2,2,3], 2)", expected: [1, 2], unordered: true }],

  // Level 5 — Stack & Queue
  "5-1": [{ call: 'isValid("{[]}")', expected: true }, { call: 'isValid("(]")', expected: false }, { call: 'isValid("()[]{}")', expected: true }, { call: 'isValid("(")', expected: false }, { call: 'isValid("([)]")', expected: false }, { call: 'isValid("")', expected: true }],
  "5-2": [{ call: "(()=>{const s=new MinStack();s.push(-2);s.push(0);s.push(-3);return s.getMin();})()", expected: -3 }],
  "5-3": [{ call: "(()=>{const q=new MyQueue();q.push(1);q.push(2);return [q.peek(),q.pop(),q.empty()];})()", expected: [1, 1, false] }],
  "5-4": [{ call: "(()=>{const s=new Stack();s.push(1);s.push(2);s.push(3);return [s.pop(),s.peek(),s.size(),s.isEmpty()];})()", expected: [3, 2, 2, false] }, { call: "(()=>{const s=new Stack();return [s.pop(),s.isEmpty()];})()", expected: [undefined, true] }],
  "5-5": [{ call: "(()=>{const q=new Queue();q.enqueue(1);q.enqueue(2);q.enqueue(3);return [q.dequeue(),q.front(),q.size(),q.isEmpty()];})()", expected: [1, 2, 2, false] }, { call: "(()=>{const q=new Queue();return [q.dequeue(),q.isEmpty()];})()", expected: [undefined, true] }],
  "5-6": [{ call: "(()=>{const d=new Deque();d.addRear(1);d.addFront(2);return [d.removeRear(),d.removeFront(),d.size()];})()", expected: [1, 2, 0] }],

  // Level 6 — Linked List
  "6-1": [{ call: "(()=>{const h=new ListNode(1,new ListNode(2,new ListNode(3)));let r=reverseList(h),o=[];while(r){o.push(r.val);r=r.next;}return o;})()", expected: [3, 2, 1] }],
  "6-2": [{ call: "(()=>{const h=new ListNode(1,new ListNode(2,new ListNode(3,new ListNode(4,new ListNode(5)))));return middleNode(h).val;})()", expected: 3 }],
  "6-3": [{ call: "(()=>{const a=new ListNode(3),b=new ListNode(2),c=new ListNode(0),d=new ListNode(-4);a.next=b;b.next=c;c.next=d;d.next=b;return hasCycle(a);})()", expected: true }, { call: "(()=>{const a=new ListNode(1,new ListNode(2));return hasCycle(a);})()", expected: false }],
  "6-4": [{ call: "(()=>{const l=new LinkedList();l.append(1);l.append(2);l.prepend(0);return [l.toArray(),l.size()];})()", expected: [[0, 1, 2], 3] }],

  // Level 7 — Recursion
  "7-1": [{ call: "fib(6)", expected: 8 }, { call: "fib(10)", expected: 55 }, { call: "fib(0)", expected: 0 }, { call: "fib(1)", expected: 1 }, { call: "fib(9)", expected: 34 }],
  "7-2": [{ call: "generateParenthesis(3)", expected: ["((()))", "(()())", "(())()", "()(())", "()()()"], unordered: true }],
  "7-3": [{ call: 'letterCombinations("23")', expected: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"], unordered: true }],

  // Level 8 — Binary Search
  "8-1": [{ call: "search([-1,0,3,5,9,12], 9)", expected: 4 }, { call: "search([-1,0,3,5,9,12], 2)", expected: -1 }, { call: "search([5], 5)", expected: 0 }, { call: "search([2,5], 5)", expected: 1 }],
  "8-2": [{ call: "search([4,5,6,7,0,1,2], 0)", expected: 4 }, { call: "search([4,5,6,7,0,1,2], 3)", expected: -1 }],
  "8-3": [{ call: "findPeakElement([1,2,3,1])", expected: 2 }],

  // Level 9 — Sorting
  "9-1": [{ call: "(()=>{const n=[2,0,2,1,1,0];sortColors(n);return n;})()", expected: [0, 0, 1, 1, 2, 2] }],
  "9-2": [{ call: "merge([[1,3],[2,6],[8,10],[15,18]])", expected: [[1, 6], [8, 10], [15, 18]] }, { call: "merge([[1,4],[4,5]])", expected: [[1, 5]] }, { call: "merge([[1,4],[2,3]])", expected: [[1, 4]] }],
  "9-3": [{ call: "findKthLargest([3,2,1,5,6,4], 2)", expected: 5 }],

  // Level 10 — Two Pointers
  "10-1": [{ call: "twoSum([2,7,11,15], 9)", expected: [1, 2] }],
  "10-2": [{ call: "threeSum([-1,0,1,2,-1,-4])", expected: [[-1, -1, 2], [-1, 0, 1]], unordered: true }],
  "10-3": [{ call: "maxArea([1,8,6,2,5,4,8,3,7])", expected: 49 }],

  // Level 11 — Sliding Window
  "11-1": [{ call: 'lengthOfLongestSubstring("abcabcbb")', expected: 3 }, { call: 'lengthOfLongestSubstring("bbbbb")', expected: 1 }, { call: 'lengthOfLongestSubstring("pwwkew")', expected: 3 }, { call: 'lengthOfLongestSubstring("")', expected: 0 }, { call: 'lengthOfLongestSubstring("au")', expected: 2 }],
  "11-2": [{ call: "findMaxAverage([1,12,-5,-6,50,3], 4)", expected: 12.75 }],
  "11-3": [{ call: "minSubArrayLen(7, [2,3,1,2,4,3])", expected: 2 }],

  // Level 12 — Prefix Sum
  "12-1": [{ call: "(()=>{const na=new NumArray([-2,0,3,-5,2,-1]);return [na.sumRange(0,2),na.sumRange(2,5)];})()", expected: [1, -1] }],
  "12-2": [{ call: "subarraySum([1,1,1], 2)", expected: 2 }, { call: "subarraySum([1,2,3], 3)", expected: 2 }],
  "12-3": [{ call: "productExceptSelf([1,2,3,4])", expected: [24, 12, 8, 6] }],

  // Level 13 — Intervals
  "13-1": [{ call: "insert([[1,3],[6,9]], [2,5])", expected: [[1, 5], [6, 9]] }],
  "13-2": [{ call: "eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]])", expected: 1 }],
  "13-3": [{ call: "minMeetingRooms([[0,30],[5,10],[15,20]])", expected: 2 }],

  // Level 14 — Binary Trees
  "14-1": [{ call: "(()=>{const r=new TreeNode(3,new TreeNode(9),new TreeNode(20,new TreeNode(15),new TreeNode(7)));return maxDepth(r);})()", expected: 3 }],
  "14-2": [{ call: "(()=>{const r=new TreeNode(3,new TreeNode(9),new TreeNode(20,new TreeNode(15),new TreeNode(7)));return levelOrder(r);})()", expected: [[3], [9, 20], [15, 7]] }],

  // Level 15 — BST
  "15-1": [{ call: "(()=>{const r=new TreeNode(2,new TreeNode(1),new TreeNode(3));return isValidBST(r);})()", expected: true }, { call: "(()=>{const r=new TreeNode(5,new TreeNode(1),new TreeNode(4,new TreeNode(3),new TreeNode(6)));return isValidBST(r);})()", expected: false }],
  "15-2": [{ call: "(()=>{const r=new TreeNode(6,new TreeNode(2),new TreeNode(8));return lowestCommonAncestor(r,r.left,r.right).val;})()", expected: 6 }],
  "15-3": [{ call: "(()=>{const r=new TreeNode(3,new TreeNode(1,null,new TreeNode(2)),new TreeNode(4));return kthSmallest(r,1);})()", expected: 1 }],

  // Level 16 — Heap
  "16-1": [{ call: "kClosest([[1,3],[-2,2]], 1)", expected: [[-2, 2]], unordered: true }],
  "16-2": [{ call: "lastStoneWeight([2,7,4,1,8,1])", expected: 1 }],
  "16-3": [{ call: "(()=>{const m=new MedianFinder();m.addNum(1);m.addNum(2);const a=m.findMedian();m.addNum(3);return [a,m.findMedian()];})()", expected: [1.5, 2] }],

  // Level 17 — Trie
  "17-1": [{ call: '(()=>{const t=new Trie();t.insert("apple");return [t.search("apple"),t.search("app"),t.startsWith("app")];})()', expected: [true, false, true] }],
  "17-2": [{ call: '(()=>{const d=new WordDictionary();d.addWord("bad");d.addWord("dad");return [d.search("pad"),d.search("bad"),d.search(".ad"),d.search("b..")];})()', expected: [false, true, true, true] }],
  "17-3": [{ call: 'replaceWords(["cat","bat","rat"], "the cattle was rattled by the battery")', expected: "the cat was rat by the bat" }],

  // Level 18 — Union Find
  "18-1": [{ call: "findCircleNum([[1,1,0],[1,1,0],[0,0,1]])", expected: 2 }],
  "18-2": [{ call: "findRedundantConnection([[1,2],[1,3],[2,3]])", expected: [2, 3] }],

  // Level 19 — Graph Traversal
  "19-1": [{ call: 'numIslands([["1","1","0"],["0","1","0"],["0","0","1"]])', expected: 2 }],
  "19-3": [{ call: "floodFill([[1,1,1],[1,1,0],[1,0,1]], 1, 1, 2)", expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] }],

  // Level 20 — Topological Sort
  "20-1": [{ call: "canFinish(2, [[1,0]])", expected: true }, { call: "canFinish(2, [[1,0],[0,1]])", expected: false }],

  // Level 21 — Shortest Paths
  "21-1": [{ call: "networkDelayTime([[2,1,1],[2,3,1],[3,4,1]], 4, 2)", expected: 2 }],
  "21-2": [{ call: "findCheapestPrice(4, [[0,1,100],[1,2,100],[2,3,100]], 0, 3, 1)", expected: -1 }, { call: "findCheapestPrice(3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 1)", expected: 200 }],
  "21-3": [{ call: "minimumEffortPath([[1,2,2],[3,8,2],[5,3,5]])", expected: 2 }],

  // Level 22 — MST
  "22-1": [{ call: "minCostConnectPoints([[0,0],[2,2],[3,10],[5,2],[7,0]])", expected: 20 }],
  "22-2": [{ call: "minimumCost(3, [[1,2,5],[1,3,6],[2,3,1]])", expected: 6 }],
  "22-3": [{ call: "minCostToSupplyWater(3, [1,2,2], [[1,2,1],[2,3,1]])", expected: 3 }],

  // Level 23 — Greedy
  "23-1": [{ call: "canJump([2,3,1,1,4])", expected: true }, { call: "canJump([3,2,1,0,4])", expected: false }],
  "23-2": [{ call: "canCompleteCircuit([1,2,3,4,5], [3,4,5,1,2])", expected: 3 }],
  "23-3": [{ call: 'leastInterval(["A","A","A","B","B","B"], 2)', expected: 8 }],

  // Level 24 — DP I
  "24-1": [{ call: "climbStairs(5)", expected: 8 }, { call: "climbStairs(2)", expected: 2 }, { call: "climbStairs(1)", expected: 1 }, { call: "climbStairs(3)", expected: 3 }],
  "24-2": [{ call: "rob([2,7,9,3,1])", expected: 12 }, { call: "rob([1,2,3,1])", expected: 4 }, { call: "rob([2,1,1,2])", expected: 4 }, { call: "rob([5])", expected: 5 }],
  "24-3": [{ call: "coinChange([1,2,5], 11)", expected: 3 }, { call: "coinChange([2], 3)", expected: -1 }, { call: "coinChange([1], 0)", expected: 0 }, { call: "coinChange([1,2,5], 100)", expected: 20 }],

  // Level 25 — DP II
  "25-1": [{ call: "lengthOfLIS([10,9,2,5,3,7,101,18])", expected: 4 }, { call: "lengthOfLIS([0,1,0,3,2,3])", expected: 4 }, { call: "lengthOfLIS([7,7,7,7])", expected: 1 }],
  "25-2": [{ call: 'longestCommonSubsequence("abcde","ace")', expected: 3 }],
  "25-3": [{ call: "knapsack([1,3,4,5], [1,4,5,7], 7)", expected: 9 }],

  // Level 26 — Backtracking
  "26-1": [{ call: "subsets([1,2,3])", expected: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]], unordered: true }],
  "26-2": [{ call: "solveNQueens(4).length", expected: 2 }],

  // Level 27 — Bit Manipulation
  "27-1": [{ call: "singleNumber([4,1,2,1,2])", expected: 4 }, { call: "singleNumber([1])", expected: 1 }, { call: "singleNumber([2,2,1])", expected: 1 }],
  "27-2": [{ call: "hammingWeight(11)", expected: 3 }, { call: "hammingWeight(128)", expected: 1 }, { call: "hammingWeight(0)", expected: 0 }, { call: "hammingWeight(7)", expected: 3 }],
  "27-3": [{ call: "swap(5,9)", expected: [9, 5] }],

  // Level 28 — Advanced Data Structures
  "28-1": [{ call: "(()=>{const c=new LRUCache(2);c.put(1,1);c.put(2,2);const a=c.get(1);c.put(3,3);const b=c.get(2);return [a,b];})()", expected: [1, -1] }],
  "28-2": [{ call: "(()=>{const t=new Twitter();t.postTweet(1,5);return t.getNewsFeed(1);})()", expected: [5] }],

  // Level 30 — Advanced Topics
  "30-1": [{ call: "(()=>{const st=new SegmentTree([1,3,5]);const a=st.query(0,2);st.update(1,2);return [a,st.query(0,2)];})()", expected: [9, 8] }],
  "30-2": [{ call: "(()=>{const b=new FenwickTree(4);[1,2,3,4].forEach((v,i)=>b.update(i+1,v));const a=b.query(2);b.update(1,5);return [a,b.query(2)];})()", expected: [3, 8] }],
  "30-3": [{ call: "countSubsetsWithSum([1,2,3,4], 5)", expected: 2 }],

  // ---- validity-based checks for problems with multiple valid answers ----
  "14-3": [{ call: `(()=>{const r=new TreeNode(4,new TreeNode(2,new TreeNode(1),new TreeNode(3)),new TreeNode(7,new TreeNode(6),new TreeNode(9)));const inv=invertTree(r)||r;const out=[],q=[inv];while(q.length){const n=q.shift();if(!n)continue;out.push(n.val);q.push(n.left,n.right);}return out;})()`, expected: [4, 7, 2, 9, 6, 3, 1] }],

  "18-3": [{ call: `(()=>{const r=accountsMerge([["John","a@x","b@x"],["John","b@x","c@x"],["Mary","m@x"]]);return r.map(a=>[a[0]].concat(a.slice(1).sort())).sort((x,y)=>JSON.stringify(x)<JSON.stringify(y)?-1:1);})()`, expected: [["John", "a@x", "b@x", "c@x"], ["Mary", "m@x"]] }],

  "19-2": [{ call: `(()=>{const a=new Node(1),b=new Node(2),c=new Node(3),d=new Node(4);a.neighbors=[b,d];b.neighbors=[a,c];c.neighbors=[b,d];d.neighbors=[a,c];const cl=cloneGraph(a);const seen=new Set(),order=[],q=[cl];seen.add(cl);while(q.length){const n=q.shift();order.push([n.val,n.neighbors.map(x=>x.val).sort((p,q)=>p-q)]);for(const nb of n.neighbors)if(!seen.has(nb)){seen.add(nb);q.push(nb);}}order.sort((x,y)=>x[0]-y[0]);return {same:cl===a,order};})()`, expected: { same: false, order: [[1, [2, 4]], [2, [1, 3]], [3, [2, 4]], [4, [1, 3]]] } }],

  "20-2": [
    { call: `(()=>{const p=[[1,0],[2,0],[3,1],[3,2]];const o=findOrder(4,p);if(!o||o.length!==4)return false;const pos={};o.forEach((c,i)=>pos[c]=i);return p.every(([a,b])=>pos[b]<pos[a]);})()`, expected: true },
    { call: `(()=>{const o=findOrder(2,[[1,0],[0,1]]);return o.length;})()`, expected: 0 },
  ],

  "20-3": [{ call: `(()=>{const words=["wrt","wrf","er","ett","rftt"];const res=alienOrder(words);if(!res)return false;const pos={};[...res].forEach((c,i)=>pos[c]=i);for(let i=0;i+1<words.length;i++){const a=words[i],b=words[i+1];let k=0;while(k<a.length&&k<b.length&&a[k]===b[k])k++;if(k<a.length&&k<b.length){if(pos[a[k]]>=pos[b[k]])return false;}else if(a.length>b.length)return false;}return res.length>=1;})()`, expected: true }],

  "26-3": [{ call: `(()=>{const board=[["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]];solveSudoku(board);const n=board.map(r=>r.map(Number));const ok=a=>{const s=new Set(a);return s.size===9&&![...s].some(x=>x<1||x>9);};for(let i=0;i<9;i++){if(!ok(n[i]))return false;if(!ok(n.map(r=>r[i])))return false;}for(let bi=0;bi<9;bi+=3)for(let bj=0;bj<9;bj+=3){const box=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)box.push(n[bi+i][bj+j]);if(!ok(box))return false;}return true;})()`, expected: true }],

  "28-3": [{ call: `(()=>{const s=new RandomizedSet();const a=s.insert(1);const b=s.insert(1);const c=s.remove(2);s.insert(2);const d=s.remove(1);return [a,b,c,d,s.getRandom()];})()`, expected: [true, false, false, true, 2] }],

  "29-1": [{ call: "kosarajuSCC(5, [[0,1],[1,2],[2,0],[1,3],[3,4]])", expected: [[0, 1, 2], [3], [4]], unordered: true }],
  "29-2": [{ call: "articulationPoints(5, [[0,1],[1,2],[2,0],[1,3],[3,4]])", expected: [1, 3], unordered: true }],
  "29-3": [{ call: "findBridges(5, [[0,1],[1,2],[2,0],[1,3],[3,4]])", expected: [[1, 3], [3, 4]], unordered: true }],
};
