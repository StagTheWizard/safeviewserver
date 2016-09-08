from django.conf.urls import url

from safeviewservice import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    url(r'^$', views.SafeviewView.as_view(), name='index'),
    url(r'^systems/$', views.SystemList.as_view()),
    url(r'^systems/(?P<system_id>[a-zA-Z0-9_]+)/$', views.SystemDetail.as_view()),
    url(r'^harms/(?P<system_id>[a-zA-Z0-9_]+)/(?P<harm_id>[a-zA-Z0-9_]+)/$', views.HarmDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
