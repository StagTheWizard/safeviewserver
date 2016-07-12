////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Palette = ["#30638E", "#7EA8BE", "#FBD1A2", "#FC9F5B", "#FF5D73"];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * GRAPH HELPER FUNCTIONS.
 * These are functions that will take a graph element and return the appropriate
 * label, colour of other attributes value based off the element values.
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Collision function that takes a node, checks if it collides with others and attempts to resolve
 * any collisions.
 * @param node          Node to check for collision.
 * @returns {Function}  Collision function.
 */
function collision(node) {
    var r = node.expanded ? 120 : radius(node) * 2,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function (quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}


/**
 * Radius function, determines the radius of a node.
 * @return {number}
 */
function radius(node) {
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
 * Colouring function, determines the colour of a node.
 * @return {string}
 */
function colour(node) {
    if (node.name == "Attacker") {
        return "black";
        //} else if (node.value / 10 > 1.0 || node.value / 10 < 0) {
        //    return "lightblue";
    } else {
        return mapToPalette(node);
    }
}


/**
 * Title function, titles the nodes - currently doing nothing I believe??
 * @deprecated
 * @return {string}
 */
function title(node) {
    return node.name + "\n" + "Breach Probability: " + Math.round(node.value * 100) + "%";
}


/**
 * Text function, determines the name / text of the node that appears (related to a threshold).
 * @return {string}
 */
function text(node) {
    if (node.name == "Attacker") {
        return node.name;
    } else if (node.value > 0.5) {
        return node.name;
    }
}


/**
 * Stashes the original coordinates.
 * @param data
 */
function stash(data) {
    data.x0 = data.x;
    data.dx0 = data.dx;
}


/**
 * Given a node in a partition layout, return an array of all it's ancestor nodes, highest first,
 * but excluding the root.
 * @param node  A node in a partition layout.
 */
function getAncestors(node) {
    var path = [],
        current = node;
    while (current.parent) {
        path.unshift(current);
        current = current.parent;
    }
    return path;
}


/**
 * Map the node to a colour, using a attribute selection function.
 * @param node  The node in question.
 * @param fn    The attribute selection function, if not specified, compares on an assumed
 *              "value" attribute.
 * @returns {*} The colour (as a hex string - using the palette).
 */
function mapToPalette(node, fn) {
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * NODE RENDERING FUNCTIONS.
 * These are functions that will take a graph node and render it accordingly to it's expansion or
 * other future parameters.
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Renders the node, by calling the appropriate more specific rendering function based on expansion
 * state (e.g. expanded = true, then render a sunburst).
 * @param node
 * @param i
 */
function renderNode(node, i) {
    var d3$node = d3.select(this);

    if (node.expanded) {
        renderSunburst(d3$node, node, i);
    } else {
        renderDefault(d3$node, node, i);
    }
}


/**
 * Render the default representation of a node (a circle) and associate events (on mouse over etc).
 * @param d3$node   The node selection.
 * @param node      The node data itself.
 * @param i         The index.
 */
function renderDefault(d3$node, node, i) {
    console.log("Rendering node " + node.id + "[expanded=" + node.expanded + "]");

    var tooltip = d3.select(".tooltip");
    d3$node.append("circle")
        .attr("r", radius)
        .style("fill", colour)
        .on("mouseover", function (node) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(node.name + "<br>" + node.value)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
        })
        .on("mouseout", function (node) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    d3$node.append("text")
        .attr("dx", radius)
        .attr("dy", ".35em")
        .text(text);
}


/**
 * Takes a d3 node selection (group element) and renders within it a sunburst
 * based on the nodes vulnerability tree and relevant event handlers (e.g. on mouse over).
 * @param d3$node   D3 selection of node element (<g></g>)
 * @param node      The bound node data
 * @param i         The node index
 */
function renderSunburst(d3$node, node, i) {
    console.log("Rendering node " + node.id + "[expanded=" + node.expanded + "]");

    var height = 60,
        width = 60,
        r = Math.min(width, height) / 2,
        tooltip = d3.select(".tooltip");

    var on_mouseover = function (tree_node) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        tooltip.html(tree_node.name + "<br>" + tree_node.value)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

        var sequenceArray = getAncestors(tree_node);
        d3$node.selectAll("path")
            .style("opacity", 0.3);

        d3$node.selectAll("path")
            .filter(function (tree_node) {
                if (tree_node === node) return true;
                return (sequenceArray.indexOf(tree_node) >= 0);
            })
            .style("opacity", 1);
    };

    var on_mouseout = function (node) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);

        d3$node.selectAll("path")
            .style("opacity", 1);
    };

    var partition = d3.layout.partition()
        .sort(null)
        .size([2 * Math.PI, r * r])
        .value(function (tree_node) {
            //if (tree_node === node) return node.poe;
            return tree_node.value;
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
                    return mapToPalette(tree_node);
                } else { // tree_node.type == "and" | "or"
                    return "#777";
                }
            })
            .style("fill-rule", "evenodd")
            .each(stash)
        .on("mouseover", on_mouseover)
        .on("mouseout", on_mouseout);

    d3$node.append("text")
        .attr("dx", radius)
        .attr("dy", ".35em")
        .text(text);

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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * THE HARM GRAPH CLASS
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
 * @param d3$svg    The d3 selection of the SVG to render the graph within.
 * @param width     The width of the render.
 * @param height    The height of the render.
 * @constructor
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
        var q = d3.geom.quadtree(nodes),
            i = 0,
            n = nodes.length;

        while (++i < n) q.visit(collision(nodes[i]));

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
                var r = radius(node);
                return node.x = Math.max(r, Math.min(width - r, node.x))
            })
            .attr("cy", function (node) {
                var r = radius(node);
                return node.y = Math.max(r, Math.min(height - r, node.y));
            })
            .attr("transform", function (node) {
                return "translate(" + node.x + "," + node.y + ")";
            });
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
            renderSunburst(d3$node, node, i);
        } else {
            renderDefault(d3$node, node, i);
        }
    };


    this.on_zoom = function () {
        view.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    };


    /**
     * Method of HarmGraph to call to re-create the graph and selector elements
     * from the (assumed to be modified) nodes and links list.
     */
    this.initialise = function () {
        var link_distance = Math.max(width / nodes.length, 60);
        var k = Math.sqrt(nodes.length / (width * height));
        var charge = -10 / k;
        var gravity = 100 * k;

        force = d3.layout.force()
            .size([width, height])
            .charge(-100)
            .linkDistance(50)
            .on("tick", this.on_tick);

        // Define the zoom and drag behaviour.
        var zoom = d3.behavior.zoom()
            .on("zoom", this.on_zoom);
        d3$svg
            .attr("pointer-events", "all")
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMinYMid")
            .call(zoom)
            .on("dblclick.zoom", null);

        view = d3$svg.append("g");

        // Define the div for the tooltip.
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

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
                .each(renderNode)
                .call(force.drag);

        // Nodes double click.
        d3$nodes.on("dblclick", this.on_dblclick);

        // Nodes title.
        d3$nodes.append("title", title);

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
