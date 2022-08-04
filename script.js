let nodes = document.getElementsByTagName("g")
for(node of nodes)  node.dispatchEvent(new CustomEvent("click"))
