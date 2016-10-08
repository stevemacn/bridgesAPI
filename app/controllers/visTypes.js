
// This module accepts the vistype sent by the client
//    and returns the appropriate visualization type to display
exports.getVisType = function(toCheck) {
  var validTypes = {
        "Array":            "Alist",
        "Array_Stack":      "Alist",
        "Array_Queue":      "Alist",
        "LinkedListStack":  "nodelink",
        "LinkedListQueue":  "nodelink",

        "SinglyLinkedList": "nodelink",
        "llist":            "nodelink",
        "DoublyLinkedList": "nodelink",
        "dllist":           "nodelink",

        "Tree":             "tree",
        "BinaryTree":       "tree",
        "BinarySearchTree": "tree",
        "AVLTree":          "tree",

        "GraphAdjacencyList":   "nodelink",
        "GraphAdjacencyMatrix": "nodelink"
    };

    if( toCheck && validTypes[toCheck] )
      return validTypes[toCheck];
    else
        return "nodelink";
};
