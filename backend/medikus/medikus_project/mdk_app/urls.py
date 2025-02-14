from django.urls import path
from django.conf.urls.static import static

from medikus_project import settings
from . import views

urlpatterns = [
    path('', views.index, name="index"),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)