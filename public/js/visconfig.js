var ele = document.getElementById("vis")
    , width = ele.offsetWidth
     height = ele.offsetHeight

if (d3.bst) { 
    bst = d3.bst(d3, "#vis", width, height)
    bst.make(data)
    ele.scrollTop = height/4
    ele.scrollLeft = width/4
}
else if (d3.queue) {
    d3.queue(d3, "#vis", width, height, data.nodes)
}
else {
    ele.scrollTop = height/4
    ele.scrollLeft = width/4
}



