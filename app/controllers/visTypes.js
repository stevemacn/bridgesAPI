
// This module accepts the vistype sent by the client
//    and returns the appropriate visualization type to display
exports.getVisType = function(toCheck) {
  var validTypes = {
        "ALIST":            "Alist",
        "Array":            "Alist",
        "Array_Stack":      "Alist",
        "Array_Queue":      "Alist",
        "LinkedListStack":  "nodelink",
        "LinkedListQueue":  "nodelink",

        "SinglyLinkedList": "llist",
        "llist":            "llist",
        "DoublyLinkedList": "dllist",
        "dllist":           "dllist",
        "CircularSinglyLinkedList": "cllist",
        "CircularDoublyLinkedList": "cdllist",

        "tree":             "tree",
        "Tree":             "tree",
        "BinaryTree":       "tree",
        "BinarySearchTree": "tree",
        "AVLTree":          "tree",

        "GraphAdjacencyList":   "nodelink",
        "GraphAdjacencyMatrix": "nodelink"
    };

    if( toCheck && validTypes[toCheck] )
      return validTypes[toCheck];
    else if( toCheck && validTypes[toCheck.toString().toUpperCase()] )
      return validTypes[toCheck.toString().toUpperCase()];
    else
        return "nodelink";
};
