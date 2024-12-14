const apiUrl = 'https://mocki.io/v1/0f95c38c-cdcd-4b32-b3f3-d6dacf9a0f1c';
let destinations = [];
let amenities = [];

// Fetch destinations and amenities from API
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    destinations = data.data.destinations;
    amenities = data.data.filters.amenities; // Assuming the amenities are in this structure
    
    populateAmenities();  // Populate amenities checkboxes after fetching data
  })
  .catch(error => console.error('Error fetching destinations and amenities:', error));

// Autocomplete function for search input
const destinationInput = document.getElementById('destination');
const suggestionsBox = document.getElementById('suggestions');

destinationInput.addEventListener('input', function() {
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
    suggestionDiv.addEventListener('click', function() {
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
  onChange: function(selectedDates) {
    const checkInDate = selectedDates[0];
    const checkOutDate = selectedDates[1];

    // Save the selected dates for later use
    document.getElementById('checkInDate').value = checkInDate ? checkInDate.toISOString().split('T')[0] : '';
    document.getElementById('checkOutDate').value = checkOutDate ? checkOutDate.toISOString().split('T')[0] : '';
  }
});

// Dynamic counter for guests
const guestsInput = document.getElementById('guests');
document.getElementById('increaseGuests').addEventListener('click', function() {
  guestsInput.value = parseInt(guestsInput.value) + 1;
});

document.getElementById('decreaseGuests').addEventListener('click', function() {
  if (guestsInput.value > 1) {
    guestsInput.value = parseInt(guestsInput.value) - 1;
  }
});

// Dynamic counter for rooms
const roomsInput = document.getElementById('rooms');
document.getElementById('increaseRooms').addEventListener('click', function() {
  roomsInput.value = parseInt(roomsInput.value) + 1;
});

document.getElementById('decreaseRooms').addEventListener('click', function() {
  if (roomsInput.value > 1) {
    roomsInput.value = parseInt(roomsInput.value) - 1;
  }
});

// Initialize Price Range Slider using noUiSlider
const priceSlider = document.getElementById('price-range');
const minPriceLabel = document.getElementById('min-price');
const maxPriceLabel = document.getElementById('max-price');

noUiSlider.create(priceSlider, {
  start: [0, 30000], // Default start range
  connect: true,
  range: {
    'min': 0,
    'max': 30000
  },
  step: 500,
  format: {
    to: function (value) {
      return '₹' + Math.round(value);
    },
    from: function (value) {
      return value.replace('₹', '');
    }
  }
});

// Update the displayed price range labels
priceSlider.noUiSlider.on('update', function (values, handle) {
  if (handle === 0) {
    minPriceLabel.innerText = values[0];
  } else {
    maxPriceLabel.innerText = values[1];
  }
});

// Initialize Distance Range Slider using noUiSlider
const distanceSlider = document.getElementById('distance-range');
const minDistanceLabel = document.getElementById('min-distance');
const maxDistanceLabel = document.getElementById('max-distance');

noUiSlider.create(distanceSlider, {
  start: [0, 10], // Default start range (0 to 10 km)
  connect: true,
  range: {
    'min': 0,
    'max': 10
  },
  step: 0.1, // Step size for finer control (float points)
  format: {
    to: function (value) {
      return value.toFixed(1) + ' km'; // Show one decimal place
    },
    from: function (value) {
      return parseFloat(value.replace(' km', '')); // Convert back to float
    }
  }
});

// Update the displayed distance range labels
distanceSlider.noUiSlider.on('update', function (values, handle) {
  if (handle === 0) {
    minDistanceLabel.innerText = values[0]; // Update minimum distance
  } else {
    maxDistanceLabel.innerText = values[1]; // Update maximum distance
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

// Filter hotels based on selected amenities
function filterHotelsByAmenities(hotels) {
  const selectedAmenities = Array.from(document.querySelectorAll('.form-check-input:checked')).map(input => input.id);

  const filteredHotels = hotels.filter(hotel => {
    return selectedAmenities.every(amenity => hotel.amenities.includes(amenity));
  });

  displayHotels(filteredHotels);
}

// Search hotels based on destination, dates, guests, rooms, and price range
document.getElementById('searchBtn').addEventListener('click', function() {
  const destination = destinationInput.value.trim();
  const checkInDate = document.getElementById('checkInDate').value;
  const checkOutDate = document.getElementById('checkOutDate').value;
  const guests = guestsInput.value;
  const rooms = roomsInput.value;
  const minPrice = parseInt(minPriceLabel.innerText.replace('₹', ''));
  const maxPrice = parseInt(maxPriceLabel.innerText.replace('₹', ''));
  const starRating = document.getElementById('star-rating').value;
  const hotelType = document.getElementById('hotel-type').value; // Get selected hotel type
  const minDistance = parseFloat(minDistanceLabel.innerText.replace(' km', ''));
  const maxDistance = parseFloat(maxDistanceLabel.innerText.replace(' km', ''));

  if (destination && checkInDate && checkOutDate && guests && rooms) {
    fetchHotels(destination, checkInDate, checkOutDate, guests, rooms, minPrice, maxPrice, starRating, hotelType, minDistance, maxDistance);
  } else {
    alert("Please fill in all fields (destination, dates, guests, rooms).");
  }
});

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
        hotel.rating === starRatingNum && // Filter by selected star rating
        (hotelType === "" || (hotel.type && hotel.type.toLowerCase() === hotelType.toLowerCase())) // Check if hotel.type is defined
        
      );
      console.log("Selected hotel type:", hotelType);
      console.log("Hotels before filtering:", data.data.hotels);
      console.log("Hotels after filtering:", hotels);

      filterHotelsByAmenities(hotels);       // Filter hotels by amenities after fetching
      displayHotels(hotels, checkInDate, checkOutDate, guests, rooms);
    })
    .catch(error => console.error('Error fetching hotels:', error));
}

// Display hotel details and filter by date availability
function displayHotels(hotels, checkInDate, checkOutDate, guests, rooms) {
  const hotelList = document.getElementById('hotel-list');
  hotelList.innerHTML = ''; // Clear previous results

  if (hotels.length === 0) {
    hotelList.innerHTML = '<div class="col-12"><p>No hotels found for this destination and price range and for this star rating.</p></div>';
    return;
  }

  hotels.forEach(hotel => {
    const availableRooms = hotel.availability.dates.filter(date =>
      new Date(date) >= new Date(checkInDate) && new Date(date) <= new Date(checkOutDate)
    );

    if (availableRooms.length > 0 && hotel.availability.rooms_available >= rooms) {
      const hotelCard = document.createElement('div');
      hotelCard.classList.add('col-md-4');
      hotelCard.classList.add('hotel-card');
      hotelCard.innerHTML = `
        <div class="card">
          <img src="${hotel.image}" class="card-img-top hotel-img" alt="${hotel.name}">
          <div class="card-body">
            <h5 class="card-title">${hotel.name}</h5>
            <p class="card-text">${hotel.description}</p>
          
<p class="card-text">Price per night: ₹${hotel.price_per_night !== undefined ? hotel.price_per_night : 'Not available'}</p>
<p class="card-text"><strong>
  <span title="Discount: ${hotel.discount ? hotel.discount + '% off' : 'No discount available'}">
    Discount Price: ₹${hotel.discount 
      ? hotel.price_per_night - (hotel.price_per_night * (hotel.discount / 100)) 
      : hotel.price_per_night} 
    <small>per night</small>
  </span></strong>
</p>


            <p>Rating: ${hotel.rating} stars</p>

            <button class="btn btn-primary">Book Now</button>
          </div>
        </div>
      `;

      hotelList.appendChild(hotelCard);
    }
  });

  // Add event listener to filter hotels when amenities are selected
  document.querySelectorAll('.form-check-input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      filterHotelsByAmenities(hotels);
    });
  });
}
