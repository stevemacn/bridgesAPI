var ele = document.getElementById("vis")
    , width = ele.offsetWidth
     height = ele.offsetHeight

bst = d3.bst(d3, "#vis", width, height)
bst.make(data[0])
