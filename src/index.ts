import './app.css';
import axios from 'axios';
import L from 'leaflet';

const form = document.querySelector('form')! as HTMLFormElement;
const addressInput = document.getElementById('address')! as HTMLInputElement;
const containerDiv = document.getElementById('container')! as HTMLDivElement;

const POSITIONSTACK_API_KEY = 'a6b68f8b5aba33f5850a640f5b6f0aa7';

function clearDiv(){
    if (containerDiv) {
        while (containerDiv.firstChild) {
          containerDiv.removeChild(containerDiv.firstChild);
        }
    }
    const newMapContainer = document.createElement("div");
    const newP = document.createElement('p');
    newP.innerHTML = "Please enter an address!";
    newMapContainer.setAttribute("id","map");
    newMapContainer.insertAdjacentElement('afterbegin',newP);
    containerDiv.insertAdjacentElement('afterbegin',newMapContainer);

}

type Geolocation = {
    data: {latitude :number,longitude:number,label:string}[],
    length: number,
}
function searchAddressHandle(event:Event){
    event.preventDefault();
    const enteredAddress = addressInput.value;

    // NOTE: Clear map container
    clearDiv();

    //send this to Postionstack's api.
    axios.get<Geolocation>(`http://api.positionstack.com/v1/forward?access_key=${POSITIONSTACK_API_KEY}&query=${encodeURI(enteredAddress)}&country_module=1&limit=1`)
    .then(response => {
        if(response.statusText !== 'OK' || response.data.data.length === 0){
            throw new Error("Could not fetch the location!");
        }

        const coordinates = {
            lat: response.data.data[0].latitude,
            lng: response.data.data[0].longitude,
            label: response.data.data[0].label,
        }

        //NOTE: Leaflet logic.
        const map = L.map('map',{
            center: [coordinates.lat,coordinates.lng],
            zoom: 13
        });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([coordinates.lat, coordinates.lng]).addTo(map)
            .bindPopup(coordinates.label)
            .openPopup();

    }).catch(error => {
        console.error(`Error: ${error.message}`)
    })
    addressInput.value = '';
}

form.addEventListener('submit',searchAddressHandle);