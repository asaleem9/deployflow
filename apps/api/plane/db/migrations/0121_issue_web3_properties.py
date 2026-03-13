from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0120_issueview_archived_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='issue',
            name='web3_properties',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
