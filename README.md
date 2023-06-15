howto.pwa.workbox.txt

# Demo of Service Worker with Workbox

## Required packages
### Required global packages

    ├── esbuild@0.18.2
    ├── http-server@14.1.1
    └── workbox-cli@7.0.0

### Required development packages

    ├── workbox-precaching@7.0.0
    ├── workbox-routing@7.0.0
    └── workbox-strategies@7.0.0

### Files architecture of this demo

    ├── 404.html
    ├── css
    │   └── app.css
    ├── index.html      (Display data fetch from distant server)
    ├── js
    │   └── app.js      (Load json data from distant server, and register Service Worker)
    ├── node_modules
    │   ├── @esbuild
    │   ├── workbox-core
    │   ├── workbox-precaching
    │   ├── workbox-routing
    │   └── workbox-strategies
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── sw.js
    ├── sw-source.js
    ├── sw-source.ts
    └── workbox-config.js

## Use a local server 

Add a command to your `package.json` to start the local server.

See the `serve` property in your `package.json` file.

    $ vi package.json

        {
          "name": "demo-service-worker-workbox",
          "version": "1.0.0",
          "description": "",
          "main": "index.js",
          "scripts": {
            "serve": "http-server -p 8080 -c-1"
          },
          "keywords": [],
          "author": "",
          "license": "ISC",
          "devDependencies": {
            "workbox-precaching": "^7.0.0"
          }
        }

### Start the server

    $ npm run serve

### Start your browser

Our demo is available on a virtual machine at the address: http://10.211.55.4:8080

Because we do not use http://localhost, browser does not allow to register a Service Worker.
Therefore, we launch the browser using command line to allow our address.

@see `--unsafely-treat-insecure-origin-as-secure`

    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --unsafely-treat-insecure-origin-as-secure=http://10.211.55.4:8080

At this point, you should see in the browser inspector, all network request (html, js, css, and json from distant server)
But, none of them are cached.

## Now we will register a Service Worker.
Install workbox-precaching

    $ npm i workbox-precaching --save-dev

### Create a typescript file.

    $ vi sw-source.ts

        import {precacheAndRoute} from 'workbox-precaching';
        declare const self: ServiceWorkerGlobalScope;
        precacheAndRoute(self.__WB_MANIFEST);


### Convert the typescript file into a javascript file

Edit your package.json file.
Add a 'build' command to do the conversion 
We uses 'esbuild' to do the conversion.

    vi package.json

        ...
        "scripts": {
            "build": "esbuild --outfile=sw-source.js --bundle sw-source.ts",
            "serve": "http-server -p 8080 -c-1"
        },
        ...

### Run the command to do the conversion

    npm run build

        > demo-service-worker-workbox@1.0.0 build
        > esbuild --outfile=sw-source.js --bundle sw-source.ts
          sw-source.js  81.8kb
        ⚡ Done in 14ms

At this point, a new `sw-source.js` file was created.
You should never edit this file.
If you need to do a change, edit the typescript source file `sw-source.ts` then run `build` command.

### Now, use the workbox wizard to create a manifest

The the `sw-source.js` file will be converted into a `sw.js` file. 
To do so, you use the `workbox wizard` command line. 
Run the floowing command, and answer the questions.

    workbox wizard --injectManifest

Make sure to tell the wizard to use `sw-source.js` when it asks *Where's your existing service worker file?*

See answer bellow.

    OUTPUT

        ? What is the root of your web app (i.e. which directory do you deploy)? Manually enter path
        ? Please enter the path to the root of your web app: .
        ? Which file types would you like to precache? css, html, js
        ? Where's your existing service worker file? To be used with injectManifest, it should include a call to 'self.__WB_MANIFEST' sw-source.js
        ? Where would you like your service worker file to be saved? sw.js
        ? Where would you like to save these configuration options? workbox-config.js
        To build your service worker, run

          workbox injectManifest workbox-config.js

        as part of a build process. See https://goo.gl/fdTQBf for details.
        You can further customize your service worker by making changes to workbox-config.js. See https://goo.gl/8bs14N for details.

The wizard creates the the configuration file that workbox will use to convert your `sw-source.js` file (the source file) into the `sw.js` file (file loaded by the browser)

    vi workbox-config.js

        module.exports = {
            globDirectory: '.',
            globPatterns: [
                '**/*.{css,html,js}'
            ],
            swDest: 'sw.js',
            swSrc: 'sw-source.js'
        };

Notice the 2 properties `swSrc` and `swDest`.

### Then, to create your Service Worker, run this command.

    workbox injectManifest workbox-config.js

    OUPTUT

        Using configuration from /home/webstorm/dinsekos/demo-service-worker-workbox/workbox-config.js.
        The service worker file was written to sw.js
        The service worker will precache 11 URLs, totaling 186 kB.

This command create the sw.js file.
***
As a quick shortcut, we now update our build command to generate the sw.js file each time we edit the sw-source.ts typescript file.

    vi package.json

    ...
    "scripts": {
        "build": "esbuild --outfile=sw-source.js --bundle sw-source.ts && workbox injectManifest workbox-config.js",
        "serve": "http-server -p 8080 -c-1"
      },
    ...

Now, each time your run "build" command, the following conversion are done:
* `sw-source.ts` => `sw-source.js` (typescript to javascript)
* `sw-source.js` => `sw.js` (SW source to SW build)
***

    npm run build

    OUTPUT

        > demo-service-worker-workbox@1.0.0 build
        > esbuild --outfile=sw-source.js --bundle sw-source.ts && workbox injectManifest workbox-config.js
          sw-source.js  81.8kb
        ⚡ Done in 11ms
        Using configuration from /home/webstorm/dinsekos/demo-service-worker-workbox/workbox-config.js.
        The service worker file was written to sw.js
        The service worker will precache 11 URLs, totaling 186 kB.


### Finally, you need to tell the browser to use your Service Worker.
Open you main `js/app.js` file and add following instructions:

    vi js/app.js

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

In a production environnement you can get ride of the console.log() messages.


### Now, reload you browser and check the Web Inspector.
You should see your SW in the Application tab.
Also, you should see your html, css, and js files cached into the Storage Cache.
Go offline and reload the page.
Your html, css, and js files are now loaded from cache, except the data from distant server.

### To cache the data fetched from distant server, you need to do more work ...

You will need those npm packages:

    npm i workbox-routing --save-dev
    npm i workbox-strategies --save-dev

### Edit your sw-source.ts file
Declare the domain of your API distant server.
Here, we create a cache named `api-responses` which cache response from the domain `https://api.publicapis.org`

    vi sw-source.ts

        import {precacheAndRoute} from 'workbox-precaching';
        import {registerRoute} from 'workbox-routing';
        import {NetworkFirst} from 'workbox-strategies';
        declare const self: ServiceWorkerGlobalScope;
        precacheAndRoute(self.__WB_MANIFEST);
        registerRoute(
            ({url}) => url.origin === 'https://api.publicapis.org',
            new NetworkFirst({cacheName: 'api-responses'})
        );

Do not forget to update your Service Worker by running the "build" command.

    npm run build

Close and restart browser.
You should see a new cache named `api-responses` into the Storage Cache of the Web Inspector (Application tab).
If you go offline, data from your distant server are available by reading the cache.

# End