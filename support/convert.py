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
    nodes = etree.Element('nodes')
    for node in harm['nodes']:
        # <node name id>
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

    xml_harm.append(nodes)
    # <edges>
    links = etree.Element('edges')
    for edge in harm['edges']:
        # <edge>
        continue
    xml_harm.append(links)
    #
    return xml_harm


def parse_vulnerability(vulnerability):
    # xml_vulnerability = etree.Element(tag=)
    # return xml_vulnerability
    pass


def json_to_xml(json_file):
    json_str = open(json_file, mode='r').readlines()
    harm = read_json(json_str)
    write_xml(harm)


def xml_to_json(xml_file):
    xml_str = open(xml_file, mode='r').readlines()
    harm = read_xml(xml_str)
    write_json(harm)


def main(argv):
    if argv[1] is "-i":
        # argv[2] is input file, optional argv[3] is output file

        pass
    elif len(argv) > 0:
        # argv[1] is input file, optional argv[2] is output file

        pass
    return


def prompt_usage():
    pass


def run_xml_to_json():
    pass


def run_json_to_xml():
    pass


if __name__ == "__main__":
    # main(sys.argv[1:])
    print(write_xml({}))
