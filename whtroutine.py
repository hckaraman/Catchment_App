import geopandas as gpd
import rasterio
from rasterio.features import shapes
import json
from shapely.geometry import shape
from shapely.geometry import Polygon,Point
import os
import whitebox
wbt = whitebox.WhiteboxTools()

# wbt.work_dir = data_dir
# wbt.hypsometric_analysis("DEM_UTM42.tif","hypso.html")

def toshape(out_url,y1, x1, y2, x2):
    lat_point_list = [x1,x2,x2,x1,x1]
    lon_point_list = [y1,y1,y2,y2,y1]

    polygon_geom = Polygon(zip(lon_point_list, lat_point_list))
    crs = {'init': 'epsg:4326'}
    polygon = gpd.GeoDataFrame(index=[0], crs=crs, geometry=[polygon_geom])
    polygon.to_file(filename=os.path.join(out_url, "working_area.shp"), driver="ESRI Shapefile")

def points2shp(x,y,out_url):
    crs = {'init': 'epsg:4326'}
    point_geom = Point(x, y)
    point = gpd.GeoDataFrame(index=[0], crs=crs, geometry=[point_geom])
    point.to_file(filename=os.path.join(out_url, "point.shp"), driver="ESRI Shapefile")

def clip(dataurl,out_url,outurl2):
    wbt = whitebox.WhiteboxTools()
    wbt.work_dir = out_url
    wbt.clip_raster_to_polygon(dataurl,"working_area.shp","DEM_clipped.tif")
    wbt.breach_depressions("DEM_clipped.tif","DEM_breach.tif")
    wbt.fill_depressions("DEM_breach.tif","DEM_fill.tif")
    wbt.flow_accumulation_full_workflow("DEM_fill.tif","DEM_out.tif","Flow_dir.tif","Flow_acc.tif",log=True)
    wbt.basins("Flow_dir.tif","Basins.tif")
    wbt.extract_streams("Flow_acc.tif","streams.tif",threshold=-1)
    wbt.remove_short_streams("Flow_dir.tif","streams.tif","streams_del.tif",min_length=0.001)
    wbt.find_main_stem("Flow_dir.tif", "streams_del.tif", "main_stream.tif")
    wbt.raster_streams_to_vector("streams_del.tif","Flow_dir.tif","riverswht.shp")
    wbt.raster_streams_to_vector("main_stream.tif","Flow_dir.tif","main_stream.shp")
    wbt.horton_stream_order("Flow_dir.tif","streams_del.tif","Horton.tif")
    wbt.strahler_stream_order("Flow_dir.tif","streams_del.tif","Strahler.tif")
    wbt.raster_streams_to_vector("Horton.tif", "Flow_dir.tif", "Horton.shp")
    wbt.raster_streams_to_vector("Strahler.tif", "Flow_dir.tif", "Strahler.shp")
    # wbt.long_profile("Flow_dir.tif","streams_del.tif","DEM_fill.tif","Profile.html")
    # wbt.longest_flowpath("DEM_fill.tif","Basins.tif","longest_path.shp")
    file = gpd.read_file(os.path.join(out_url, "riverswht.shp"))
    file = gpd.read_file(os.path.join(out_url, "Horton.shp"))
    file = gpd.read_file(os.path.join(out_url, "Strahler.shp"))
    file.to_file(os.path.join(out_url, "riverswht.geojson"), driver="GeoJSON")
    file.to_file(os.path.join(out_url, "Horton.geojson"), driver="GeoJSON")
    file.to_file(os.path.join(out_url, "Strahler.geojson"), driver="GeoJSON")
    riverswht = gpd.read_file(os.path.join(out_url, "riverswht.geojson"))
    Horton = gpd.read_file(os.path.join(out_url, "Horton.geojson"))
    Strahler = gpd.read_file(os.path.join(out_url, "Strahler.geojson"))
    riverswht = file.to_json()
    Horton = file.to_json()
    Strahler = file.to_json()
    return riverswht,Horton,Strahler
    # wbt.hypsometric_analysis(dataurl, "hypso.html",watershed="working_area.shp")

def snap(dataurl,out_url):
    wbt = whitebox.WhiteboxTools()
    wbt.work_dir = out_url
    wbt.snap_pour_points("point.shp","Flow_acc.tif","snap_point.shp",snap_dist=0.01)
    wbt.watershed("Flow_dir.tif","snap_point.shp","Watershed.tif")
    # wbt.longest_flowpath("DEM_fill.tif","Watershed.tif",'LongestFlowpath.shp')
    # wbt.raster_to_vector_lines("Watershed.tif","Watershed.shp")
    mask = None
    with rasterio.open(os.path.join(out_url, "Watershed.tif")) as src:
        image = src.read(1)  # first band
        results = (
            {'properties': {'raster_val': v}, 'geometry': s}
            for i, (s, v)
            in enumerate(
            shapes(image, mask=mask, transform=src.transform)))

    geoms = list(results)
    boundary = shape(geoms[0]['geometry'])
    gpd_polygonized_raster = gpd.GeoDataFrame.from_features(geoms)
    gpd_polygonized_raster = gpd_polygonized_raster[gpd_polygonized_raster['raster_val'] == 1]
    gpd_polygonized_raster = gpd_polygonized_raster.to_json()
    return gpd_polygonized_raster


