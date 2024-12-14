const apiUrl = 'https://mocki.io/v1/0f95c38c-cdcd-4b32-b3f3-d6dacf9a0f1c';
let destinations = [];
let amenities = [];

// Fetching Data
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    destinations = data.data.destinations;
    amenities = data.data.filters.amenities;
    const hotels = data.data.hotels;

    populateAmenities(); 
    displayHotels(hotels);  
  })
  .catch(error => console.error('Error fetching destinations, amenities, and hotels:', error));

// Autocomplete function for search input
const destinationInput = document.getElementById('destination');
const suggestionsBox = document.getElementById('suggestions');

destinationInput.addEventListener('input', function () {
  const query = destinationInput.value.toLowerCase();
  if (query.length > 0) {
    const filteredDestinations = destinations.filter(destination => destination.toLowerCase().includes(query));
    showSuggestions(filteredDestinations);
  } else {
    suggestionsBox.innerHTML = '';
  }
});

function showSuggestions(suggestions) {
  suggestionsBox.innerHTML = '';
  suggestions.forEach(suggestion => {
    const suggestionDiv = document.createElement('div');
    suggestionDiv.classList.add('autocomplete-suggestion');
    suggestionDiv.textContent = suggestion;
    suggestionDiv.addEventListener('click', function () {
      destinationInput.value = suggestion;
      suggestionsBox.innerHTML = '';
    });
    suggestionsBox.appendChild(suggestionDiv);
  });
}

// Initialize the Date Range Picker (Flatpickr)
flatpickr("#dates", {
  mode: "range",
  dateFormat: "Y-m-d",
  minDate: "today",
  onChange: function (selectedDates) {
    const checkInDate = selectedDates[0];
    const checkOutDate = selectedDates[1];

    document.getElementById('checkInDate').value = checkInDate ? checkInDate.toISOString().split('T')[0] : '';
    document.getElementById('checkOutDate').value = checkOutDate ? checkOutDate.toISOString().split('T')[0] : '';
  }
});

// Dynamic counter for guests and rooms
const guestsInput = document.getElementById('guests');
document.getElementById('increaseGuests').addEventListener('click', function () {
  guestsInput.value = parseInt(guestsInput.value) + 1;
});
document.getElementById('decreaseGuests').addEventListener('click', function () {
  if (guestsInput.value > 1) {
    guestsInput.value = parseInt(guestsInput.value) - 1;
  }
});

const roomsInput = document.getElementById('rooms');
document.getElementById('increaseRooms').addEventListener('click', function () {
  roomsInput.value = parseInt(roomsInput.value) + 1;
});
document.getElementById('decreaseRooms').addEventListener('click', function () {
  if (roomsInput.value > 1) {
    roomsInput.value = parseInt(roomsInput.value) - 1;
  }
});

// Initialize Price Range Slider using noUiSlider
const priceSlider = document.getElementById('price-range');
const minPriceLabel = document.getElementById('min-price');
const maxPriceLabel = document.getElementById('max-price');

noUiSlider.create(priceSlider, {
  start: [0, 30000],
  connect: true,
  range: {
    'min': 0,
    'max': 30000
  },
  step: 500,
  format: {
    to: value => '₹' + Math.round(value),
    from: value => value.replace('₹', '')
  }
});

priceSlider.noUiSlider.on('update', function (values, handle) {
  if (handle === 0) {
    minPriceLabel.innerText = values[0];
  } else {
    maxPriceLabel.innerText = values[1];
  }
});

// Initialize Distance Range Slider
const distanceSlider = document.getElementById('distance-range');
const minDistanceLabel = document.getElementById('min-distance');
const maxDistanceLabel = document.getElementById('max-distance');

noUiSlider.create(distanceSlider, {
  start: [0, 10],
  connect: true,
  range: {
    'min': 0,
    'max': 10
  },
  step: 0.1,
  format: {
    to: value => value.toFixed(1) + ' km',
    from: value => parseFloat(value.replace(' km', ''))
  }
});

distanceSlider.noUiSlider.on('update', function (values, handle) {
  if (handle === 0) {
    minDistanceLabel.innerText = values[0];
  } else {
    maxDistanceLabel.innerText = values[1];
  }
});

// Function to populate amenities checkboxes
function populateAmenities() {
  const amenitiesList = document.getElementById('amenitiesList');

  amenities.forEach(amenity => {
    const div = document.createElement('div');
    div.classList.add('form-check', 'amenities-checkbox');

    const input = document.createElement('input');
    input.classList.add('form-check-input');
    input.type = 'checkbox';
    input.id = amenity;

    const label = document.createElement('label');
    label.classList.add('form-check-label');
    label.setAttribute('for', amenity);
    label.innerText = amenity;

    div.appendChild(input);
    div.appendChild(label);
    amenitiesList.appendChild(div);
  });
}

// Fetch hotels and display hotel list
function displayHotels(hotels) {
  const hotelList = document.getElementById('hotel-list');
  hotelList.innerHTML = '';
  hotels.forEach(hotel => {
    const hotelCard = document.createElement('div');
    hotelCard.classList.add('col-md-4', 'hotel-card', 'mb-3');
    hotelCard.innerHTML = `
      <div class="card">
        <img src="${hotel.image}" class="card-img-top" alt="${hotel.name}">
        <div class="card-body">
          <h5 class="card-title">${hotel.name}</h5>
          <p class="card-text">${hotel.location}</p>
          <p class="card-text">₹${hotel.discounted_price} per night</p>
          <div class="hover-info">
            <p>Reviews: ${hotel.reviews.total_reviews} (${hotel.reviews.average_rating}★)</p>
            <p>Special Offer: ${hotel.discount}% off</p>
          </div>
          <button class="btn btn-primary" onclick="showHotelDetails(${hotel.id})">Book Now</button>
        </div>
      </div>
    `;
    hotelList.appendChild(hotelCard);
  });
}

// Function to show hotel details in modal
function showHotelDetails(hotelId) {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const hotels = data.data.hotels;
      const selectedHotel = hotels.find(hotel => hotel.id === hotelId);

      document.getElementById('hotelModalLabel').innerText = selectedHotel.name;
      document.getElementById('hotelDescription').innerHTML = `<p>${selectedHotel.description}</p>`;
      document.getElementById('cancellationPolicy').innerText = selectedHotel.cancellation_policy;

      const carouselImages = document.getElementById('carouselImages');
      carouselImages.innerHTML = `
        <div class="carousel-item active">
          <img src="${selectedHotel.image}" class="d-block w-100" alt="${selectedHotel.name}">
        </div>
      `;

      const amenities = selectedHotel.amenities.map(amenity => `<li>${amenity}</li>`).join('');
      document.getElementById('hotelAmenities').innerHTML = `<h5>Amenities:</h5><ul>${amenities}</ul>`;

      document.getElementById('dynamicPrice').innerText = `Price per night: ₹${selectedHotel.discounted_price}`;

      const hotelModal = new bootstrap.Modal(document.getElementById('hotelModal'));
      hotelModal.show();
    })
    .catch(error => console.error('Error fetching hotel details:', error));
}

// Filter hotels based on selected amenities
function filterHotelsByAmenities(hotels) {
  const selectedAmenities = Array.from(document.querySelectorAll('.form-check-input:checked')).map(input => input.id);

  const filteredHotels = hotels.filter(hotel => {
    return selectedAmenities.every(amenity => hotel.amenities.includes(amenity));
  });

  displayHotels(filteredHotels);
}

// Search hotels based on filters
document.getElementById('searchBtn').addEventListener('click', function () {
    const destination = destinationInput.value.trim();
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const guests = guestsInput.value;
    const rooms = roomsInput.value;
    const minPrice = parseInt(minPriceLabel.innerText.replace('₹', ''));
    const maxPrice = parseInt(maxPriceLabel.innerText.replace('₹', ''));
    const starRating = document.getElementById('star-rating').value;
    const hotelType = document.getElementById('hotel-type').value;
    const minDistance = parseFloat(minDistanceLabel.innerText.replace(' km', ''));
    const maxDistance = parseFloat(maxDistanceLabel.innerText.replace(' km', ''));
    if (destination && checkInDate && checkOutDate && guests && rooms) {
        fetchHotels(destination, checkInDate, checkOutDate, guests, rooms, minPrice, maxPrice, starRating, hotelType, minDistance, maxDistance);
      } else {
        alert("Please fill in all fields (destination, dates, guests, rooms).");
      }
    

  // Fetch hotels based on search criteria
function fetchHotels(destination, checkInDate, checkOutDate, guests, rooms, minPrice, maxPrice, starRating, hotelType) {
    const starRatingNum = parseInt(starRating);
  
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const hotels = data.data.hotels.filter(hotel => 
          hotel.location.toLowerCase() === destination.toLowerCase() &&
          hotel.discounted_price >= minPrice && 
          hotel.discounted_price <= maxPrice &&
          hotel.rating === starRatingNum &&
          (hotelType === "" || (hotel.type && hotel.type.toLowerCase() === hotelType.toLowerCase()))
        );

        filterHotelsByAmenities(hotels);
        displayHotels(hotels, checkInDate, checkOutDate, guests, rooms);
      })
      .catch(error => console.error('Error fetching hotels:', error));
  }
});
