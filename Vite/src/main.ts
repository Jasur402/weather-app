import './style.css';
import descriptions from '../public/descriptions.json'

type ICoord= {
    latitude:string,
    longitude:string,
   
}

type IWheater={
    current:string,
    forecast_days:string,
   timezone:string
}

const coors: ICoord = {
   latitude: "48.6967",
   longitude: "13.4631",
}

const params:IWheater ={
    current:[
    "temperature_2m", 
    "relative_humidity_2m",
    "precipitation",
    "rain",
    "wind_speed_10m",
    "weather_code",
    "is_day"].join(","),
    
   forecast_days: "1",
   timezone: "Europe/Berlin",
} 

const searchParams = new URLSearchParams({
    ...coors,
    ...params
})

const city = document.querySelector<HTMLHeadingElement>(".city")
const time = document.querySelector<HTMLHeadingElement>(".time")
const temperature = document.querySelector<HTMLHeadingElement>(".temperature")
const rain = document.querySelector<HTMLParagraphElement>(".rain")
const wind = document.querySelector<HTMLSpanElement>(".wind")
const humdity = document.querySelector<HTMLSpanElement>(".humidity")
const precipitacion = document.querySelector<HTMLSpanElement>(".precipitacion")
const img = document.querySelector<HTMLImageElement>(".weather-img")

type Data = {
    current:{
    time: string,
    interval: number,
    temperature_2m: number,
    relative_humidity_2m: number,
    precipitation: number,
    wind_speed_10m:number, 
    weather_code: number,
    is_day: number,
    rain: number
   },
   timezone:string
}

function weatherAppFunction(): void {

  const url = fetch(`https://api.open-meteo.com/v1/forecast?${searchParams}`,{
    method: 'GET'
})

url.then((response) => {
  if (!response.ok) {
    throw new Error("Err");
  }
  return response.json()
}).then((json:Data)=> {
  const weatherCode = json.current.weather_code.toString() as keyof typeof descriptions
   
  if (city) {
    city.innerText = json.timezone.split("/")[1]
  }

  if (time) {
    time.innerText = json.current.time.split("T")[1]
  }

  if (temperature) {
    temperature.innerText = json.current.temperature_2m.toString().split(".")[0] + "°C"
  }

  if (rain) {
  json.current.rain === 1 ? rain.innerText = "Идет Дождь" : rain.innerText = "Дождя нет"
  }

  if (wind) {
    wind.innerText = json.current.wind_speed_10m.toString() + " km/h"
  }

  if (humdity) {
    humdity.innerText = json.current.relative_humidity_2m.toString() + "%"
  }

  if (precipitacion) {
  precipitacion.innerText = json.current.precipitation.toString() + "mm"
  }
    
    if (img) {
      json.current.is_day === 1? img.src = descriptions[weatherCode].day.image : img.src = descriptions[weatherCode].night.image
    }
    console.log(json)
}).catch((err)=> {
 console.log(err)
})
}

setInterval(weatherAppFunction,60000)

weatherAppFunction()


