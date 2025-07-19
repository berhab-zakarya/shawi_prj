from django.contrib import admin
from .models import Contract, Signature,Review

admin.site.register(Review)
admin.site.register(Contract)
admin.site.register(Signature)