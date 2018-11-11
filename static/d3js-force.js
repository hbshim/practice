var width;
var height;

var svg = d3.select("svg");

//    width = +svg.attr("width"),
//    height = +svg.attr("height"),

width = window.innerWidth / 2;
height = window.innerHeight / 2;
svg
    .attr("width", width)
    .attr("height", height);
transform = d3.zoomIdentity;

var g = svg.append("g");

svg.call(d3.zoom()
    .scaleExtent([1 / 10, 10])
    .on("zoom", zoomed));

function zoomed() {
    g.attr("transform", d3.event.transform);
}

var link = g.selectAll(".links"),
    node = g.attr("class", "nodes").selectAll("g");

var simulation = d3.forceSimulation()
    .force("node", d3.forceCollide().iterations(1))
    .force("link", d3.forceLink().id(function (d) { return d.uuid }).distance(40))
    .force("charge", d3.forceManyBody().strength(-200).distanceMax(300))
    .force("center", d3.forceCenter(width / 2, height / 2));

var drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

g.append('defs').append('marker')
    .attrs({
        'id': 'arrowhead',
        'viewBox': '-0 -5 10 10',
        'refX': 30 + 10,
        'refY': 0,
        'orient': 'auto',
        'markerWidth': 10,
        'markerHeight': 10,
        'xoverflow': 'visible'
    })
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#999')
    .style('stroke', 'none');

d3.json("/graph", function (error, graph) {
    if (error) throw error;
    update(graph.links, graph.nodes);
    window.addEventListener("resize", update);
});

function update(links, nodes) {
    width = window.innerWidth / 2;
    height = window.innerHeight / 2;
    svg
        .attr("width", width)
        .attr("height", height);
    simulation.force("center", d3.forceCenter(width / 2, height / 2));
    link = link
        .data(links)
        .enter()
        .append("line")
        .attr("class", "links")
        .attr('marker-end', 'url(#arrowhead)')

    link.append("title")
        .text(function (d) { return d.type; });

    edgepaths = g.selectAll(".edgepath")
        .data(links)
        .enter()
        .append('path')
        .attrs({
            'class': 'edgepath',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'id': function (d, i) { return 'edgepath' + i }
        })
        .style("pointer-events", "none")
        ;

    edgelabels = g.selectAll(".edgelabel")
        .data(links)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attrs({
            'class': 'edgelabel',
            'id': function (d, i) { return 'edgelabel' + i },
            'font-size': 10,
            'fill': '#aaa'
        });

    edgelabels.append('textPath')
        .attr('xlink:href', function (d, i) { return '#edgepath' + i })
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("startOffset", "50%")
        .text(function (d) { return d.type; });

    node = node
        .data(nodes)
        .enter().append("g");

    var circles = node.append("circle")
        .attr("id", function (d) { return "node-" + d.id; })
        .attr("r", 30)
        //.on("dblclick", function(d){ alert("node was double clicked"); })
        .on("dblclick", dblclick)
        .call(drag)

    var clipPaths = node.append("clipPath")
        .attr("id", function (d) { return "clip-" + d.id; })
        .append("use")
        .attr("xlink:href", function (d) { return "#node-" + d.id + ""; });

    var lables = node.append("text")
        .attr("clip-path", function (d) { return "url(#clip-" + d.id + ")"; })
        .attrs({ "font-family": "sans-serif", "font-size": "10px", "text-anchor": "middle" })
        .selectAll("tspan")
        .data(function (d) { return d.name != null ? d.name.split(" ") : ""; })
        .enter().append("tspan")
        .attr("x", 0)
        .attr("y", function (d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
        .text(function (d) {
            return d;
        });

    node.append("title")
        .text(function (d) { return d.name; });

    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation
        .force("link")
        .links(links);
}

function ticked() {
    link
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

    node
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })

    edgepaths.attr('d', function (d) {
        var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        //console.log(d)
        return path
    });

    edgelabels
        .attr('transform', function (d, i) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();

                rx = bbox.x + bbox.width / 2;
                ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            }
            else {
                return 'rotate(0)';
            }
        });
}

function dblclick(d) {
    //d3.select(this).classed("fixed", false);
    d.fx = null;
    d.fy = null;
}

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    //d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    //d3.select(this).classed("fixed", true);
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = d.x;
    d.fy = d.y;
}