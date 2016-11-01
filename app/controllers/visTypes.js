
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

exports.getArrayType = function(dims){
      if(dims){
          var dimOne = parseInt(dims[0]);
          var dimTwo = parseInt(dims[1]);
          var dimThree = parseInt(dims[2]);
          var is2D = dimTwo > 1 && dimThree == 1;
          var is3D = dimTwo > 1 && dimThree > 1;
          var is1D = !is2D && !is3D;
          if(is1D){
              return "Alist";
          }else if (is2D) {
              return "Array2D";
          }else{
              return "Array3D";
          }
      }
      return "Alist"
}
