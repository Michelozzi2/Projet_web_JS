from django.db import models

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    user_login = models.TextField(unique=True)
    user_password = models.TextField()
    user_mail = models.TextField(unique=True)
    user_date_new = models.DateTimeField(auto_now_add=True)
    user_date_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user_login
    
class Score(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='scores')
    score = models.IntegerField(default=0)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']  # Order by highest score first

    def __str__(self):
        return f"{self.user.username} - Score: {self.score} ({self.date.strftime('%d/%m/%Y %H:%M')})"
    
