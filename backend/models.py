from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.validators import UnicodeUsernameValidator


# Create your models here.
class GenUser(AbstractBaseUser, PermissionsMixin):
    username_validator = UnicodeUsernameValidator()

    user_id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=30, blank=True, null=True)
    role = models.TextField(blank=True, null=True)  # This field type is a guess.
    valid = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'gen_user'

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)

class Customer(models.Model):
    customer = models.OneToOneField('GenUser', models.DO_NOTHING, primary_key=True)
    mobile_no = models.IntegerField(blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    subscription = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'customer'

class CustomerAddress(models.Model):
    customer = models.OneToOneField(Customer, models.DO_NOTHING, primary_key=True)
    latitude = models.ForeignKey(Coordinates, models.DO_NOTHING, db_column='latitude')
    longitude = models.FloatField()

    class Meta:
        managed = False
        db_table = 'customer_address'
        unique_together = (('customer', 'latitude', 'longitude'),)


class Delivery(models.Model):
    delivery = models.OneToOneField('GenUser', models.DO_NOTHING, primary_key=True)
    mobile_no = models.IntegerField(blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    available = models.BooleanField(blank=True, null=True)
    vaccination_status = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'delivery'

class Restaurant(models.Model):
    restaurant = models.OneToOneField(GenUser, models.DO_NOTHING, primary_key=True)
    restaurant_name = models.CharField(max_length=256, blank=True, null=True)
    mobile_no = models.IntegerField(blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    overall_discount = models.FloatField(blank=True, null=True)
    max_safety_follow = models.BooleanField(blank=True, null=True)
    open_time = models.TimeField(blank=True, null=True)
    close_time = models.TimeField(blank=True, null=True)
    avg_cost_for_two = models.IntegerField(blank=True, null=True)
    latitude = models.ForeignKey(Coordinates, models.DO_NOTHING, db_column='latitude', blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'restaurant'