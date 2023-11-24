<template>
  <div>
    <p style="color:white;width:90%;margin:auto;margin-bottom:10px">{{ loginStatus }}</p>
    <button type="button" id="button" v-if="!loggedIn && !dataSuccess && !loginWish" @click="loginWish = true">
      Einloggen
    </button>
    <ul v-if="loggedIn" id="favorites">
      <li :key="favorite.id" @click="askFavorite(favorite.lat, favorite.lon, favorite.id)"
          v-for="(favorite) in favorites">
        {{ favorite.name }}
      </li>
    </ul>
  </div>
  <div id="login">
    <form id="loginform" v-if="loginWish || loggedIn" @submit.prevent="login">
      <input type="text" v-model="username" v-if="!loggedIn" id="query" name="login_username"
             placeholder="Benutzername"/>
      <input type="text" v-model="password" v-if="!loggedIn" id="query" name="login_password" placeholder="Passwort"/>
      <button id="button" type="submit" v-if="!loggedIn">Anmelden</button>
      <button id="button" type="button" v-if="!loggedIn" @click="register">Registrieren</button>
      <button id="button" type="button" @click="logout" v-if="loggedIn">Ausloggen</button>
    </form>
  </div>
  <div id="divButtons">
    <label for="query"></label><input v-model="query" @keyup.enter="askElsewhere(query)" type="text" id="query"
                                      class="form-control" placeholder="Gewünschter Ort">
    <button type="button" id="button" @click="askElsewhere(query)">Wetterdaten suchen</button>
    <button type="button" id="button" v-if="notLocal" @click="askLocal">Lokales Wetter abfragen</button>
  </div>
  <div id="div" v-if="boxVisible">
    <p id="process_status" v-if="!dataSuccess">{{ processStatus }}</p>
    <p id="reverse_geocoding" v-if="dataSuccess">Aktueller Standort: {{ reverseGeocoding }}</p>
    <p id="current_temperature" v-if="dataSuccess">Aktuelle Temperatur: {{ currentTemperature }}</p>
    <p id="current_windspeed" v-if="dataSuccess">Aktuelle Windgeschwindigkeit: {{ currentWindspeed }}</p>
    <p id="current_winddirection" v-if="dataSuccess">Aktuelle Windrichtung: {{ currentWinddirection }}</p>
    <p id="current_weathercode" v-if="dataSuccess">Aktueller Wettercode: {{ currentWeathercode }}</p>
    <button type="button" id="button" v-if="notLocal && dataSuccess && noFavorite"
            @click="fetchWeather(queryLat, queryLon)">Gesuchtes Wetter
      aktualisieren
    </button>
    <button type="button" id="button" v-if="!notLocal && dataSuccess && noFavorite" @click="askLocal">Lokales Wetter
      aktualisieren
    </button>
    <button type="button" id="button" v-if="!noFavorite && dataSuccess && loggedIn"
            @click="askFavorite(lastFavoriteLat, lastFavoriteLon, lastFavoriteId)">
      Favorisiertes Wetter aktualisieren
    </button>
    <button type="button" id="button" v-if="noFavorite && dataSuccess && loggedIn" @click="addFavorite">Standort
      favorisieren
    </button>
    <button type="button" id="button" v-if="!loginWish && dataSuccess && !loggedIn" @click="loginWish = true">Einloggen,
      um favorisieren zu können
    </button>
    <button type="button" id="button" v-if="!noFavorite && dataSuccess && loggedIn"
            @click="removeFavorite(lastFavoriteId)">Standort entfavorisieren
    </button>
  </div>
</template>

<script setup>
import {ref, onBeforeMount} from 'vue'
import {reverse_geocoding, windspeed_explanation, winddirection_explanation, weathercode_explanation, search} from "@/weatherUtils";

onBeforeMount(() => {
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
const query = ref("")
const currentlat = ref("")
const currentlon = ref("")
const dataSuccess = ref(false)
const favoriteName = ref("")
const favorites = ref([])
const lastFavoriteLat = ref("")
const lastFavoriteLon = ref("")
const currentUser = ref("")
const loggedIn = ref(false)
const username = ref("")
const password = ref("")
const noFavorite = ref(true)
const lastFavoriteId = ref("")
const notLocal = ref(true)
const queryLat = ref("")
const queryLon = ref("")
const loginWish = ref(false)
const loginStatus = ref("Du bist nicht eingeloggt und kannst keine Favoriten abspeichern")

async function login() {
  loginStatus.value = "Laden..."
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
  }
  if (response.status === 401) {
    loginStatus.value = "Falsche Login-Daten!"
  }
}

async function register() {
  loginStatus.value = "Laden..."
  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
  if (response.ok) {
    await login()
  }
  if (response.status === 400) {
    loginStatus.value = "Der Benutzername ist bereits vergeben!"
  }
}

async function getCurrentUser() {
  const currentUserResponse = await fetch("/api/user", {
    method: "GET"
  })
  if (currentUserResponse.ok) {
    currentUserResponse.text().then((currentUserValue) => {
      currentUser.value = currentUserValue
      loginStatus.value = "Eingeloggt als: " + currentUser.value
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

function logout() {
  document.cookie = "quarkus-credential=; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
  loginStatus.value = "Du bist nicht eingeloggt und kannst keine Favoriten abspeichern"
  loggedIn.value = false
  loginWish.value = false
  noFavorite.value = true
}

async function askFavorite(lat, lon, id) {
  noFavorite.value = false
  notLocal.value = true
  boxVisible.value = true
  dataSuccess.value = false
  lastFavoriteLat.value = lat
  lastFavoriteLon.value = lon
  lastFavoriteId.value = id
  await fetchWeather(lat, lon)
}

function askLocal() {
  noFavorite.value = true
  notLocal.value = false
  boxVisible.value = true
  if (!navigator.geolocation) {
    processStatus.value = 'Dein Standort kann leider nicht ermittelt werden'
    dataSuccess.value = false
  } else
    dataSuccess.value = false
  navigator.geolocation.getCurrentPosition(async (pos) => {
    console.log(pos)
    await fetchWeather(pos.coords.latitude, pos.coords.longitude)
  }, () => {
    processStatus.value = 'Dein Standort kann leider nicht ermittelt werden'
    dataSuccess.value = false
    notLocal.value = true
  })
}

function askElsewhere(query) {
  noFavorite.value = true
  notLocal.value = true
  dataSuccess.value = false
  boxVisible.value = true
  search(query, async (lat, lon) => {
    console.log(query)
    await fetchWeather(lat, lon)
  }, () => {
    processStatus.value = 'Dein Standort kann leider nicht ermittelt werden'
    dataSuccess.value = false
  })
}

async function fetchWeather(latitude, longitude) {
  processStatus.value = "Suche..."
  dataSuccess.value = false
  queryLat.value = latitude
  queryLon.value = longitude
  const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=' + latitude
      + '&longitude=' + longitude + '&current_weather=true'
  )
  askWeather(response)
}

function askWeather(response) {
  loginWish.value = false
  if (response.ok) {
    response.json().then(async (data) => {
      await reverse_geocoding(data.latitude, data.longitude, (location_name, road_name, city_name) => {
        reverseGeocoding.value = location_name
        favoriteName.value = road_name + city_name
        currentlat.value = data.latitude
        currentlon.value = data.longitude
      })
      currentTemperature.value = data.current_weather.temperature + " °C"
      currentWindspeed.value = data.current_weather.windspeed + " km/h" + " (" + windspeed_explanation(data.current_weather.windspeed) + ")"
      currentWinddirection.value = data.current_weather.winddirection + "°" + " (" + winddirection_explanation(data.current_weather.winddirection) + ")"
      currentWeathercode.value = data.current_weather.weathercode + " (" + weathercode_explanation(data.current_weather.weathercode) + ")"
      dataSuccess.value = true
    })
  } else {
    processStatus.value = 'Die Wetterdaten können leider nicht ermittelt werden'
    dataSuccess.value = false
    notLocal.value = true
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
    notLocal.value = true
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
    notLocal.value = true
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
body {
  background-color: black;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  text-align: center;
}

#login {
  margin-bottom: 10px;
}

#loginform input[type=text] {
  display: block;
  box-sizing: border-box;
  margin: auto;
  margin-bottom: 10px;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #ffffff #000000;
}

*::-webkit-scrollbar {
  width: 16px;
}

*::-webkit-scrollbar-track {
  background: #000000;
}

*::-webkit-scrollbar-thumb {
  background-color: #ffffff;
  border-radius: 10px;
  border: 3px none #ffffff;
}

#favorites {
  overflow: auto;
  white-space: nowrap;
  padding: 0;
}

#favorites li {
  display: inline-block;
  color: white;
  text-align: center;
  padding: 14px;
  text-decoration: none;
}

#favorites li:hover {
  background-color: white;
  color: black;
  cursor: pointer;
}

#button {
  border-color: black;
  border-radius: 6px;
  border-style: solid;
  background-color: white;
  font-family: sans-serif;
  color: black;
  margin: 5px;
  height: 40px;
  width: 200px;
  max-width: 45%;
  vertical-align: top;
}

#button:hover {
  border-color: white;
  background-color: black;
  color: white;
  cursor: pointer;
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
  max-width: 90%;
  height: fit-content;
  margin: auto;
  margin-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  border-style: solid;
  border-color: black;
  border-radius: 6px;
}

#query {
  border-color: black;
  border-radius: 6px;
  border-style: solid;
  background-color: white;
  font-family: sans-serif;
  color: black;
  height: 40px;
  width: 400px;
  max-width: 90%;
}
</style>
