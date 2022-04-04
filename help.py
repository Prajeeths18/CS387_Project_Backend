import requests
import urllib.parse
import csv
import time
"""
def get_lat_long(address):
    url = 'https://nominatim.openstreetmap.org/search?q='+urllib.parse.quote(address)+'&format=json'
    print(url)
    response = requests.get(url).json()
    print(add, lat, lon)
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
coord.close()
restaurant.close()
"""
restaurant = open("random_sources/zomato.csv","r",encoding="latin-1")
next(restaurant)
restaurants_data = [tuple(line) for line in csv.reader(restaurant)]
restaurant.close()
restaurants_data = list(filter(lambda x: (x[3] == "New Delhi") and ((x[7] != "0") or (x[8] != "0")), restaurants_data))
restaurant = open("random_sources/coordinates.txt","w")
coords = set()
for row in restaurants_data:
    if (row[7],row[8]) not in coords:
        restaurant.write(f'"{row[4]}",{row[8]},{row[7]}\n')
        coords.add((row[7],row[8]))
restaurant.close()
restaurant = open("random_sources/restaurants_data.csv","w")
for row in restaurants_data:
    restaurant.write(f'"{row[1]}",{row[10]},{row[8]},{row[7]}\n')
restaurant.close()