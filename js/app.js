function createNode(type) {
  return document.createElement(type);
}

function appendChild(child, parent) {
  return parent.appendChild(child);
}

let list = document.getElementById('list');

fetch('https://api.publicapis.org/entries')
  .then(response => response.json())
  .then(data => {
    let publicApis = data;
    return publicApis.entries.map(function (entry) {
      let item = createNode('li'),
        category = createNode('div'),
        description = createNode('h3'),
        link = createNode('a');

      category.innerHTML = entry.Category;
      description.innerHTML = entry.Description;
      link.innerHTML = entry.Link;
      link.href = entry.Link;

      appendChild(description, item);
      appendChild(category, item);
      appendChild(link, item);
      appendChild(link, item);
      appendChild(item, list);
    });
  });

/**
 * Register Service Worker
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(register => {
        console.log('Service Worker is registered')
      })
      .catch(err => {
        console.log('Failed to register Service Worker')
        console.log(err)
      })
  })
} else {
  console.log('Your browser does not support service worker OR the URL is using HTTP instead of HTTPS.');
  console.log('For development, you can run Google Chrome browser with command line.')
  console.log('Example on macOs: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome -unsafely-treat-insecure-origin-as-secure=http://your_domain_or_ip_address:your_port_number')
}