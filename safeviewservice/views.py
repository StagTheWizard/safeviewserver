from django.template import loader
from django.shortcuts import render
# from django.views.generic import View
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework_xml.renderers import XMLRenderer
from rest_framework_xml.parsers import XMLParser
import xml.etree.ElementTree as etree
from safeviewservice import data


class SafeviewView(APIView):
    """
    A view that returns the harm data in XML format.
    """
    renderer_classes = (XMLRenderer, )
    parser_classes = (XMLParser, )

    def get(self, request):
        return render(request, "safeview/index.html")
        # return HttpResponse("Not Implemented", status=501)


class SystemList(APIView):
    """
    A view that returns the harm data in XML format.
    """
    renderer_classes = (XMLRenderer, )
    parser_classes = (XMLParser, )

    def get(self, request):
        et_systems = data.get_systems()
        systems_str = etree.tostring(et_systems, encoding='utf8', method='xml')
        return HttpResponse(systems_str, content_type="xml")
        # return HttpResponse("Not Implemented", status=501)


class SystemDetail(APIView):
    """
    A view that returns the harm data in XML format.
    """
    renderer_classes = (XMLRenderer,)
    parser_classes = (XMLParser, )

    def get(self, request, system_id):
        et_system = data.get_system(system_id)
        system_str = etree.tostring(et_system, encoding='utf8', method='xml')
        return HttpResponse(system_str, content_type="xml")
        # return HttpResponse("Not Implemented", status=501)


class HarmDetail(APIView):
    """
    A view that returns the harm data in XML format.
    """
    renderer_classes = (XMLRenderer, )
    parser_classes = (XMLParser, )

    def get(self, request, system_id, harm_id):
        et_harm = data.get_harm(system_id, harm_id)
        harm_str = etree.tostring(et_harm, encoding='utf8', method='xml')
        return HttpResponse(harm_str, content_type="xml")
        # return HttpResponse("Not Implemented", status=501)
