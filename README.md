# Demo of Service Worker with Workbox

This is a simple demo of a Service Worker caching HTML, JS, CSS and JSON data fetched from a remote server, using Workbox.

## Table of content

<!-- MarkdownTOC levels="2,3" autolink="true" -->

- [Required packages](#required-packages)
  - [Files architecture of this demo](#files-architecture-of-this-demo)
- [Use a local server](#use-a-local-server)
  - [Start the server](#start-the-server)
  - [Start your browser](#start-your-browser)
  - [Notice about browser policy on registering Service Worker](#notice-about-browser-policy-on-registering-service-worker)
- [How to register a Service Worker with Workbox ?](#how-to-register-a-service-worker-with-workbox-)
  - [Install workbox-precaching](#install-workbox-precaching)
  - [Create a typescript file](#create-a-typescript-file)
  - [Create a command to convert typescript into javascript](#create-a-command-to-convert-typescript-into-javascript)
  - [Run the command to do the conversion](#run-the-command-to-do-the-conversion)
  - [Now, use `workbox wizard` to create a manifest](#now-use-workbox-wizard-to-create-a-manifest)
  - [Then, create your Service Worker with `workbox injectManifest`](#then-create-your-service-worker-with-workbox-injectmanifest)
  - [Finally, you need to tell the browser to use your Service Worker.](#finally-you-need-to-tell-the-browser-to-use-your-service-worker)
  - [Reload your browser and check the Web Inspector.](#reload-your-browser-and-check-the-web-inspector)
- [How to cache data fetched from remote server ?](#how-to-cache-data-fetched-from-remote-server-)
  - [Register the domain of your remote server.](#register-the-domain-of-your-remote-server)
  - [Do not forget to update your Service Worker by running the `build` command.](#do-not-forget-to-update-your-service-worker-by-running-the-build-command)
- [Annex](#annex)
- [End](#end)

<!-- /MarkdownTOC -->


## Required packages

Required global packages

    $ npm list -g

    ├── esbuild@0.18.2
    ├── http-server@14.1.1
    └── workbox-cli@7.0.0

Required development packages

    $ npm list

    ├── workbox-precaching@7.0.0
    ├── workbox-routing@7.0.0
    └── workbox-strategies@7.0.0

### Files architecture of this demo

    $ tree /home/webstorm/dinsekos/demo-service-worker-workbox/

    ├── 404.html
    ├── css
    │   └── app.css
    ├── index.html          (Display data fetch from remote server)
    ├── js
    │   └── app.js          (Load JSON data from remote server, and register Service Worker)
    ├── node_modules
    │   ├── @esbuild
    │   ├── workbox-core
    │   ├── workbox-precaching
    │   ├── workbox-routing
    │   └── workbox-strategies
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── sw.js               (Service Worker)
    ├── sw-source.js        (Service Worker Source - SWS)
    ├── sw-source.ts        (Service Worker Typescript Source - SWTS)
    └── workbox-config.js

## Use a local server

Add a command to your `package.json` to start the local server.

``` json
"serve": "http-server -p 8080 -c-1"
```

Notice we use the port 8080.

See the `serve` property in your `package.json` file.

    $ vi package.json

``` json
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
```

### Start the server

    $ npm run serve

### Start your browser

Load in your browser the address http://localhost:8080

At this point, you should see in the browser inspector, all network requests (html, js, css, and json from remote server)
But, none of them are cached.

### Notice about browser policy on registering Service Worker

Depending on whether you're using HTTP or HTTPS, you may encouter troubles when registering a Service Worker.

| Case | Host                      | Register Service Worker is allowed?  |
|------|---------------------------|--------------------------------------|
| 1    | Localhost address         | Yes.                                 |
| 2    | Remote address with HTTPS | Yes.                                 |
| 3    | Remote address with HTTP  | No, forbidden by the browser policy. |

#### How to work around this issue ?

When coding this demo, we used a Virtual Machine using an HTTP address. Because the virtual machine is considered as a remote server, we were in the case 3: register a Service Worker is forbidden.

Example of VM address: http://10.211.55.4:8080

Therefore, we launch the browser using the following command line to allow our virtual machine address.

Example with Google Chrome on macOS:

We use a dedicated parameter named `--unsafely-treat-insecure-origin-as-secure` to achieve this goal.

    $ /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --unsafely-treat-insecure-origin-as-secure=http://10.211.55.4:8080

## How to register a Service Worker with Workbox ?

### Install workbox-precaching

    $ npm i workbox-precaching --save-dev

### Create a typescript file

    $ vi sw-source.ts

``` js
import {precacheAndRoute} from 'workbox-precaching';
declare const self: ServiceWorkerGlobalScope;
precacheAndRoute(self.__WB_MANIFEST);
```

### Create a command to convert typescript into javascript

Edit your `package.json` file.

Add a `build` command to do the conversion.

``` json
"build": "esbuild --outfile=sw-source.js --bundle sw-source.ts",
```


Use `esbuild` to do the conversion.

    $ vi package.json
``` json
...
"scripts": {
    "build": "esbuild --outfile=sw-source.js --bundle sw-source.ts",
    "serve": "http-server -p 8080 -c-1"
},
...
```

Here, you tell `esbuild` to convert `sw-source.ts` (the bundle) into `sw-source.js` (the outfile).

### Run the command to do the conversion

    $ npm run build

    > demo-service-worker-workbox@1.0.0 build
    > esbuild --outfile=sw-source.js --bundle sw-source.ts

      sw-source.js  81.8kb

    ⚡ Done in 14ms

At this point, a new `sw-source.js` file was created.
You should never edit this file.
If you need to do a change, edit the typescript source file `sw-source.ts` then run the `build` command.

### Now, use `workbox wizard` to create a manifest

Run the following command and answer the questions.

    $ workbox wizard --injectManifest

Make sure to tell the wizard to use `sw-source.js` when it asks:
- *Where's your existing service worker file?* `sw-source.js`

You can leave the default answers for the following questions:
- *Where would you like your service worker file to be saved?* `sw.js`
- *Where would you like to save these configuration options?* `workbox-config.js`

See the output of the command bellow (read the answers).

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

The wizard creates the manifest file that `workbox` will use to identify the Service Worker Source file (SWS) it will need to convert into the Service Worker file (SW) .
Here, it converts `sw-source.js` into `sw.js`.

The `sw.js` will be later registered in the browser as the Service Worker (see `js/app.js`).

    $ vi workbox-config.js

``` js
module.exports = {
    globDirectory: '.',
    globPatterns: [
        '**/*.{css,html,js}'
    ],
    swDest: 'sw.js',
    swSrc: 'sw-source.js'
};
```

Notice the 2 properties `swSrc` and `swDest`.

### Then, create your Service Worker with `workbox injectManifest`

    $ workbox injectManifest workbox-config.js

    Using configuration from /home/webstorm/dinsekos/demo-service-worker-workbox/workbox-config.js.
    The service worker file was written to sw.js
    The service worker will precache 11 URLs, totaling 186 kB.

This command creates the `sw.js` file.
***
As a quick shortcut, you now update your `build` command to generate the `sw.js` file each time you edit the `sw-source.ts` typescript file.

``` json
"build": "esbuild --outfile=sw-source.js --bundle sw-source.ts && workbox injectManifest workbox-config.js",
```

Edit your `package.json` file.

    $ vi package.json

``` js
...
"scripts": {
    "build": "esbuild --outfile=sw-source.js --bundle sw-source.ts && workbox injectManifest workbox-config.js",
    "serve": "http-server -p 8080 -c-1"
  },
...
```

Now, each time your run `build` command, the following conversions are done:
* `sw-source.ts` => `sw-source.js` (typescript to javascript)
* `sw-source.js` => `sw.js` (Service Worker Source to SW)
***

    $ npm run build

    > demo-service-worker-workbox@1.0.0 build
    > esbuild --outfile=sw-source.js --bundle sw-source.ts && workbox injectManifest workbox-config.js
      sw-source.js  81.8kb
    ⚡ Done in 11ms
    Using configuration from /home/webstorm/dinsekos/demo-service-worker-workbox/workbox-config.js.
    The service worker file was written to sw.js
    The service worker will precache 11 URLs, totaling 186 kB.


### Finally, you need to tell the browser to use your Service Worker.
Open you main `js/app.js` file and add the following instructions at the end of file:

    $ vi js/app.js

``` js
...
...

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
```

In a production environement you can get rid of the `console.log()` messages.


### Reload your browser and check the Web Inspector.
You should see your SW in the Application tab.
Also, you should see your html, css, and js files cached into the Storage Cache.
Go offline and reload the page.
Your html, css, and js files are now loaded from cache, but notice that the JSON data from remote server are not cached !

## How to cache data fetched from remote server ?

To cache the data fetched from the remote server, you need to do more work ...

You will need those npm packages:

    $ npm i workbox-routing --save-dev
    $ npm i workbox-strategies --save-dev

### Register the domain of your remote server.

Edit your `sw-source.ts` file.

In the instructions bellow, you register a route identified by its domain `https://api.publicapis.org`, and you tell your browser to cache its responses into a cache named `api-responses`.

Notice you use here the `NetworkFirst` strategy.

    $ vi sw-source.ts

``` js
import {precacheAndRoute} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';
import {NetworkFirst} from 'workbox-strategies';
declare const self: ServiceWorkerGlobalScope;
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(
    ({url}) => url.origin === 'https://api.publicapis.org',
    new NetworkFirst({cacheName: 'api-responses'})
);
```

### Do not forget to update your Service Worker by running the `build` command.

    $ npm run build

Close and restart browser.
You should see a new cache named `api-responses` into the Storage Cache of the Web Inspector (Application tab).
If you go offline, data from your remote server are available by reading the cache.


## Annex

Documentation Sources

* https://developer.chrome.com/docs/workbox/precaching-with-workbox/
* https://developer.chrome.com/docs/workbox/the-ways-of-workbox/
* https://developer.chrome.com/docs/workbox/handling-service-worker-updates/

## End