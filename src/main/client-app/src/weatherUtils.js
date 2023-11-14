export async function reverse_geocoding(latitude, longitude, callback) {
    return await fetch(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude
        + '&lon=' + longitude
    ).then(response => {
        if (response.ok) {
            response.json().then(reverse_geocode => {
                if (reverse_geocode.address.city != undefined)
                    callback(reverse_geocode.display_name, reverse_geocode.address.road, reverse_geocode.address.city)
                else if (reverse_geocode.address.town != undefined)
                    callback(reverse_geocode.display_name, reverse_geocode.address.road, reverse_geocode.address.town)
                else if (reverse_geocode.address.village != undefined)
                    callback(reverse_geocode.display_name, reverse_geocode.address.road, reverse_geocode.address.village)
                else if (reverse_geocode.address.county != undefined)
                    callback(reverse_geocode.display_name, reverse_geocode.address.road, reverse_geocode.address.county)
                else if (reverse_geocode.address.state != undefined)
                    callback(reverse_geocode.display_name, reverse_geocode.address.road, reverse_geocode.address.state)
                else if (reverse_geocode.address.country != undefined)
                    callback(reverse_geocode.display_name, reverse_geocode.address.road, reverse_geocode.address.country)
            })
        } else {
            callback("Name des Standorts konnte nicht geladen werden")
        }
    })
}

export async function search(query, callback) {
    return await fetch(
        'https://nominatim.openstreetmap.org/search?q=' + query
        + "&format=json&limit=1"
    ).then(response => {
        if (response.ok) {
            response.json().then(queryLocation => {
                console.log(queryLocation)
                callback(queryLocation[0].lat, queryLocation[0].lon)
            })
        }
    })
}

export function winddirection_explanation(winddirection) {
    if (winddirection >= 337.5) {
        return "Nördlich";
    } else if (winddirection >= 292.5) {
        return "Nordwestlich";
    } else if (winddirection >= 247.5) {
        return "Westlich";
    } else if (winddirection >= 202.5) {
        return "Südwestich";
    } else if (winddirection >= 157.5) {
        return "Südlich";
    } else if (winddirection >= 112.5) {
        return "Südöstlich";
    } else if (winddirection >= 67.5) {
        return "Östlich";
    } else if (winddirection >= 22.5) {
        return "Nordöstlich";
    } else if (winddirection >= 0) {
        return "Nördlich";
    }
}

export function weathercode_explanation(weathercode) {
    switch (weathercode) {
        case(0):
            return "Klarer Himmel";

        case(1):
            return "Überwiegend klar";

        case(2):
            return "Teilweise bewölkt";

        case(3):
            return "Bewölkt";

        case(45):
            return "Nebel";

        case(48):
            return "Ablagerung von Reifnebel";

        case(51):
            return "Leichter Nieselregen";

        case(53):
            return "Mäßiger Nieselregen";

        case(55):
            return "Dichter Nieselregen";

        case(56):
            return "Leichter gefrierender Nieselregen";

        case(57):
            return "Dichter gefrierender Nieselregen";

        case(61):
            return "Leichter Regen";

        case(63):
            return "Mäßiger Regen";

        case(65):
            return "Starker Regen";

        case(66):
            return "Leichter gefrierender Regen";

        case(67):
            return "Starker gefrierender Regen";

        case(71):
            return "Leichter Schneefall";

        case(73):
            return "Mäßiger Schneefall";

        case(75):
            return "Starker Schneefall";

        case(77):
            return "Schneekörner";

        case(80):
            return "Leichte Regenschauer";

        case(81):
            return "Mäßige Regenschauer";

        case(82):
            return "Heftige Regenschauer";

        case(85):
            return "Leichte Schneeschauer";

        case(86):
            return "Starke Schneeschauer";

        case(95):
            return "Leichtes oder mäßiges Gewitter";

        case(96):
            return "Gewitter mit leichtem Hagel";

        case(99):
            return "Gewitter mit schwerem Hagel";
    }
}