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

const mainDiv = document.querySelector<HTMLDialogElement>(".box");
const errorDiv = document.querySelector<HTMLDivElement>(".error");
const city = document.querySelector<HTMLParagraphElement>(".city");
const time = document.querySelector<HTMLParagraphElement>(".time");
const temperature =
  document.querySelector<HTMLParagraphElement>(".temperature");
const tempDesc = document.querySelector<HTMLParagraphElement>(".temp-desc");
const wind = document.querySelector<HTMLSpanElement>(".wind");
const humdity = document.querySelector<HTMLSpanElement>(".humidity");
const precipitacion = document.querySelector<HTMLSpanElement>(".precipitacion");
const img = document.querySelector<HTMLImageElement>(".weather-img");

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
    if (mainDiv) {
      mainDiv.remove();
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

async function weatherWithIP(): Promise<void> {
  try {
    const respLinks = await Promise.all(
      links.map((url) =>
        fetch(url).then((response) => {
          if (!response.ok) {
            throw new Error("");
          }
          return response.json();
        })
      )
    );
    const json: Data = respLinks[0];
    const weatherCode =
      json.current.weather_code.toString() as keyof typeof descriptions;
    const timeBerlin = new Date().toLocaleString("ru-RU", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (city) {
      if (coorsIp) {
        city.innerText = coorsIp.city;
      }
    }

    if (time) {
      time.innerText = timeBerlin;
    }

    if (temperature) {
      temperature.innerText =
        Math.round(json.current.temperature_2m) +
        json.current_units.temperature_2m;
    }

    if (tempDesc) {
      json.current.is_day === 1
        ? (tempDesc.innerText = descriptions[weatherCode].day.description)
        : (tempDesc.innerText = descriptions[weatherCode].night.description);
    }

    if (wind) {
      wind.innerText =
        json.current.wind_speed_10m + " " + json.current_units.wind_speed_10m;
    }

    if (humdity) {
      humdity.innerText =
        json.current.relative_humidity_2m +
        " " +
        json.current_units.relative_humidity_2m;
    }

    if (precipitacion) {
      precipitacion.innerText =
        json.current.precipitation + " " + json.current_units.precipitation;
    }

    if (img) {
      json.current.is_day === 1
        ? (img.src = descriptions[weatherCode].day.image)
        : (img.src = descriptions[weatherCode].night.image);
    }
  } catch (err) {
    if (mainDiv) {
      mainDiv.remove();
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

setInterval(weatherWithIP, 60000);

weatherWithIP();

const getBox = function (box: {
  city: string;
  time: string;
  temperature: string;
  tempdesc: string;
  conditions: string[];
  img: string;
}) {
  return `<div id="con1" class="container">
        <p class="city">${box.city}</p>
        <p class="time">${box.time}</p>
        <div class="temperature-div">
          <p class="temperature">${box.temperature}</p>
          <p class="temp-desc">${box.tempdesc}</p>
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

async function boxGhana() {
  try {
    const respLinks = await Promise.all(
      links.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`${response.status}`);
        }
        return await response.json();
      })
    );
    const json: Data = await respLinks[1];
    const weatherCode =
      json.current.weather_code.toString() as keyof typeof descriptions;
    const time = new Date().toLocaleString("ru-RU", {
      timeZone: "Africa/Accra",
      hour: "2-digit",
      minute: "2-digit",
    });

    const data = {
      city: "Ghana",
      time: time,
      temperature:
        json.current.temperature_2m + json.current_units.temperature_2m,
      tempdesc:
        json.current.is_day === 1
          ? descriptions[weatherCode].day.description
          : descriptions[weatherCode].night.description,
      conditions: [
        json.current.wind_speed_10m + " " + json.current_units.wind_speed_10m,
        json.current.relative_humidity_2m +
          " " +
          json.current_units.relative_humidity_2m,
        json.current.precipitation + " " + json.current_units.precipitation,
      ],
      img:
        json.current.is_day === 1
          ? descriptions[weatherCode].day.image
          : descriptions[weatherCode].night.image,
    };

    const box = getBox(data);

    const divBox = document.querySelector<HTMLDivElement>(".box");
    if (divBox) {
      divBox.insertAdjacentHTML("beforeend", box);
    }
  } catch (err) {
    if (mainDiv) {
      mainDiv.remove();
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

boxGhana();

async function boxTashkent() {
  try {
    const respLinks = await Promise.all(
      links.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("");
        }
        return await response.json();
      })
    );
    const json: Data = await respLinks[2];
    const weatherCode =
      json.current.weather_code.toString() as keyof typeof descriptions;
    const time = new Date().toLocaleString("ru-RU", {
      timeZone: "Asia/Tashkent",
      hour: "2-digit",
      minute: "2-digit",
    });

    const data = {
      city: "Tashkent",
      time: time,
      temperature:
        json.current.temperature_2m + json.current_units.temperature_2m,
      tempdesc:
        json.current.is_day === 1
          ? descriptions[weatherCode].day.description
          : descriptions[weatherCode].night.description,
      conditions: [
        json.current.wind_speed_10m + " " + json.current_units.wind_speed_10m,
        json.current.relative_humidity_2m +
          " " +
          json.current_units.relative_humidity_2m,
        json.current.precipitation + " " + json.current_units.precipitation,
      ],
      img:
        json.current.is_day === 1
          ? descriptions[weatherCode].day.image
          : descriptions[weatherCode].night.image,
    };

    const box = getBox(data);

    const divBox = document.querySelector<HTMLDivElement>(".box");
    if (divBox) {
      divBox.insertAdjacentHTML("beforeend", box);
    }
  } catch (err) {
    if (mainDiv) {
      mainDiv.remove();
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

boxTashkent();

function update() {
  const removeDiv = document.querySelectorAll<HTMLDivElement>("#con1");
  if (removeDiv) {
    removeDiv.forEach((elem) => {
      elem.remove();
    });
  }
  boxTashkent();
  boxGhana();
}
setInterval(update, 60000);
