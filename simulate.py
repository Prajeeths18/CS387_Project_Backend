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

NUMBER_OF_RESTAURANTS=1000
NUMBER_OF_CUSTOMERS=6000
NUMBER_OF_DELIVERY=3000

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
    return raw.replace("'",r"\'").replace('"',"\'")

usernames = []
with open(os.path.join(dirpath,f"random_sources/users.txt"),"r") as f:
    usernames = f.readlines()
usernames = [username.replace("\n","") for username in usernames]

users = [ f'("{escape(usernames[_])}","{passwords[_]}","{role_map[roles[_]]}")' for _ in range(NUMBER_OF_USERS)]

del roles

for page in _paginate(users,page_size=100):
    sql.write("INSERT INTO TABLE gen_user (username,password,role) VALUES "+",".join(page)+";\n")

users.clear()
del users

passwords.clear()
del passwords

mobiles = open(os.path.join(dirpath,"random_sources/mobile.txt"),"r")

"""
Insertion to customers
"""

customers = [f'({_+1},{mobiles.readline()[:-1]},"{escape(usernames[_])}@gmail.com")' for _ in customer_id_list]

for page in _paginate(customers,page_size=100):
    sql.write("INSERT INTO TABLE customer (customer_id,mobile_no,email) VALUES "+",".join(page)+";\n")

customers.clear()
del customers

doses = np.random.choice([0,1,2],size=np.size(delivery_id_list),p=[0.2,0.5,0.3])
delivery = [f'({delivery_id_list[_]+1},{mobiles.readline()[:-1]},"{escape(usernames[delivery_id_list[_]])}@gmail.com,{doses[_]}")' for _ in range(np.size(delivery_id_list))]

del doses

for page in _paginate(delivery,page_size=100):
    sql.write("INSERT INTO TABLE delivery (delivery_id,mobile_no,email,vaccination_status) VALUES "+",".join(page)+";\n")

delivery.clear()
del delivery

mobiles.close() # Restaurants data has its own that can be used

restaurant_file = open(os.path.join(dirpath,"random_sources/restaurants.txt"),"r")
restaurant_data = [tuple(line) for line in csv.reader(restaurant_file)]
restaurant_file.close()

addresses = [restaurant_row[0] for restaurant_row in restaurants_data]

restaurants = []

del customer_id_list
del delivery_id_list
del restaurant_id_list
sql.close()