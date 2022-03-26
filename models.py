# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Coordinates(models.Model):
    gen_address = models.TextField(blank=True, null=True)
    latitude = models.FloatField(primary_key=True)
    longitude = models.FloatField()

    class Meta:
        managed = False
        db_table = 'coordinates'
        unique_together = (('latitude', 'longitude'),)


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


class Favorites(models.Model):
    customer = models.OneToOneField(Customer, models.DO_NOTHING, primary_key=True)
    restaurant = models.ForeignKey('Restaurant', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'favorites'
        unique_together = (('customer', 'restaurant'),)


class FoodItems(models.Model):
    restaurant = models.OneToOneField('Restaurant', models.DO_NOTHING, primary_key=True)
    food_name = models.ForeignKey('FoodType', models.DO_NOTHING, db_column='food_name')
    available = models.BooleanField(blank=True, null=True)
    preparation_time = models.SmallIntegerField(blank=True, null=True)
    specific_discount = models.FloatField(blank=True, null=True)
    cost = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'food_items'
        unique_together = (('restaurant', 'food_name'),)


class FoodOrder(models.Model):
    order_id = models.IntegerField(primary_key=True)
    customer = models.ForeignKey(Customer, models.DO_NOTHING)
    order_place_time = models.DateTimeField(blank=True, null=True)
    expected_delivery_time = models.DateTimeField(blank=True, null=True)
    actual_delivery_time = models.DateTimeField(blank=True, null=True)
    restaurant_review = models.TextField(blank=True, null=True)
    restaurant_rating = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'food_order'
        unique_together = (('order_id', 'customer'),)


class FoodType(models.Model):
    food_name = models.CharField(primary_key=True, max_length=256)
    food_type = models.TextField(blank=True, null=True)  # This field type is a guess.
    course_type = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'food_type'


class GenUser(models.Model):
    user_id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=30, blank=True, null=True)
    password = models.CharField(max_length=128, blank=True, null=True)
    role = models.TextField(blank=True, null=True)  # This field type is a guess.
    valid = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'gen_user'


class OrderHas(models.Model):
    order = models.OneToOneField(FoodOrder, models.DO_NOTHING, primary_key=True)
    customer_id = models.BigAutoField()
    food_name = models.CharField(max_length=256)
    quantity = models.IntegerField(blank=True, null=True)
    food_review = models.TextField(blank=True, null=True)
    food_rating = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'order_has'
        unique_together = (('order', 'customer_id', 'food_name'),)


class OrderRestaurant(models.Model):
    order = models.OneToOneField(FoodOrder, models.DO_NOTHING, primary_key=True)
    customer_id = models.BigAutoField()
    restaurant = models.ForeignKey('Restaurant', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'order_restaurant'
        unique_together = (('order', 'customer_id', 'restaurant'),)


class OrderTaken(models.Model):
    order = models.OneToOneField(FoodOrder, models.DO_NOTHING, primary_key=True)
    customer_id = models.BigAutoField()
    delivery = models.ForeignKey(Delivery, models.DO_NOTHING)
    delivery_review = models.TextField(blank=True, null=True)
    delivery_rating = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'order_taken'
        unique_together = (('order', 'customer_id', 'delivery'),)


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
