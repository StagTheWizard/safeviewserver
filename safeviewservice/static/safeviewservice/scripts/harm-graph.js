/**
 * HarmGraph class.
 *
 * Encapsulates all d3 graph manipulate and data binding.
 * What Harm elements are desired to be shown on the graph are stored externally of this class
 * and then given to it / removed from it when necessary by the externally operating code - in
 * which space the entire Harm itself will persist.
 *
 * Created by montgomeryAnderson on 6/06/16.
 *
 * @param d3$svg
 * @param width
 * @param height
 */
function HarmGraph(d3$svg, width, height) {

    // The force layout object.
    var force;
    // The view group inside the SVG - on which the scaling and translations are performed (zoom and drag).
    var view;

    var nodes = [];
    var links = [];

    // Note: variables / parameters prefixed with d3$ are d3 selectors.
    var d3$nodes;
    var d3$links;


    this.on_tick = function () {
        // Per tick link updates.
        d3$links
            .attr("x1", function (link) {
                return link.source.x;
            })
            .attr("y1", function (link) {
                return link.source.y;
            })
            .attr("x2", function (link) {
                return link.target.x;
            })
            .attr("y2", function (link) {
                return link.target.y;
            });
        // Per tick node updates.
        d3$nodes
            .attr("cx", function (node) {
                var radius = Radius(node);
                return node.x = Math.max(radius, Math.min(width - radius, node.x))
            })
            .attr("cy", function (node) {
                var radius = Radius(node);
                return node.y = Math.max(radius, Math.min(height - radius, node.y));
            })
            .attr("transform", function (node) {
                return "translate(" + node.x + "," + node.y + ")";
            });
        //d3$nodes.each(Collide(0.5));
    };


    this.on_drag_start = function (data) {
        d3.select(this).classed("fixed", data.fixed = true);
    };


    this.on_dblclick = function (node, i) {
        console.log("Event[dblclick] on node " + node.id);
        console.log(node.value);
        // Expand the node.
        node.expanded = node.expanded ? false : true;

        var d3$node = d3.select(this);
        d3$node.selectAll("*").remove();

        if (node.expanded) {
            RenderSunburst(d3$node, node, i);
        } else {
            RenderDefault(d3$node, node, i);
        }
    };


    this.on_zoom = function () {
        view.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    };


    /**
     * Method of HarmGraph to call to re-create the graph and selector elements
     * from the (assumed to be modified) nodes and links list.
     */
    this.update = function () {
        var link_distance = Math.max(width / nodes.length, 60);
        var k = Math.sqrt(nodes.length / (width * height));
        var charge = -10 / k;
        var gravity = 100 * k;

        force = d3.layout.force()
            .size([width, height])
            .charge(charge)
            //.charge(function (node, i) {
            //    if (node.expanded ) {
            //        return charge - 300;
            //    } else {
            //        return charge;
            //    }
            //})
            .gravity(gravity)
            .linkDistance(link_distance)
            //.linkDistance(function (link, i) {
            //    if (link.source.expanded && link.target.expanded) {
            //        return link_distance + 100;
            //    } else if (link.source.expanded || link.target.expanded) {
            //        return link_distance + 50;
            //    } else {
            //        return link_distance;
            //    }
            //})
            .on("tick", this.on_tick);

        var zoom = d3.behavior.zoom()
            .on("zoom", this.on_zoom);
        d3$svg
            .attr("pointer-events", "all")
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMinYMid")
            .call(zoom)
            .on("dblclick.zoom", null);

        view = d3$svg.append("g");

        //force.drag()
        //    .on("dragstart", this.on_drag_start);

        // Creates the graph data structure.
        force
            .nodes(nodes)
            .links(links)
            .start();

        // Links enter.
        d3$links = view.selectAll(".link")
            .data(links)
            .enter()
                .append("line")
                .attr("class", "link");

        // Nodes enter.
        d3$nodes = view.selectAll(".node")
            .data(nodes)
            .enter()
                .append("g")
                .attr("class", "node")
                .each(RenderNode)
                .call(force.drag);

        // Nodes double click.
        d3$nodes.on("dblclick", this.on_dblclick);

        // Nodes update.
        //d3$nodes.update()
        //    .each(RenderNode);

        // Nodes title.
        d3$nodes.append("title", Title);

    };


    this.addNode = function (node) {
        node.expanded = false;
        nodes.push(node);
    };


    this.addLink = function (link) {
        links.push(link);
    };


    this.addEntireHarm = function (harm) {
        var i_node, node;
        for (i_node = 0; i_node < harm.nodes.length; i_node++) {
            node = harm.nodes[i_node];
            this.addNode(node);
        }
        var i_link, link;
        for (i_link = 0; i_link < harm.links.length; i_link++) {
            link = harm.links[i_link];
            this.addLink(link);
        }
    };


    this.dump = function () {
        return {
            "nodes": nodes,
            "links": links
        }
    };
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * BELOW ARE GRAPH HELPER FUNCTIONS.
 * These are functions that will take a graph element and return the appropriate
 * label, colour of other attributes value based off the element values.
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function Collision(alpha) {
    var padding = 1, radius = 12;
    var quad_tree = d3.geom.quadtree(nodes);
    return function (node) {
        var rb = 2 * radius + padding,
            nx1 = node.x - rb,
            nx2 = node.x + rb,
            ny1 = node.y - rb,
            ny2 = node.y + rb;
        quad_tree.visit(function (quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
                var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y);
                if (l < rb) {
                    l = (l - rb) / l * alpha;
                    node.x -= x *= l;
                    node.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}


/**
 * @return {number}
 */
function Radius(node) {
    if (node.name == "Attacker") {
        return 12;
    }
    if (node.type == "host") {
        return 5 + 5 * node.value;
    } else {
        return 5;
    }
}


/**
 * @return {string}
 */
function Color(node) {
    if (node.name == "Attacker") {
        return "black";
        //} else if (node.value / 10 > 1.0 || node.value / 10 < 0) {
        //    return "lightblue";
    } else {
        return MapToPalette(node);
    }
}


/**
 * @return {string}
 */
function Title(node) {
    return node.name + "\n" + "Breach Probability: " + Math.round(node.value * 100) + "%";
}


/**
 * @return {string}
 */
function Text(node) {
    if (node.name == "Attacker") {
        return node.name;
    } else if (node.value > 0.5) {
        return node.name;
    }
}


/**
 *
 * @param node
 * @param i
 */
function RenderNode(node, i) {
    var d3$node = d3.select(this);

    if (node.expanded) {
        RenderSunburst(d3$node, node, i);
    } else {
        RenderDefault(d3$node, node, i);
    }
}


/**
 *
 * @param d3$node
 * @param node
 * @param i
 */
function RenderDefault(d3$node, node, i) {
    console.log("Rendering node " + node.id + "[expanded=" + node.expanded + "]");
    d3$node.append("circle")
        .attr("r", Radius)
        .style("fill", Color);

    d3$node.append("text")
        .attr("dx", Radius)
        .attr("dy", ".35em")
        .text(Text);
}


/**
 * Takes a d3 node selection (group element) and renders within it a sunburst
 * based on the nodes vulnerability tree.
 * @param d3$node   D3 selection of node element (<g></g>)
 * @param node      The bound node data
 * @param i         The node index
 */
function RenderSunburst(d3$node, node, i) {
    console.log("Rendering node " + node.id + "[expanded=" + node.expanded + "]");
    var height = 60,
        width = 60,
        radius = Math.min(width, height) / 2,
        color = d3.scale.category20c();

    var partition = d3.layout.partition()
        .sort(null)
        .size([2 * Math.PI, radius * radius])
        .value(function (data) {
            return data.value;
        });

    var arc = d3.svg.arc()
        .startAngle(function (data) {
            return data.x;
        })
        .endAngle(function (data) {
            return data.x + data.dx;
        })
        .innerRadius(function (data) {
            return Math.sqrt(data.y);
        })
        .outerRadius(function (data) {
            return Math.sqrt(data.y + data.dy);
        });

    var d3$path = d3$node.datum(node).selectAll("path")
        .data(partition.nodes)
        .enter().append("path")
            .attr("display", function (tree_node) {
                return tree_node.depth; // ? null : "none"; // hides the innermost ring
            })
            .attr("d", arc)
            .style("stroke", "#fff")
            .style("fill", function (tree_node) {
                if (tree_node.type == "host" || tree_node.type == "sibling") {
                    return MapToPalette(tree_node);
                } else { // tree_node.type == "and" | "or"
                    return "#777";
                }
            })
            .style("fill-rule", "evenodd")
            .each(Stash);

    d3$node.append("text")
        .attr("dx", Radius)
        .attr("dy", ".35em")
        .text(Text);

    //d3$path.data(
    //    partition.value(function (tree_node) {
    //        return tree_node.value;
    //    }).nodes);
        //.transition()
        //.duration(1500)
        //.attrTween("d", function (a) {
        //    var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
        //    return function (t) {
        //        var b = i(t);
        //        a.x0 = b.x;
        //        a.dx0 = b.x0;
        //        return arc(b);
        //    };
        //});
}


function Stash(data) { // stash the
    data.x0 = data.x;
    data.dx0 = data.dx;
}


function MapToPalette(node, fn) {
    if (fn == null) {
        fn = function (n) {
            return n.value;
        };
    }
    // Then..
    if (fn(node) < 0.15) {
        return Palette[0];
    } else if (0.15 < fn(node) < 0.4) {
        return Palette[1];
    } else if (0.4 < fn(node) < 0.6) {
        return Palette[2];
    } else if (0.6 < fn(node) < 0.85) {
        return Palette[3];
    } else { // 0.85 < fn(node)
        return Palette[4];
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * BELOW IS THE .
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Palette = ["#30638E", "#7EA8BE", "#FBD1A2", "#FC9F5B", "#FF5D73"];