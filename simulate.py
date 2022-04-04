import os
import subprocess
import numpy as np
import csv
import random
import datetime as dt
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

restaurant_file = open(os.path.join(dirpath,"random_sources/restaurants.txt"),"r")
lines = list(csv.reader(restaurant_file))
restaurant_file.close()

restaurant_data = [f"('{escape(lines[_][0])}',{lines[_][1]},{lines[_][2]},{lines[_][3]},0,false,'10:00+5:30','21:00+5:30',{restaurant_id_list[_]},{mobiles.readline()[:-1]},'{escape(usernames[restaurant_id_list[_]])}@gmail.com')" for _ in range(np.size(restaurant_id_list))]

for page in _paginate(restaurant_data,page_size=100):
    sql.write("INSERT INTO restaurant (restaurant_name,avg_cost_for_two,latitude,longitude,overall_discount,max_safety_follow,open_time,close_time,restaurant_id,mobile_no,email) VALUES "+",".join(page)+";\n")

lines.clear()
del lines
restaurant_data.clear()
del restaurant_data

mobiles.close() # All usage of mobile numbers complete

ORDER_CUSTOMER_MAX = 20
ORDER_CUSTOMER_MIN = 2
REST_START = 10
REST_END = 21
ORDER_YR = 2022
MIN_OFFSET = 20*60
MAX_OFFSET = 70*60
NEG_DISTORT = -10*60
POS_DISTORT = 20*60
customer_data = [] 

def split_time(off_set):
    #print("secs:",off_set)
    hr_,min_ = int(off_set/3600),off_set%3600
    min_,sec_= int(min_/60),min_%60
    return (hr_,min_,sec_)

def add_time(hr,minu,sec,max_offset,min_offset): 
    hr_,min_,sec_ = split_time(random.randint(min_offset,max_offset))
    t1 = dt.datetime.strptime(f'{hr}:{minu}:{sec}', '%H:%M:%S')
    t2 = dt.datetime.strptime(f'{hr_}:{min_}:{sec_}', '%H:%M:%S')
    time_zero = dt.datetime.strptime('00:00:00', '%H:%M:%S')
    z = (t1 - time_zero + t2).time()
    #print(z,type(z),z.hour)
    return (z.hour,z.minute,z.second)

for i in range(np.size(customer_id_list)):
    cust_id = customer_id_list[i]
    no_of_order = random.randint(ORDER_CUSTOMER_MIN,ORDER_CUSTOMER_MAX+1)
    for j in range(no_of_order):

        m,hr,minute,sec = random.randint(1,13),random.randint(REST_START,REST_END),random.randint(0,60),random.randint(0,60)
        day = random.randint(1,29)
        if m in [1,3,5,7,8,10,12]:
            day = random.randint(1,32)
        elif m in [4,6,9,11]:
            day = random.randint(1,31)

        place_time = f'{ORDER_YR}-{m}-{day} {hr}:{minute}:{sec} +5:30'
        #print("place time is:",place_time)
        added_time = add_time(hr,minute,sec,MAX_OFFSET,MIN_OFFSET)

        exp_time = f'{ORDER_YR}-{m}-{day} {added_time[0]}:{added_time[1]}:{added_time[2]} +5:30'

        secs = added_time[0]*3600+added_time[1]*60+added_time[2]
        temp = split_time(secs+random.randint(NEG_DISTORT,POS_DISTORT))

        actual_time = f'{ORDER_YR}-{m}-{day} {temp[0]}:{temp[1]}:{temp[2]} +5:30'

        




del customer_id_list
del delivery_id_list
del restaurant_id_list
sql.close()