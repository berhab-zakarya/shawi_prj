# Generated by Django 4.2.23 on 2025-07-02 14:08

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contracts', '0002_contract_party_a_signed_at_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='contract',
            options={},
        ),
        migrations.RemoveField(
            model_name='contract',
            name='content',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='file_export',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='lawyer_review_comments',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='lawyer_reviewer',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='party_a',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='party_a_signature',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='party_a_signed_at',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='party_b',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='party_b_signature',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='party_b_signed_at',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='status',
        ),
        migrations.RemoveField(
            model_name='contract',
            name='title',
        ),
        migrations.AddField(
            model_name='contract',
            name='client',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='contract',
            name='contract_type',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='contract',
            name='data',
            field=models.JSONField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='contract',
            name='full_text',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='contract',
            name='is_locked',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='contract',
            name='needs_review',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='Signature',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.GenericIPAddressField()),
                ('signed_at', models.DateTimeField(auto_now_add=True)),
                ('contract', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='signatures', to='contracts.contract')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='signatures', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='PENDING', max_length=20)),
                ('review_notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('contract', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='contracts.contract')),
                ('lawyer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
