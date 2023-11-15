<template>
  <div v-if="loggedIn" id="favorites">
    <p>Eingeloggt als: {{currentUser}}</p>
    <ul>
      <li :key="favorite.id" @click="askFavorite(favorite.lat, favorite.lon, favorite.id)" v-for="(favorite) in favorites">
        {{ favorite.name }}
      </li>
    </ul>
  </div>
  <form id="loginform" @submit.prevent="login">
    <input type="text" v-model="username" id="query" name="login_username" placeholder="Benutzername"/>
    <input type="text" v-model="password" id="query" name="login_password" placeholder="Passwort"/>
    <button id="button" type="submit">Anmelden</button>
    <button id="button" type="button" @click="register">Registrieren</button>
    <button id="button" type="button" @click="logout">Ausloggen</button>
  </form>
  <div id="divButtons">
    <label for="query"></label><input v-model="query" @keyup.enter="askElsewhere(query)" type="text" id="query"
                                      class="form-control" placeholder="Wie ist das Wetter anderswo?">
    <button type="button" id="button" @click="askElsewhere(query)">Suche</button>
    <button type="button" id="button" v-if="newLocal" @click="askLocal">Wie ist das aktuelle Wetter bei mir?</button>
  </div>
  <div id="div" v-if="boxVisible">
    <p id="process_status" v-if="processing">{{ processStatus }}</p>
    <p id="reverse_geocoding" v-if="dataSuccess">Aktueller Standort: {{ reverseGeocoding }}</p>
    <p id="current_temperature" v-if="dataSuccess">Aktuelle Temperatur: {{ currentTemperature }}</p>
    <p id="current_windspeed" v-if="dataSuccess">Aktuelle Windgeschwindigkeit: {{ currentWindspeed }}</p>
    <p id="current_winddirection" v-if="dataSuccess">Aktuelle Windrichtung: {{ currentWinddirection }}</p>
    <p id="current_weathercode" v-if="dataSuccess">Aktueller Wettercode: {{ currentWeathercode }}</p>
    <button type="button" id="button" v-if="oldQuery" @click="askElsewhere(lastQuery)">Gesuchtes Wetter
      aktualisieren
    </button>
    <button type="button" id="button" v-if="oldLocal && dataSuccess" @click="askLocal">Lokales Wetter aktualisieren</button>
    <button type="button" id="button" v-if="oldFavorite && dataSuccess && loggedIn" @click="askFavorite(lastFavoriteLat, lastFavoriteLon)">
      Favorisiertes Wetter aktualisieren
    </button>
    <button type="button" id="button" v-if="noFavorite && dataSuccess && loggedIn" @click="addFavorite">Standort favorisieren</button>
    <button type="button" id="button" v-if="!noFavorite && dataSuccess && loggedIn" @click="removeFavorite(lastFavoriteId)">Standort entfavorisieren</button>
  </div>
</template>

<script setup>
import {ref, onBeforeMount} from 'vue'
import {reverse_geocoding} from "@/weatherUtils";
import {winddirection_explanation} from "@/weatherUtils"
import {weathercode_explanation} from "@/weatherUtils"
import {search} from "@/weatherUtils"

onBeforeMount(()=>{
  getCurrentUser();
  getFavorites();
})

const processStatus = ref('')
const reverseGeocoding = ref('')
const currentTemperature = ref('')
const currentWindspeed = ref('')
const currentWinddirection = ref('')
const currentWeathercode = ref('')
const boxVisible = ref(false)
const newLocal = ref(true)
const oldLocal = ref(false)
const query = ref("")
const lastQuery = ref("")
const oldQuery = ref(false)
const currentlat = ref("")
const currentlon = ref("")
const dataSuccess = ref(false)
const processing = ref(true)
const favoriteName = ref("")
const favorites = ref([])
const lastFavoriteLat = ref("")
const lastFavoriteLon = ref("")
const oldFavorite = ref(false)
const currentUser = ref("")
const loggedIn = ref(false)
const username = ref("")
const password = ref("")
const noFavorite = ref(true)
const lastFavoriteId = ref("")

async function login() {
  const formData = new FormData
  formData.append("login_username", username.value)
  formData.append("login_password", password.value)
  const response = await fetch("/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(formData)
  })
  if (response.ok) {
    console.log(response)
    await getFavorites()
    await getCurrentUser()
    loggedIn.value = true
  }
  if (response.status === 401) {
    alert("Falsches Passwort!")
  }
}

async function register(){
  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username:username.value,
      password:password.value
    })
  })
  if (response.ok) {
  await login()
  }
  if (response.status === 400) {
    alert("Username existiert bereits!")
  }
}

async function getCurrentUser(){
  const currentUserResponse = await fetch("/api/user", {
    method: "GET"
  })
  if (currentUserResponse.ok) {
    currentUserResponse.text().then((currentUserValue) => {
      currentUser.value = currentUserValue
      loggedIn.value = true
    })
  }
  if (currentUserResponse.status === 401) {
    loggedIn.value = false
  }
}

async function getFavorites() {
  const favoriteResponse = await fetch("/api/favorite", {
    method: "GET"
  })
  if (favoriteResponse.ok) {
    favoriteResponse.json().then((favoriteData) => {
      favorites.value = favoriteData
    })
  }
}

function logout(){
  document.cookie = "quarkus-credential=; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
  loggedIn.value = false
}

async function askFavorite(lat, lon, id) {
  noFavorite.value = false
  oldFavorite.value = false
  boxVisible.value = true
  processing.value = true
  oldLocal.value = false
  processStatus.value = "Suche..."
  dataSuccess.value = false
  lastFavoriteLat.value = lat
  lastFavoriteLon.value = lon
  lastFavoriteId.value = id
  const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=' + lat
      + '&longitude=' + lon + '&current_weather=true'
  )
  askWeather(response)
  oldQuery.value = false
  newLocal.value = false
  oldLocal.value = false
  oldFavorite.value = true
}

function askLocal() {
  noFavorite.value = true
  oldLocal.value = false
  oldFavorite.value = false
  oldQuery.value = false
  processing.value = true
  boxVisible.value = true
  if (!navigator.geolocation) {
    processStatus.value = 'Dein Standort kann leider nicht ermittelt werden'
    dataSuccess.value = false
  } else
    processStatus.value = "Suche..."
  dataSuccess.value = false
  navigator.geolocation.getCurrentPosition(async (pos) => {
    console.log(pos)
    const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=' + pos.coords.latitude
        + '&longitude=' + pos.coords.longitude + '&current_weather=true'
    )
    askWeather(response)
    newLocal.value = false
    oldLocal.value = true
    oldQuery.value = false
  }, () => {
    processStatus.value = 'Dein Standort kann leider nicht ermittelt werden'
    dataSuccess.value = false
  })
}

function askElsewhere(query) {
  noFavorite.value = true
  processStatus.value = "Suche..."
  oldFavorite.value = false
  dataSuccess.value = false
  lastQuery.value = query
  oldLocal.value = false
  oldQuery.value = false
  processing.value = true
  boxVisible.value = true
  search(query, async (lat, lon) => {
    console.log(query)
    const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=' + lat
        + '&longitude=' + lon + '&current_weather=true'
    )
    askWeather(response)
    oldQuery.value = true
    newLocal.value = true
    oldLocal.value = false
  }, () => {
    processStatus.value = 'Dein Standort kann leider nicht ermittelt werden'
    dataSuccess.value = false
  })
}

function askWeather(response) {
  if (response.ok) {
    response.json().then(async (data) => {
      await reverse_geocoding(data.latitude, data.longitude, (location_name, road_name, city_name) => {
        processing.value = false
        reverseGeocoding.value = location_name
        favoriteName.value = road_name + city_name
        currentlat.value = data.latitude
        currentlon.value = data.longitude
      })
      currentTemperature.value = data.current_weather.temperature + " °C"
      currentWindspeed.value = data.current_weather.windspeed + " km/h"
      currentWinddirection.value = data.current_weather.winddirection + "°" + " (" + winddirection_explanation(data.current_weather.winddirection) + ")"
      currentWeathercode.value = data.current_weather.weathercode + " (" + weathercode_explanation(data.current_weather.weathercode) + ")"
      dataSuccess.value = true
    })
  } else {
    processing.value = true
    processStatus.value = 'Die Wetterdaten können leider nicht ermittelt werden'
    dataSuccess.value = false
  }
}

async function addFavorite() {
  const response = await fetch("/api/favorite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: favoriteName.value,
      lat: currentlat.value,
      lon: currentlon.value
    })
  })
  if (response.ok) {
    console.log(response)
    await getFavorites()
    response.json().then((favorite) => {
      lastFavoriteLat.value = favorite.lat
      lastFavoriteLon.value = favorite.lon
      lastFavoriteId.value = favorite.id
    })
    noFavorite.value = false
  }
}

async function removeFavorite(id) {
  const response = await fetch("/api/favorite", {
    method: "DELETE",
    headers: {
      "Content-Type": "text/plain"
    },
    body: id
  })
  if (response.ok) {
    console.log(response)
    await getFavorites()
    noFavorite.value = true
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
body {
  background-color: lightblue;
  margin-left: auto;
  margin-right: auto;
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

#button:hover {
  border-color: white;
  background-color: black;
  color: white;
}

#div {
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

#refresh {
  border-color: black;
  border-radius: 6px;
  border-style: solid;
  background-color: white;
  font-family: sans-serif;
  color: black;
  margin: auto auto 10px auto;
  height: 40px;
  width: 250px;
}

#search_refresh {
  border-color: black;
  border-radius: 6px;
  border-style: solid;
  background-color: white;
  font-family: sans-serif;
  color: black;
  margin: auto auto 10px auto;
  height: 40px;
  width: 250px;
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
