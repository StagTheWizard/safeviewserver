"""
A conversion script for converting JSON formatted HARMs to XML variations.

python3 convert.py [-i] <input_file> [<output_file>]

"""

import json, xml.etree.cElementTree as etree
import sys


def read_json(json_str):
    harm_dict = json.loads(json_str)


def read_xml(xml_str):
    pass


def write_json(harm):
    pass


def write_xml(harm):
    # Create the root harm element
    xml_harm = etree.Element(
        tag='harm',
        attrib={
            'xmlns':
                'http://localhost:8000/safeview/harm',
            'xmlns:xsi':
                'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation':
                'http://localhost:8000/safeview/harm http://localhost:8000/static/safevoewservoce/xml/harm.xsd',
        })

    # <nodes>
    xml_nodes = etree.Element(tag='nodes')
    for node in harm['nodes']:
        xml_nodes.append(parse_node_to_xml(node))
    xml_harm.append(xml_nodes)

    # <edges>
    xml_edges = etree.Element(tag='edges')
    for edge in harm['edges']:
        xml_edges.append(parge_edge_to_xml(edge))
    xml_harm.append(xml_edges)

    # <upperLayers>
    xml_upper_layers = etree.Element(tag='upperLayers')
    xml_harm.append(xml_upper_layers)

    return xml_harm


def parse_node_to_xml(node):
    xml_node = etree.Element(
        tag='node',
        attrib={
            'id': node.id,
            'name': node.name
        })

    # <values>
    xml_values = etree.Element(tag='values')
    for key, value in node['values']:
        # <value>
        xml_value = etree.Element(tag=key)
        xml_value.text = value
        xml_values.append(xml_value)
    xml_node.append(xml_values)

    # <vulnerabilities>
    xml_vulnerabilities = etree.Element(tag='vulnerabilities')
    root_vulnerability = node['vulnerabilities'][0]
    xml_vulnerabilities.append(parse_vulnerability_to_xml(root_vulnerability))
    xml_node.append(xml_vulnerabilities)

    return xml_node


def parge_edge_to_xml(edge):
    xml_edge = etree.Element(tag='edge')

    xml_source = etree.Element(tag='source')
    xml_source.text = edge['source']
    xml_edge.append(xml_source)

    xml_target = etree.Element(tag='target')
    xml_target.text = edge['target']
    xml_edge.append(xml_target)

    # <values>
    xml_values = etree.Element(tag='values')
    for key, value in edge['values']:
        # <value>
        xml_value = etree.Element(tag=key)
        xml_value.text = value
        xml_values.append(xml_value)

    xml_edge.append(xml_values)


def parse_vulnerability_to_xml(vulnerability):
    if vulnerability.type is 'vulnerability':
        # <vulnerability name id>
        xml_vulnerability = etree.Element(
            tag=vulnerability.type,
            attrib={
                'id': vulnerability.id,
                'name': vulnerability.name
            })
        pass
    else:  # vulnerability.type is in ['or', 'and']:
        xml_vulnerability = etree.Element(tag=vulnerability.type)
        for child in vulnerability.children:
            # Recurse
            xml_vulnerability.append(parse_vulnerability_to_xml(child))
    return xml_vulnerability


def json_to_xml(json_file):
    json_str = open(json_file, mode='r').readlines()
    harm = read_json(json_str)
    write_xml(harm)


def xml_to_json(xml_file):
    xml_str = open(xml_file, mode='r').readlines()
    harm = read_xml(xml_str)
    write_json(harm)


def main(argv):
    if len(argv) > 0:
        if argv[0] is "-i":
            # argv[2] is input file, optional argv[3] is output file
            run_xml_to_json(argv[1:])
        # elif len(argv) > 0:
        else:
            # argv[1] is input file, optional argv[2] is output file
            run_json_to_xml(argv)
    else:
        prompt_usage()


def prompt_usage():
    pass


def run_xml_to_json(argv):
    if len(argv) == 0:
        # prompt
        return
    elif len(argv) == 1:
        pass
    else:
        pass

    # validate files
    # prompt if overwriting
    # execute


def run_json_to_xml(argv):
    pass


if __name__ == "__main__":
    main(sys.argv[1:])
