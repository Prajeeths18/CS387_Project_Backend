import os
import subprocess
import numpy as np
import csv

"""
Utility from psycopg2 for paginate
"""
def _paginate(seq, page_size):
    """Consume an iterable and return it in chunks.
    Every chunk is at most `page_size`. Never return an empty chunk.
    """
    page = []
    it = iter(seq)
    while True:
        try:
            for i in range(page_size):
                page.append(next(it))
            yield page
            page = []
        except StopIteration:
            if page:
                yield page
            return

dirpath = os.path.abspath(os.path.dirname(__file__))
sql = open(os.path.join(dirpath,"InsertData.sql"),"w")

NUMBER_OF_RESTAURANTS=100
NUMBER_OF_CUSTOMERS=6000
NUMBER_OF_DELIVERY=500
NUMBER_OF_CUSTOMER_ADDRESSES=[0.6,0.3,0.1]
NUMBER_OF_FAVOURITES=5

NUMBER_OF_USERS=NUMBER_OF_CUSTOMERS+NUMBER_OF_DELIVERY+NUMBER_OF_RESTAURANTS # For entries into gen_user

SEED = 42
with open(os.path.join(dirpath,f"random_sources/users.txt"),"w") as userfile:
    subprocess.Popen(f"shuf -n {NUMBER_OF_USERS} --random-source=<(yes {SEED}) {os.path.join(dirpath,'random_sources/usernames.txt')}", shell=True, stdout=userfile, executable="/bin/bash")

with open(os.path.join(dirpath,f"random_sources/mobile.txt"),"w") as mobilefile:
    subprocess.Popen(f"shuf -n {NUMBER_OF_USERS} --random-source=<(yes {SEED}) {os.path.join(dirpath,'random_sources/phone_numbers.txt')}", shell=True, stdout=mobilefile, executable="/bin/bash")

with open(os.path.join(dirpath,f"random_sources/restaurants.txt"),"w") as restaurant_file:
    subprocess.Popen(f"shuf -n {NUMBER_OF_USERS} --random-source=<(yes {SEED}) {os.path.join(dirpath,'random_sources/restaurants_data.csv')}", shell=True, stdout=restaurant_file, executable="/bin/bash")

"""
Parameters
"""
customer_probability = NUMBER_OF_CUSTOMERS/NUMBER_OF_USERS
restaurant_probability = NUMBER_OF_RESTAURANTS/NUMBER_OF_USERS
delivery_probability = NUMBER_OF_DELIVERY/NUMBER_OF_USERS
PASSWORD_LENGTH = 6 

"""
Random Sampling
"""
np.random.seed(SEED)
roles = np.random.choice([0,1,2], size=NUMBER_OF_USERS, replace=True, p=[customer_probability,restaurant_probability,delivery_probability])

alphabet = list('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
np_alphabet = np.array(alphabet, dtype="|U1")
alphabet.clear()
del alphabet
np_pass = np.random.choice(np_alphabet, [NUMBER_OF_USERS, PASSWORD_LENGTH])
del np_alphabet
passwords = ["".join(i) for i in np_pass]
del np_pass

"""
Insertion to gen_users
"""
customer_id_list = np.nonzero(roles == 0)[0]
restaurant_id_list = np.nonzero(roles == 1)[0]
delivery_id_list = np.nonzero(roles == 2)[0]

role_map = {0: "CUSTOMER", 1: "RESTAURANT", 2:"DELIVERY"}

def escape(raw):
    return raw.replace("'",'').replace('"','')

usernames = []
with open(os.path.join(dirpath,f"random_sources/users.txt"),"r") as f:
    usernames = f.readlines()
usernames = [username.replace("\n","") for username in usernames]

users = [ f"('{escape(usernames[_])}','{passwords[_]}','{role_map[roles[_]]}')" for _ in range(NUMBER_OF_USERS)]

del roles

for page in _paginate(users,page_size=100):
    sql.write("INSERT INTO gen_user (username,password,role) VALUES "+",".join(page)+";\n")

users.clear()
del users

passwords.clear()
del passwords

mobiles = open(os.path.join(dirpath,"random_sources/mobile.txt"),"r")

"""
Insertion to customers
"""

customers = [f"({_+1},{mobiles.readline()[:-1]},'{escape(usernames[_])}@gmail.com')" for _ in customer_id_list]

for page in _paginate(customers,page_size=100):
    sql.write("INSERT INTO customer (customer_id,mobile_no,email) VALUES "+",".join(page)+";\n")

customers.clear()
del customers

doses = np.random.choice([0,1,2],size=np.size(delivery_id_list),p=[0.2,0.5,0.3])
delivery = [f"({delivery_id_list[_]+1},{mobiles.readline()[:-1]},'{escape(usernames[delivery_id_list[_]])}@gmail.com','{doses[_]}')" for _ in range(np.size(delivery_id_list))]

del doses

for page in _paginate(delivery,page_size=100):
    sql.write("INSERT INTO delivery (delivery_id,mobile_no,email,vaccination_status) VALUES "+",".join(page)+";\n")

delivery.clear()
del delivery

coord_file = open("random_sources/coordinates.txt","r")
coords = csv.reader(coord_file)
geocodes = [f"('{escape(coord[0])}',{coord[1]},{coord[2]})" for coord in coords]
coord_file.close()

for page in _paginate(geocodes,page_size=100):
    sql.write("INSERT INTO coordinates (gen_address,latitude,longitude) VALUES "+",".join(page)+";\n")

del coords
geocodes.clear()
del geocodes

coord_file = open("random_sources/houses.txt","r") # Some lat-long values of apartments for customers - imprecise addresses
coords = csv.reader(coord_file)
geocodes = [f"('{escape(coord[2])}',{coord[0]},{coord[1]})" for coord in coords]
coord_file.close()

for page in _paginate(geocodes,page_size=100):
    sql.write("INSERT INTO coordinates (gen_address,latitude,longitude) VALUES "+",".join(page)+";\n")

del coords
geocodes.clear()
del geocodes

restaurant_file = open(os.path.join(dirpath,"random_sources/restaurants.txt"),"r")
lines = list(csv.reader(restaurant_file))
restaurant_file.close()

restaurant_data = [f"('{escape(lines[_][0])}',{lines[_][1]},{lines[_][2]},{lines[_][3]},0,false,'10:00+5:30','21:00+5:30',{restaurant_id_list[_]+1},{mobiles.readline()[:-1]},'{escape(usernames[restaurant_id_list[_]])}@gmail.com')" for _ in range(np.size(restaurant_id_list))]

for page in _paginate(restaurant_data,page_size=100):
    sql.write("INSERT INTO restaurant (restaurant_name,avg_cost_for_two,latitude,longitude,overall_discount,max_safety_follow,open_time,close_time,restaurant_id,mobile_no,email) VALUES "+",".join(page)+";\n")

lines.clear()
del lines
restaurant_data.clear()
del restaurant_data

mobiles.close() # All usage of mobile numbers complete

coord_file = open("random_sources/houses.txt","r")
number_of_addresses = np.random.choice(range(1,len(NUMBER_OF_CUSTOMER_ADDRESSES)+1),size=np.size(customer_id_list),p=NUMBER_OF_CUSTOMER_ADDRESSES)

address_data = [",".join([f"({customer_id_list[i]+1},"+",".join(coord_file.readline()[:-1].split(",")[:2])+")" for j in range(number_of_addresses[i])]) for i in range(np.size(customer_id_list))]
del number_of_addresses
coord_file.close()

AVG_NUM_ADDRESS = sum([x*y for x,y in zip(range(1,len(NUMBER_OF_CUSTOMER_ADDRESSES)+1),NUMBER_OF_CUSTOMER_ADDRESSES)])

assert (NUMBER_OF_CUSTOMERS*AVG_NUM_ADDRESS<=9700),"Insufficient house records to simulate"

for page in _paginate(address_data,page_size=int(100/AVG_NUM_ADDRESS)):
    sql.write("INSERT INTO customer_address (customer_id,latitude,longitude) VALUES "+",".join(page)+";\n")

address_data.clear()
del address_data
"""
no_of_favourites = np.size(customer_id_list)*NUMBER_OF_FAVOURITES
restaurant_favourites = np.random.choice(restaurant_id_list,size=no_of_favourites)
favourite_data = [",".join([f"({customer_id_list[i]+1},{j+1})" for j in restaurant_favourites[NUMBER_OF_FAVOURITES*i:NUMBER_OF_FAVOURITES*(i+1)]]) for i in range(np.size(customer_id_list))]

for page in _paginate(favourite_data,page_size=100):
    sql.write("INSERT INTO favorites (customer_id,restaurant_id) VALUES "+",".join(page)+";\n")
"""
del customer_id_list
del delivery_id_list
del restaurant_id_list
sql.close()