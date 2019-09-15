import os
import numpy as np
from pysheds.grid import Grid
import fiona
import geopandas as gpd
import pyproj
import math
from pyproj import Proj, transform
from geojson import Polygon
from area import area



def catch(x, y,data_url,out_url):

    # os.chdir(r'D:\Data\SRTM_TR')
    # os.chdir(r'D:\ASTER')

    grid = Grid.from_raster(data_url, data_name='dem')
    distance = 1
    window = (x - distance * 0.5, y - distance * 0.5, x + distance * 0.5, y + distance * 0.5)
    grid.set_bbox(window)
    grid.read_raster(data_url, data_name='dem', window=grid.bbox,
                     window_crs=grid.crs)

    dirmap = (64, 128, 1, 2, 4, 8, 16, 32)
    grid.fill_pits(data='dem', out_name='pit')
    grid.fill_depressions(data='pit', out_name='dep')
    grid.resolve_flats(data='dep', out_name='flat')

    grid.flowdir(data='flat', out_name='dir', dirmap=dirmap)
    grid.accumulation(data='dir', out_name='acc')
    # grid.to_raster('dir', "dir.tif", blockxsize=16, blockysize=16)
    # grid.to_raster('flat', "dem.tif", blockxsize=16, blockysize=16)
    # grid.to_raster('acc', "acc.tif", blockxsize=16, blockysize=16)
    # xy = np.column_stack([x, y])
    # new = grid.snap_to_mask(grid.acc > 500, xy, return_dist=False)
    # x = new[:, 0]
    # y = new[:, 1]
    ynew, xnew = np.unravel_index(np.argsort(grid.acc.ravel())[-2], grid.acc.shape)

    # grid.catchment(x=x, y=y, data='dir', dirmap=dirmap, out_name='catch', recursionlimit=15000, xytype='label')
    grid.catchment(x=xnew, y=ynew, data='dir', dirmap=dirmap, out_name='catch', recursionlimit=15000, xytype='index')

    nodat = grid.catch.nodata

    grid.clip_to('catch')
    shapes = grid.polygonize()

    schema = {
        'geometry': 'Polygon',
        'properties': {'LABEL': 'float:16'}
    }

    i = 0
    in_projection = Proj(init='epsg:4326')
    out_projection = Proj(init='epsg:4326')
    last_value = 0
    coords = [[]]
    # print('Tranformation Started !')
    # transformation_time = datetime.datetime.now()
    for shape, value in shapes:
        if last_value < len(shape['coordinates'][0]):
            coords[0] = []
            for index, val in enumerate(shape['coordinates'][0]):
                coords[0].append([transform(in_projection, out_projection, val[0], val[1])[0],
                                  transform(in_projection, out_projection, val[0], val[1])[1]])
            last_value = len(shape['coordinates'][0])
        else:
            pass
    # print('Transformation Finished : ', datetime.datetime.now()-transformation_time)

    # print(Polygon(coords))
    poly = Polygon(coords)

    with fiona.open(out_url, 'w',
                    driver='ESRI Shapefile',
                    crs=grid.crs.srs,
                    schema=schema) as c:
        i = 0
        for shape, value in shapes:
            rec = {}
            rec['geometry'] = shape
            rec['properties'] = {'LABEL': str(value)}
            rec['id'] = str(i)
            c.write(rec)
            i += 1

    grid.catch.nodata = -9223372036854775808
    grid.clip_to('catch')
    grid.accumulation(data='catch', dirmap=dirmap, pad_inplace=False, out_name='acc')
    grid.catch.nodata = -9223372036854775808
    branches = grid.extract_river_network('catch', 'acc', threshold=1500, dirmap=dirmap)

    # def saveDict(dic, file):
    #     f = open(file, 'w')
    #     f.write(str(dic))
    #     f.close()
    #
    # saveDict(branches, 'branches.geojson')

    # streamNet = gpd.read_file('branches.geojson')
    # streamNet.crs = {'init': 'epsg:23036'}

    # schema = {
    #     'geometry': 'LineString',
    #     'properties': {}
    # }
    #
    # with fiona.open('rivers.shp', 'w',
    #                 driver='ESRI Shapefile',
    #                 crs=grid.crs.srs,
    #                 schema=schema) as c:
    #     i = 0
    #     for branch in branches['features']:
    #         rec = {}
    #         rec['geometry'] = branch['geometry']
    #         rec['properties'] = {}
    #         rec['id'] = str(i)
    #         c.write(rec)
    #         i += 1


    def convert_wgs_to_utm(lon, lat):
        utm_band = str((math.floor((lon + 180) / 6) % 60) + 1)
        if len(utm_band) == 1:
            utm_band = '0' + utm_band
        if lat >= 0:
            epsg_code = '326' + utm_band
        else:
            epsg_code = '327' + utm_band
        return epsg_code


    input_lon, input_lat = x, y
    utm_code = convert_wgs_to_utm(input_lon, input_lat)
    crs_wgs = pyproj.Proj(init='epsg:4326')  # assuming you're using WGS84 geographic
    crs_utm = pyproj.Proj(init='epsg:{0}'.format(utm_code))

    # a = gpd.read_file(out_url)

    # data_proj = a.copy()
    # data_proj['geometry'] = data_proj['geometry'].to_crs(epsg=utm_code)

    # Area = data_proj.area[0] / 1e6
    Area = area(poly) / 1e6

    return Area,utm_code,branches,poly
