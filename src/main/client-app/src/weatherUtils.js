export async function reverse_geocoding(latitude, longitude, callback) {
    return await fetch(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude
        + '&lon=' + longitude
    ).then(response => {
        if (response.ok) {
            response.json().then(reverse_geocode => {
                callback(reverse_geocode.display_name)
            })
        }else {
            callback("Name des Standorts konnte nicht geladen werden")
        }
    })
}
