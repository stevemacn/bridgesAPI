
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

exports.getVisTypeObject = function(toCheck) {
  var validTypes = {
      "nodelink":   {"vistype":"nodelink",   "script":"/js/graph.js",          "link":""                  	},
          "tree":   {"vistype":"tree",       "script":"/js/tree/lib/bst.js",   "link":"/css/vis/tree.css" 	},
         "queue":   {"vistype":"queue",      "script":"/js/queue.js",          "link":""                  	},
         "Alist":   {"vistype":"Alist",      "script":"/js/array/array.js",    "link":""						        },
       "Array2D":   {"vistype":"Array2D",    "script":"/js/array/array2d.js",  "link":""					         	},
       "Array3D":   {"vistype":"Array3D",    "script":"/js/array/array3d.js",  "link":""					         	},
         "llist":   {"vistype":"llist",      "script":"/js/list/llist.js",     "link":""				        		},
        "dllist":   {"vistype":"dllist",     "script":"/js/list/dllist.js",    "link":""				        		},
        "cllist":   {"vistype":"cllist",     "script":"/js/list/cllist.js",    "link":""				        		},
       "cdllist":   {"vistype":"cdllist",    "script":"/js/list/cdllist.js",   "link":""				        		}
    };
    if( toCheck && validTypes[toCheck] )
      return validTypes[toCheck];
    else if( toCheck && validTypes[toCheck.toString().toUpperCase()] )
      return validTypes[toCheck.toString().toUpperCase()];
    else
        return {"vistype":"nodelink",   "script":"/js/graph.js",          "link":""                  	};
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
