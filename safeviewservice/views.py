from django.template import loader
from django.shortcuts import render
from django.http import HttpResponse
from django.http import HttpResponseServerError
import json
from . import models
from . import data


# Create your views here.
def index(request):
    return render(request, "safeview/index.html")


def systems_list(request):
    """
    GET /systems/
    :param request:     The HTTP request object.
    """
    if request.method == 'GET':
        system_ids = data.get_systems()
        return HttpResponse(json.dumps(system_ids))
    # Only HTTP GET is currently supported for systems.
    elif request.method == 'POST':
        return HttpResponse("Not Implemented", status=501)
    elif request.method == 'PUT':
        return HttpResponse("Not Implemented", status=501)
    elif request.method == 'DELETE':
        return HttpResponse("Not Implemented", status=501)


def systems(request, system_id):
    """
    GET /systems/<system_id>/
    :param system_id:   A string of the system id, extracted from the url.
    :param request:     The HTTP request object.
    """
    if request.method == 'GET':
        system = data.get_system(system_id)
        return HttpResponse(json.dumps(system))
    # Only HTTP GET is currently supported for systems.
    elif request.method == 'POST':
        return HttpResponse("Not Implemented", status=501)
    elif request.method == 'PUT':
        return HttpResponse("Not Implemented", status=501)
    elif request.method == 'DELETE':
        return HttpResponse("Not Implemented", status=501)


def harms(request, system_id, harm_id):
    """
    GET /harms/<system_id>/<harm_id>/
    :param request:
    :param system_id:
    :param harm_id:
    :return:
    """
    if request.method == 'GET':
        harm = data.get_harm(system_id, harm_id)
        return HttpResponse(json.dumps(harm))
    # Only HTTP GET is currently supported for systems.
    elif request.method == 'POST':
        return HttpResponse("Not Implemented", status=501)
    elif request.method == 'PUT':
        return HttpResponse("Not Implemented", status=501)
    elif request.method == 'DELETE':
        return HttpResponse("Not Implemented", status=501)


def hosts(request, system_id, harm_id, host_id):
    """
    GET /hosts/<system_id>/<harm_id>/<host_id>/
    :param request:
    :param system_id:
    :param harm_id:
    :param host_id:
    :return:
    """
    raise HttpResponse("Not Implemented", status=501)


def vulnerabilities(request, system_id, harm_id, host_id):
    """
    GET /hosts/vulnerabilities/<system_id>/<harm_id>/<host_id>/
    :param request:
    :param system_id:
    :param harm_id:
    :param host_id:
    :return:
    """
    raise HttpResponse("Not Implemented", status=501)