from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^systems/$', views.systems_list, name='systems'),
    url(r'^systems/(?P<system_id>[a-zA-Z0-9_]+)/$', views.systems, name='systems'),
    url(r'^harms/(?P<system_id>[a-zA-Z0-9_]+)/(?P<harm_id>[a-zA-Z0-9_]+)/$', views.harms, name='harms'),
    # url(r'^hosts/?P<system_id>[a-zA-Z0-9_]+/?P<harm_id>[a-zA-Z0-9_]+/?P<host_id>[a-zA-Z0-9_]+/$', views.hosts, name='hosts'),
    # url(r'^vulnerabilities/?P<system_id>[a-zA-Z0-9_]+/?P<harm_id>[a-zA-Z0-9_]+/?P<host_id>[a-zA-Z0-9_]+/$', views.vulnerabilities, name='vulnerabilities'),
]
00