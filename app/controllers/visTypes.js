
// This module accepts the vistype sent by the client
//    and returns the appropriate visualization type to display
exports.getVisType = function(toCheck) {
  var validTypes = {
        "Array":            "Alist",
        "Array_Stack":      "Alist",
        "Array_Queue":      "Alist",
        "LinkedListStack":  "nodelink",
        "LinkedListQueue":  "nodelink",
        "BinaryTree":       "tree",
        "BinarySearchTree": "tree",
        "SinglyLinkedList": "nodelink",
        "DoublyLinkedList": "nodelink"
    };

    console.log(toCheck, validTypes[toCheck]);

    if( toCheck && validTypes[toCheck] )
      return validTypes[toCheck];
    else
        return "nodelink";
};
