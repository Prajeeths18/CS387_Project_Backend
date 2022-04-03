from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.validators import UnicodeUsernameValidator

class GenUserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, username, email, password, **extra_fields):
        """
        Create and save a user with the given username, email, and password.
        """
        if not username:
            raise ValueError("The given username must be set")
        email = self.normalize_email(email)
        # Lookup the real model class from the global app registry so this
        # manager method can be used in migrations. This is fine because
        # managers are by definition working on the real model.
        GlobalUserModel = apps.get_model(
            self.model._meta.app_label, self.model._meta.object_name
        )
        username = GlobalUserModel.normalize_username(username)
        user = self.model(username=username, email=email, **extra_fields)
        user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(username, email, password, **extra_fields)

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(username, email, password, **extra_fields)

    def with_perm(
        self, perm, is_active=True, include_superusers=True, backend=None, obj=None
    ):
        if backend is None:
            backends = auth._get_backends(return_tuples=True)
            if len(backends) == 1:
                backend, _ = backends[0]
            else:
                raise ValueError(
                    "You have multiple authentication backends configured and "
                    "therefore must provide the `backend` argument."
                )
        elif not isinstance(backend, str):
            raise TypeError(
                "backend must be a dotted import path string (got %r)." % backend
            )
        else:
            backend = auth.load_backend(backend)
        if hasattr(backend, "with_perm"):
            return backend.with_perm(
                perm,
                include_superusers=include_superusers,
                obj=obj,
            )
        return self.none()


# Create your models here.
class GenUser(AbstractBaseUser, PermissionsMixin):
    username_validator = UnicodeUsernameValidator()

    user_id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=30, blank=True, null=True)
    role = models.TextField(blank=True, null=True)  # This field type is a guess.
    valid = models.BooleanField(blank=True, null=True)

    objects = GenUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    class Meta:
        managed = False
        db_table = 'gen_user'

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

class Customer(models.Model):
    customer = models.OneToOneField('GenUser', models.DO_NOTHING, primary_key=True)
    mobile_no = models.IntegerField(blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    subscription = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'customer'


class Delivery(models.Model):
    delivery = models.OneToOneField('GenUser', models.DO_NOTHING, primary_key=True)
    mobile_no = models.IntegerField(blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    available = models.BooleanField(blank=True, null=True)
    vaccination_status = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'delivery'

class Coordinates(models.Model):
    gen_address = models.TextField(blank=True, null=True)
    latitude = models.FloatField(primary_key=True)
    longitude = models.FloatField()

    class Meta:
        managed = False
        db_table = 'coordinates'
        unique_together = (('latitude', 'longitude'),)

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

