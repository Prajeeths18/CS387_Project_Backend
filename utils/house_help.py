import csv

houses = open("../random_sources/houses.csv","r")
next(houses)
data = list(csv.reader(houses))
house_file = open("../random_sources/houses.txt","w")
coords = set()
for row in data:
    if (row[4],row[5]) not in coords:
        house_file.write(f"{row[4]},{row[5]},'{row[6]} {row[7]} {row[8]}'\n")
        coords.add((row[4],row[5]))
house_file.close()