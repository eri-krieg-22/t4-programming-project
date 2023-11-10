<template>
  <div id="divButtons">
    <label for="query"></label><input type="text" id="query" class="form-control" placeholder="Wie ist das Wetter anderswo?">
    <button type="button" id="search_button">Suche</button>
    <button type="button" id="button" @click="askLocal">Wie ist das aktuelle Wetter bei mir?</button>
    <button type="button" id="refresh">Lokales Wetter aktualisieren</button>
    <button type="button" id="search_refresh">Gesuchtes Wetter aktualisieren</button>
  </div>
  <div id="div" v-if="boxVisible">
    <p id="process_status">{{processStatus}}</p>
    <p id="reverse_geocoding">{{reverseGeocoding}}</p>
    <p id="current_temperature">{{currentTemperature}}</p>
    <p id="current_windspeed">{{currentWindspeed}}</p>
    <p id="current_winddirection">{{currentWinddirection}}</p>
    <p id="current_weathercode">{{currentWeathercode}}</p>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {reverse_geocoding} from "@/weatherUtils";
import {winddirection_explanation} from "@/weatherUtils"
import {weathercode_explanation} from "@/weatherUtils"
const processStatus = ref('')
const reverseGeocoding = ref('')
const currentTemperature = ref('')
const currentWindspeed = ref('')
const currentWinddirection = ref('')
const currentWeathercode = ref('')
const boxVisible = ref(false)

function askLocal() {
  boxVisible.value = true
  if (!navigator.geolocation) {
    processStatus.value = 'Dein Standort kann leider nicht ermittelt werden'
    reverseGeocoding.value = ""
    currentTemperature.value = ""
    currentWindspeed.value = ""
    currentWinddirection.value = ""
    currentWeathercode.value = ""
  } else
    processStatus.value = "Suche..."
    reverseGeocoding.value = ""
    currentTemperature.value = ""
    currentWindspeed.value = ""
    currentWinddirection.value = ""
    currentWeathercode.value = ""
  navigator.geolocation.getCurrentPosition(async (pos) => {
    console.log(pos)
    const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=' + pos.coords.latitude
        + '&longitude=' + pos.coords.longitude + '&current_weather=true'
    )
    askWeather(response)
  }, ()=> {
    processStatus.value = 'Dein Standort kann leider nicht ermittelt werden'
    reverseGeocoding.value = ""
    currentTemperature.value = ""
    currentWindspeed.value = ""
    currentWinddirection.value = ""
    currentWeathercode.value = ""
})
}
function askWeather(response) {
  if (response.ok) {
    response.json().then(async (data) => {
      await reverse_geocoding(data.latitude, data.longitude, (location_name) => {
        processStatus.value = ""
        reverseGeocoding.value = "Aktueller Standort: " + location_name
      })
      currentTemperature.value = "Aktuelle Temperatur: " + data.current_weather.temperature + " °C"
      currentWindspeed.value = "Aktuelle Windgeschwindigkeit: " + data.current_weather.windspeed + " km/h";
      currentWinddirection.value = "Aktuelle Windrichtung: " + data.current_weather.winddirection + "°" + " (" + winddirection_explanation(data.current_weather.winddirection) + ")"
      currentWeathercode.value = "Aktueller Wettercode: " + data.current_weather.weathercode + " (" + weathercode_explanation(data.current_weather.weathercode) + ")"
    })
  }
  else {
    processStatus.value = 'Dein Standort kann leider nicht ermittelt werden'
    reverseGeocoding.value = ""
    currentTemperature.value = ""
    currentWindspeed.value = ""
    currentWinddirection.value = ""
    currentWeathercode.value = ""
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
body {
  background-color: lightblue;
  margin-left:auto;
  margin-right:auto;
  margin-top: 10%;
  text-align: center;
}

#button {
  border-color: black;
  border-radius: 6px;
  border-style: solid;
  background-color: white;
  font-family: sans-serif;
  color: black;
  margin: auto;
  height: 40px;
  width: 250px;
}

#search_button {
  border-color: black;
  border-radius: 6px;
  border-style: solid;
  background-color: white;
  font-family: sans-serif;
  color: black;
  margin: auto;
  height: 40px;
  width: 250px;
}

#button:hover {
  border-color: white;
  background-color: black;
  color: white;
}

#search_button:hover {
  border-color: white;
  background-color: black;
  color: white;
}
#divButtons {
  display:inline-block;
}

#div {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  font-family: sans-serif;
  color: black;
  text-align: center;
  background-color: white;
  width: fit-content;
  height: fit-content;
  margin: auto;
  padding-left: 10px;
  padding-right: 10px;
  border-style: solid;
  border-color: black;
  border-radius: 6px;
}

#refresh
{
  border-color: black;
  border-radius: 6px;
  border-style: solid;
  background-color: white;
  font-family: sans-serif;
  color: black;
  margin: auto auto 10px auto;
  height: 40px;
  width: 250px;
  display: none;
}

#search_refresh
{
  border-color: black;
  border-radius: 6px;
  border-style: solid;
  background-color: white;
  font-family: sans-serif;
  color: black;
  margin: auto auto 10px auto;
  height: 40px;
  width: 250px;
  display: none;
}

#search_refresh:hover {
  border-color: white;
  background-color: black;
  color: white;
}

#refresh:hover {
  border-color: white;
  background-color: black;
  color: white;
}

#query {
  border-color: black;
  border-radius: 6px;
  border-style: solid;
  background-color: white;
  font-family: sans-serif;
  color: black;
  height: 40px;
  width: 500px;
}
</style>
