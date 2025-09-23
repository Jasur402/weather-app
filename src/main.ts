import "./style.css";
import descriptions from "../public/descriptions.json";

type ICoord = {
  latitude: string;
  longitude: string;
  timezone: string;
};

type IWheater = {
  current: string;
  forecast_days: string;
};

type Data = {
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
    rain: number;
  };
  city: string;
  timezone: string;
  current_units: {
    precipitation: string;
    relative_humidity_2m: string;
    temperature_2m: string;
    wind_speed_10m: string;
  };
};

const divBox = document.querySelector<HTMLDialogElement>(".box");
const errorDiv = document.querySelector<HTMLDivElement>(".error");

async function getIP() {
  try {
    const resIp = await fetch("http://ip-api.com/json/");
    if (!resIp.ok) {
      throw new Error(`${resIp.status}`);
    }
    const dataIp = await resIp.json();

    return {
      latitude: dataIp.lat,
      longitude: dataIp.lon,
      timezone: dataIp.timezone,
      city: dataIp.city,
    };
  } catch (err) {
    if (divBox) {
      divBox.remove();
    }
    if (errorDiv) {
      const p = document.createElement("p");
      p.innerText = `${err} Мы работаем над устранением проблемы.`;
      const image = document.createElement("img");
      image.src = "./public/error.png";
      errorDiv.appendChild(image);
      errorDiv.appendChild(p);
    }
  }
}
const coorsIp = await getIP();

const params: IWheater = {
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation",
    "rain",
    "wind_speed_10m",
    "weather_code",
    "is_day",
  ].join(","),
  forecast_days: "1",
};

const searchParamsIp = new URLSearchParams({
  ...coorsIp,
  ...params,
});

const coorsGhana: ICoord = {
  latitude: "12.01",
  longitude: "20.75",
  timezone: "Africa/Accra",
};

const coorsTashkent: ICoord = {
  latitude: "41.25",
  longitude: "69.25",
  timezone: "Asia/Tashkent",
};

const searchParamsGhana = new URLSearchParams({
  ...coorsGhana,
  ...params,
});

const searchParamsTashkent = new URLSearchParams({
  ...coorsTashkent,
  ...params,
});

const citieslinks = [
  {
    cityName: coorsIp?.city,
    link: `https://api.open-meteo.com/v1/forecast?${searchParamsIp}`,
  },
  {
    cityName: "Ghana",
    link: `https://api.open-meteo.com/v1/forecast?${searchParamsGhana}`,
  },
  {
    cityName: "Tashkent",
    link: `https://api.open-meteo.com/v1/forecast?${searchParamsTashkent}`,
  },
];

async function funPromise() {
  try {
    const response = await Promise.all(
      citieslinks.map(async (link) => {
        const responseUrl = await fetch(link.link);
        if (!responseUrl.ok) {
          throw new Error(`${responseUrl.status}`);
        }
        const result = await responseUrl.json();
        return { ...result, city: link.cityName };
      }),
    );
    return response;
  } catch (err) {
    if (divBox) {
      divBox.remove();
    }
    if (errorDiv) {
      const p = document.createElement("p");
      p.innerText = `${err} Мы работаем над устранением проблемы.`;
      const image = document.createElement("img");
      image.src = "./public/error.png";
      errorDiv.appendChild(image);
      errorDiv.appendChild(p);
    }
  }
}

const respLinks = await funPromise();

const getBox = function (box: {
  city: string;
  time: string;
  temperature: string;
  tempDesc: string;
  conditions: string[];
  img: string;
}) {
  return `<div id="con1" class="container">
        <p class="city">${box.city}</p>
        <p class="time">${box.time}</p>
        <div class="temperature-div">
          <p class="temperature">${box.temperature}</p>
          <p class="temp-desc">${box.tempDesc}</p>
        </div>
        <div class="conditions">
          <div class="div-icons-span">
            <img class="icons" src="./public/wind.png" alt="" />
            <span class="wind">${box.conditions[0]}</span>
          </div>
          <div class="div-icons-span">
            <img class="icons" src="./public/humidity.png" alt="" />
            <span class="humidity">${box.conditions[1]}</span>
          </div>
          <div class="div-icons-span">
            <img class="icons" src="./public/precipitacion.png" alt="" />
            <span class="precipitacion">${box.conditions[2]}</span>
          </div>
        </div>
        <div>
          <img class="weather-img" src="${box.img}" alt="" />
        </div>
      </div>`;
};

async function box() {
  try {
    respLinks?.forEach((jsonWeather: Data) => {
      console.log(jsonWeather);

      const weatherCode =
        jsonWeather.current.weather_code.toString() as keyof typeof descriptions;
      const time = new Date().toLocaleString("ru-RU", {
        timeZone: jsonWeather.timezone,
        hour: "2-digit",
        minute: "2-digit",
      });

      const data = {
        city: jsonWeather.city,
        time: time,
        temperature:
          jsonWeather.current.temperature_2m +
          jsonWeather.current_units.temperature_2m,
        tempDesc:
          jsonWeather.current.is_day === 1
            ? descriptions[weatherCode].day.description
            : descriptions[weatherCode].night.description,
        conditions: [
          jsonWeather.current.wind_speed_10m +
            " " +
            jsonWeather.current_units.wind_speed_10m,
          jsonWeather.current.relative_humidity_2m +
            " " +
            jsonWeather.current_units.relative_humidity_2m,
          jsonWeather.current.precipitation +
            " " +
            jsonWeather.current_units.precipitation,
        ],
        img:
          jsonWeather.current.is_day === 1
            ? descriptions[weatherCode].day.image
            : descriptions[weatherCode].night.image,
      };

      const boxWeatherWithIP = getBox(data);

      if (divBox) {
        divBox.insertAdjacentHTML("beforeend", boxWeatherWithIP);
      }
    });
  } catch (err) {
    if (divBox) {
      divBox.remove();
    }
    if (errorDiv) {
      const p = document.createElement("p");
      p.innerText = `${err} Мы работаем над устранением проблемы.`;
      const image = document.createElement("img");
      image.src = "./public/error.png";
      errorDiv.appendChild(image);
      errorDiv.appendChild(p);
    }
  }
}

box();

function update() {
  const div = document.querySelector<HTMLDivElement>(".box");
  if (div) {
    div.innerHTML = "";
  }
  box();
}
setInterval(update, 60000);
