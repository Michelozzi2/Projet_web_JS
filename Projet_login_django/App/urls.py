from django.urls import path
from django.contrib.auth import views as auth_views


from .views import login_view, home_view, signup_view, save_score, scoreboard

# Définition des URL pour l'application. 
# Chaque URL est liée à une vue spécifique qui gère la logique pour cette route.

urlpatterns = [
    path('login/', login_view, name='login'),
    path("", home_view, name="home"),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('signup/', signup_view, name='signup'),  # URL pour la page d'inscription
    path('save_score/', save_score, name='save_score'),  # URL pour la sauvegarde du score
    path('scoreboard/', scoreboard, name='scoreboard'),  # URL pour le tableau des scores
]
