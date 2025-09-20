import "./style.css";
import descriptions from "../public/descriptions.json";

type ICoord = {
  latitude: string;
  longitude: string;
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
      city: dataIp.city,
      timezone: dataIp.timezone,
    };
  } catch (err) {
    if (divBox) {
      divBox.remove();
    }
    if (errorDiv) {
      const p = document.createElement("p");
      p.innerText = `${err} Мы работаем над устранением проблемы.`;
      const image = document.createElement("img");
      image.src = "./public/Frame-14-128x128.png";
      errorDiv.appendChild(image);
      errorDiv.appendChild(p);
    }
  }
}
const coorsIp = await getIP();

async function paramsFunction() {
  try {

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
    };

    const coorsTashkent: ICoord = {
      latitude: "41.25",
      longitude: "69.25",
    };

    const searchParamsGhana = new URLSearchParams({
      ...coorsGhana,
      ...params,
    });

    const searchParamsTashkent = new URLSearchParams({
      ...coorsTashkent,
      ...params,
    });

    const links = [
      `https://api.open-meteo.com/v1/forecast?${searchParamsIp}`,
      `https://api.open-meteo.com/v1/forecast?${searchParamsGhana}`,
      `https://api.open-meteo.com/v1/forecast?${searchParamsTashkent}`,
    ];

    const response = await Promise.all(
      links.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`${response.status}`);
        }
        return await response.json();
      })
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
      image.src = "./public/Frame-14-128x128.png";
      errorDiv.appendChild(image);
      errorDiv.appendChild(p);
    }
  }
}

const respLinks = await paramsFunction();

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
            <img class="icons" src="./public/116720.png" alt="" />
            <span class="wind">${box.conditions[0]}</span>
          </div>
          <div class="div-icons-span">
            <img class="icons" src="./public/Капля.png" alt="" />
            <span class="humidity">${box.conditions[1]}</span>
          </div>
          <div class="div-icons-span">
            <img class="icons" src="./public/175970.png" alt="" />
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
    const jsonWeatherWithIP: Data = await respLinks?.[0];
    const weatherCodeIP =
      jsonWeatherWithIP.current.weather_code.toString() as keyof typeof descriptions;
    const timeIP = new Date().toLocaleString("ru-RU", {
      timeZone: coorsIp?.timezone,
      hour: "2-digit",
      minute: "2-digit",
    });
    const dataIP = {
      city: coorsIp?.city,
      time: timeIP,
      temperature:
        jsonWeatherWithIP.current.temperature_2m +
        jsonWeatherWithIP.current_units.temperature_2m,
      tempDesc:
        jsonWeatherWithIP.current.is_day === 1
          ? descriptions[weatherCodeIP].day.description
          : descriptions[weatherCodeIP].night.description,
      conditions: [
        jsonWeatherWithIP.current.wind_speed_10m +
          " " +
          jsonWeatherWithIP.current_units.wind_speed_10m,
        jsonWeatherWithIP.current.relative_humidity_2m +
          " " +
          jsonWeatherWithIP.current_units.relative_humidity_2m,
        jsonWeatherWithIP.current.precipitation +
          " " +
          jsonWeatherWithIP.current_units.precipitation,
      ],
      img:
        jsonWeatherWithIP.current.is_day === 1
          ? descriptions[weatherCodeIP].day.image
          : descriptions[weatherCodeIP].night.image,
    };

    const boxWeatherWithIP = getBox(dataIP);

    if (divBox) {
      divBox.insertAdjacentHTML("beforeend", boxWeatherWithIP);
    }

    const jsonGhana: Data = await respLinks?.[1];
    const weatherCodeGhana =
      jsonGhana.current.weather_code.toString() as keyof typeof descriptions;
    const timeGhana = new Date().toLocaleString("ru-RU", {
      timeZone: "Africa/Accra",
      hour: "2-digit",
      minute: "2-digit",
    });

    const dataGhana = {
      city: "Ghana",
      time: timeGhana,
      temperature:
        jsonGhana.current.temperature_2m +
        jsonGhana.current_units.temperature_2m,
      tempDesc:
        jsonGhana.current.is_day === 1
          ? descriptions[weatherCodeGhana].day.description
          : descriptions[weatherCodeGhana].night.description,
      conditions: [
        jsonGhana.current.wind_speed_10m +
          " " +
          jsonGhana.current_units.wind_speed_10m,
        jsonGhana.current.relative_humidity_2m +
          " " +
          jsonGhana.current_units.relative_humidity_2m,
        jsonGhana.current.precipitation +
          " " +
          jsonGhana.current_units.precipitation,
      ],
      img:
        jsonGhana.current.is_day === 1
          ? descriptions[weatherCodeGhana].day.image
          : descriptions[weatherCodeGhana].night.image,
    };

    const boxGhana = getBox(dataGhana);

    if (divBox) {
      divBox.insertAdjacentHTML("beforeend", boxGhana);
    }

    const jsonToshkent: Data = await respLinks?.[2];
    const weatherCodeToshkent =
      jsonToshkent.current.weather_code.toString() as keyof typeof descriptions;
    const timeToshkent = new Date().toLocaleString("ru-RU", {
      timeZone: "Asia/Tashkent",
      hour: "2-digit",
      minute: "2-digit",
    });

    const dataToshkent = {
      city: "Tashkent",
      time: timeToshkent,
      temperature:
        jsonToshkent.current.temperature_2m +
        jsonToshkent.current_units.temperature_2m,
      tempDesc:
        jsonToshkent.current.is_day === 1
          ? descriptions[weatherCodeToshkent].day.description
          : descriptions[weatherCodeToshkent].night.description,
      conditions: [
        jsonToshkent.current.wind_speed_10m +
          " " +
          jsonToshkent.current_units.wind_speed_10m,
        jsonToshkent.current.relative_humidity_2m +
          " " +
          jsonToshkent.current_units.relative_humidity_2m,
        jsonToshkent.current.precipitation +
          " " +
          jsonToshkent.current_units.precipitation,
      ],
      img:
        jsonToshkent.current.is_day === 1
          ? descriptions[weatherCodeToshkent].day.image
          : descriptions[weatherCodeToshkent].night.image,
    };

    const boxToshkent = getBox(dataToshkent);

    if (divBox) {
      divBox.insertAdjacentHTML("beforeend", boxToshkent);
    }
  } catch (err) {
    if (divBox) {
      divBox.remove();
    }
    if (errorDiv) {
      const p = document.createElement("p");
      p.innerText = `${err} Мы работаем над устранением проблемы.`;
      const image = document.createElement("img");
      image.src = "./public/Frame-14-128x128.png";
      errorDiv.appendChild(image);
      errorDiv.appendChild(p);
    }
  }
}

box();

function update() {
  const removeDiv = document.querySelectorAll<HTMLDivElement>("#con1");
  if (removeDiv) {
    removeDiv.forEach((elem) => {
      elem.remove();
    });
  }

  box();
}
setInterval(update, 60000);
