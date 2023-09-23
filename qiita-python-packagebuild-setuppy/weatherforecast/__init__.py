from . import open_meteo_forecast_api as forecast 
import sys


def get(location: str = "tokyo") -> dict:
    return forecast.get(location)


def main() -> None:
    # ToDo: もう少しコードを綺麗に。
    if (len(sys.argv) == 2):
        argv1 = sys.argv[1]
        if ((argv1 == "/?") or argv1 == "--help" or argv1 == "-h"):
            print("usage: weatherforecast [location]")
            # ToDo: [location]に指定可能な値
        else:
            location = argv1
            result_dict = get(location)
            print(result_dict["location"])
            print(result_dict["time"])
            print(result_dict["temperature_2m"])
    else:
        result_dict = get()
        print(result_dict["location"])
        print(result_dict["time"])
        print(result_dict["temperature_2m"])

