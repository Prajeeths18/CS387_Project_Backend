import pandas as pd 
import numpy as np
import geopy.distance
from scipy.spatial import distance
from math import cos,sqrt
house_data = pd.read_csv('../random_sources/houses.txt',header = None)
rest_data = pd.read_csv('../random_sources/restaurants.txt',header=None)

def calc_dist(house,rest):
    R = 6371  # radius of the earth in km
    x = (house[1] - rest[1]) * cos( 0.5*(house[0]+rest[0])*0.00872664626 )
    y = house[0] - rest[0]
    d = 111.319 * sqrt( x*x + y*y )
    return d

max_dist = 0

house = house_data.iloc[:,0:2].to_numpy()
rest = rest_data.iloc[:,2:].to_numpy()
pdiff = house[np.newaxis,:,:]-rest[:,np.newaxis,:]
psum = house[np.newaxis,:,:]+rest[:,np.newaxis,:]
psum = psum[:,:,0]
px = pdiff[:,:,1]*np.cos(0.5*psum*0.00872664626)
py = pdiff[:,:,0]
pd = 111.319*np.sqrt(np.square(px)+np.square(py))
print(np.max(pd))
print(np.min(pd))

# for rest in rest_data.iloc[:,2:].to_numpy():
#     for house in house_data.iloc[:,0:2].to_numpy():
#         max_dist = max(max_dist,calc_dist(rest,house))

# print(max_dist)
