"""
Django (DRF) tomoni: maktab xodimlari uchun CHEKLANGAN "panel" API.

Nima uchun kerak: xodimlarga to'liq Django admin (Users, Groups, Axes...) berilmaydi.
Next.js /admin paneli faqat shu endpointlar orqali ishlaydi va faqat quyidagi
resurslarga (yangilik, xodim, yutuq, banner, murojaat, maktab ma'lumoti) ruxsat oladi.

O'rnatish:
 1) settings.py:  INSTALLED_APPS ga 'rest_framework.authtoken' qo'shing, `python manage.py migrate`
 2) Django admin'da guruh yarating: "Maktab xodimi" va xodim userlarini shu guruhga qo'shing
    (is_staff = False bo'lsa ham bo'ladi — ular Django admin'ga kira olmaydi).
 3) Quyidagi MODEL/SERIALIZER importlarini o'z loyihangizdagi nomlarga moslang.
 4) urls.py:  path('api/v1/panel/', include('<app>.panel_api'))  — yoki urlpatterns'ni qo'shing.
"""
from django.contrib.auth import authenticate
from django.urls import path, include
from rest_framework import permissions, routers, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

# ====== O'Z LOYIHANGIZGA MOSLANG ======
from .models import News, Teacher, Achievement, Banner, ContactMessage, SchoolProfile  # noqa
from .serializers import (NewsSerializer, TeacherSerializer, AchievementSerializer,  # noqa
                          BannerSerializer, ContactMessageSerializer, SchoolProfileSerializer)
# ======================================

STAFF_GROUP = "Maktab xodimi"


class IsSchoolStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_superuser or u.groups.filter(name=STAFF_GROUP).exists()))


@api_view(["POST"])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def login(request):
    user = authenticate(username=request.data.get("username"), password=request.data.get("password"))
    if not user or not (user.is_superuser or user.groups.filter(name=STAFF_GROUP).exists()):
        return Response({"detail": "Login yoki parol noto'g'ri"}, status=401)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key})


class PanelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsSchoolStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


def make(model, serializer, ordering="-id"):
    return type(f"{model.__name__}PanelViewSet", (PanelViewSet,), {
        "queryset": model.objects.all().order_by(ordering), "serializer_class": serializer})


class MessageViewSet(make(ContactMessage, ContactMessageSerializer)):
    http_method_names = ["get", "delete", "head", "options"]   # murojaatni faqat o'qish / o'chirish


class SchoolView(APIView):
    """Bitta yozuv: GET va PATCH (o'chirish yo'q)."""
    permission_classes = [IsSchoolStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_obj(self):
        return SchoolProfile.objects.first()

    def get(self, request):
        return Response(SchoolProfileSerializer(self.get_obj(), context={"request": request}).data)

    def patch(self, request):
        s = SchoolProfileSerializer(self.get_obj(), data=request.data, partial=True, context={"request": request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)


router = routers.DefaultRouter()
router.register("news", make(News, NewsSerializer), basename="panel-news")
router.register("teachers", make(Teacher, TeacherSerializer), basename="panel-teachers")
router.register("achievements", make(Achievement, AchievementSerializer), basename="panel-achievements")
router.register("banners", make(Banner, BannerSerializer), basename="panel-banners")
router.register("messages", MessageViewSet, basename="panel-messages")

urlpatterns = [
    path("login/", login),
    path("school/", SchoolView.as_view()),
    path("", include(router.urls)),
]
