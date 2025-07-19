# tests.py
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User, RoleModel, UserProfile
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from django.conf import settings
from django.core import mail
from datetime import datetime, timedelta

class AuthAPITests(APITestCase):
    def setUp(self):
        self.role = RoleModel.objects.create(name="Client")
        self.user = User.objects.create_user(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            password="TestPass123!",
            role=self.role,
            is_active=True,
            email_verified=True
        )
        self.profile = UserProfile.objects.create(user=self.user)

    def test_register(self):
        url = reverse('register')
        data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'NewPass123!',
            'role': self.role.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Verify Your Email")

    def test_login_success(self):
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials(self):
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'WrongPass123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_verify_email(self):
        token = jwt.encode({
            'user_id': self.user.id,
            'exp': datetime.now(datetime.timezone.utc) + timedelta(hours=24),
            'type': 'email_verification'
        }, settings.SECRET_KEY, algorithm='HS256')
        url = reverse('verify-email') + f'?token={token}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "Email already verified.")

    def test_logout(self):
        refresh = RefreshToken.for_user(self.user)
        url = reverse('logout')
        self.client.force_authenticate(user=self.user)
        data = {'refresh': str(refresh)}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_password_reset_request(self):
        url = reverse('password-reset')
        data = {'email': 'test@example.com'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, "Password Reset Request")

    def test_password_reset_confirm(self):
        token = jwt.encode({
            'user_id': self.user.id,
            'exp': datetime.now(datetime.timezone.utc) + timedelta(hours=1),
            'type': 'password_reset'
        }, settings.SECRET_KEY, algorithm='HS256')
        url = reverse('password-reset-confirm')
        data = {
            'token': token,
            'new_password': 'NewPass123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))