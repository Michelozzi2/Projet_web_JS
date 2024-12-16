import json
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib import messages
from .forms import SignUpForm
from .models import User, Score
from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt





# Vue pour la page de connexion
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        try:
            # Récupère l'utilisateur par son name d'utilisateur
            user = User.objects.get(user_login=username)
            
            # Utilise check_password pour comparer le mot de passe entré avec le mot de passe haché
            if check_password(password, user.user_password):
                # Si correct, stocke l'ID utilisateur et le login dans la session
                request.session['user_id'] = user.user_id
                request.session['user_login'] = user.user_login
                return redirect('home')
            else:
                # Mot de passe incorrect
                messages.error(request, 'Mot de passe incorrect')
        except User.DoesNotExist:
            # Utilisateur non trouvé
            messages.error(request, 'Utilisateur non trouvé')

    # Affiche la page de connexion pour GET ou en cas d'erreur
    return render(request, 'App/login.html')


# Vue pour la page d'accueil (après connexion)
def home_view(request):  

    # Récupère le login de l'utilisateur à partir de la session
    user_login = request.session.get('user_login')

    # Si l'utilisateur est connecté, affiche la page d'accueil avec son login
    if user_login:
        return render(request, 'App/home.html', {'user_login': user_login})
    else:
        # Si l'utilisateur n'est pas connecté, redirige vers la page de connexion
        return redirect('login')

def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.user_password = make_password(form.cleaned_data['user_password'])  # Chiffre le mot de passe
            user.save()
            messages.success(request, "Votre inscription a été réalisée avec succès !")
            return redirect('login')
    else:
        form = SignUpForm()
    
    return render(request, 'App/signup.html', {'form': form})


@csrf_exempt
def save_score(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            score_value = data.get('score')
            user_login = request.session.get('user_login')
            
            if user_login:
                user = User.objects.get(user_login=user_login)
                Score.objects.create(user=user, score=score_value)
                return JsonResponse({'status': 'success'})
            return JsonResponse({'status': 'error', 'message': 'User not found'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})


def scoreboard(request):
    scores = Score.objects.all().select_related('user')[:10]  # Top 10 scores
    return render(request, 'App/display_score.html', {'scores': scores})