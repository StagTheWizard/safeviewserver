/**
 * HarmGraph class.
 *
 * Encapsulates all d3 graph manipulate and data binding.
 * What Harm elements are desired to be shown on the graph are stored externally of this class
 * and then given to it / removed from it when necessary by the externally operating code - in
 * which space the entire Harm itself will persist.
 *
 * Created by montgomeryAnderson on 6/06/16.
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


    var on_tick = function () {
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


    var on_drag_start = function (data) {
        d3.select(this).classed("fixed", data.fixed = true);
    };


    var on_click = function (node) {
        // TODO implement on-click functionality.
    };


    var on_zoom = function () {
        view.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    };


    /**
     * Method of HarmGraph to call to re-create the graph and selector elements
     * from the (assumed to be modified) nodes and links list.
     */
    this.update = function () {
        var link_distance = Math.max(width / nodes.length, 60);

        force = d3.layout.force()
            .size([width, height])
            .charge(-120)
            .linkDistance(link_distance)
            .on("tick", on_tick);

        var zoom = d3.behavior.zoom()
            .on("zoom", on_zoom);
        d3$svg
            .attr("pointer-events", "all")
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMinYMid")
            .call(zoom)
            .on("dblclick.zoom", null);

        view = d3$svg.append("g");

        //force.drag()
        //    .on("dragstart", on_drag_start);

        // Creates the graph data structure.
        force
            .nodes(nodes)
            .links(links)
            .start();

        d3$links = view.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link");

        d3$nodes = view.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(force.drag);

        d3$nodes.append("circle")
            .attr("r", Radius)
            .style("fill", Color);

        d3$nodes.append("text")
            .attr("dx", Radius)
            .attr("dy", ".35em")
            .text(Text);

        d3$nodes.append("title", Title);

        //d3$nodes.on("dblclick", on_click);
    };


    this.addNode = function (node) {
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
        return "orange";
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
    } else {
        return node.name;
    }
}