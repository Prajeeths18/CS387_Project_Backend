import requests
import urllib.parse
import csv
import time

def get_lat_long(address):
    url = 'https://nominatim.openstreetmap.org/search/' + urllib.parse.quote(address) +'?format=json'
    response = requests.get(url).json()
    while len(response) == 0:
        print("try")
        time.sleep(1)
    return (response[0]['lat'],response[0]['lon'])

coord = open("coordinates.txt","w")
restaurant = open("random_sources/restaurants_data.csv","r")
next(restaurant)
restaurants_data = [tuple(line) for line in csv.reader(restaurant)]
restaurant.close()
restaurant = open("random_sources/new_restaurants_data.csv","w")
for i in range(len(restaurants_data)):
    add = restaurants_data[i][0]
    lat,lon = get_lat_long(add)
    coord.write(f"{lat},{lon},{add}\n")
    coord.flush()
    restaurant.write(f"{lat},{lon},{restaurants_data[i][1]},{restaurants_data[i][2]},{restaurants_data[i][3]}\n")
    restaurant.flush()