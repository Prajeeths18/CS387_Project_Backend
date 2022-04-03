import os
import subprocess
dirpath = os.path.abspath(os.path.dirname(__file__))

NUMBER_OF_RESTAURANTS=1000
NUMBER_OF_CUSTOMERS=6000
NUMBER_OF_DELIVERY=3000

NUMBER_OF_USERS=NUMBER_OF_CUSTOMERS+NUMBER_OF_DELIVERY+NUMBER_OF_RESTAURANTS # For entries into gen_user

if not os.path.exists(os.path.join(dirpath,f"random_sources/{NUMBER_OF_USERS}users.txt")):
    with open(os.path.join(dirpath,f"random_sources/{NUMBER_OF_USERS}users.txt"),"w") as userfile:
        subprocess.Popen(f"shuf -n {NUMBER_OF_USERS} {os.path.join(dirpath,'random_sources/usernames.txt')}", shell=True, stdout=userfile)
