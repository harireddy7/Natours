// mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaGFyaXJlZGR5NyIsImEiOiJja3U1bHlwdm8xd3ozMnVxZzAwNnp0NGk2In0.kNfWEkTwzfHM0aXRHClPIw';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 10,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create Marker
    const element = document.createElement('div');
    element.className = 'marker';

    // Add Marker
    new mapboxgl.Marker({
      element,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include tour location
    bounds.extend(loc.coordinates);
  });

  // fit markers inside the given coordinates
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

// let locations = [];
// document.addEventListener('DOMContentLoaded', () => {
//   const el = document.getElementById('map');
//   if (el) {
//     locations = JSON.parse(el.dataset.locations);
//   }
// });
