# pendo-keyboard-hide-issue

## Overview

This repo is a reproduction sample app for an issue with the Pendo Web SDK and Capacitor/Ionic Framework.

The sample app uses the following libraries at these approximate versions:
- Capacitor - `3.5.0`
- Angular - `13.2.2`
- Ionic Angular - `6.0.0`

Capacitor Android has not been added to the project since we're only seeing the issue on iOS.

The app uses the Ionic Angular "blank" starter app.

The source files of most interest will probably be:
- `/src/app/pendo.service.ts`
  - This file has the Pendo Web SDK-related code.
  - There is additional code in the file that is commented-out because it is *not* required to reproduce the issue.
- `/src/app/app.component.ts`
  - This file initializes `PendoService`.
  - It can optionally configure the Capacitor Keyboard plugin to show the keyboard accessory bar. However, it's commented-out by default because it is *not* required to reproduce the issue.

Search the repo for the string `sample-awareness` to find code you might want to modify. Don't worry--the [Steps to Reproduce](#steps-to-reproduce) section will walk you through what is necessary to modify in order to reproduce the issue.

## Setup
- You will very likely need to use a Mac.
- Set up your dev environment for Capacitor development by following the official docs [here](https://capacitorjs.com/docs/getting-started/environment-setup).
- From the terminal in the root of the repo, run the following commands
  - `npm install`
  - `npm run cap.prep`

## Running the App

You can use either Capacitor's Live Reload feature or manually build the app (front-end and native) and deploy the native app again. Changes to the native layer will require a subsequent native app build and deployment.

### Live Reload
- Reference: https://capacitorjs.com/docs/guides/live-reload
- Works like an `ionic serve` in which the WebView is reloaded after updating TypeScript, HTML, CSS, etc. It prompts for the device/emulator you'd like to deploy to, runs a `cap sync`, starts an `ionic serve`, builds the native app, and deploys the native app to the device/emulator.

- Run the command
  - `cap.run.ios` or `cap.run.android`
    - This command is comprised of
      - `npx ionic cap run <platform> --livereload --external`
        - Using the `--external` option
          - Uses a server URL for the WebView that is _not_ `localhost` but rather loads `ionic serve` content remotely from your desktop computer using the computer's IP address.
          - Allows JavaScript source mapping to work when debugging the Android WebView.
          - Required for device use but not necessarily for emulators which can successfully load content from the desktop computer using `localhost`. However, without providing this option you will not get JavaScript source mapping when debugging the Android WebView on an emulator.
          - Allows for livereloads to occur without a USB connection.
          - Some privileged Web APIs (for example, Geolocation) that only work when using SSL or `localhost` may not work with the app hosted at an IP address. Self-signed certificates [do not appear](https://github.com/ionic-team/capacitor/issues/3707#issuecomment-712997461) to be an option.
- Your computer and device _must_ be on the same WiFi network. VPNs could potentially cause problems.
  - There may be multiple network interfaces detected so at the prompt choose the one which is your local IP address. See [here](https://capacitorjs.com/docs/guides/live-reload#using-with-framework-clis) for help finding your IP.
- Devices may need to be connected via USB for the native build deployment but can thereafter get livereload updates of the front-end build without needing a wired connection.
  - The device will continue to get livereload updates even after restarting the dev server when using a previous native deployment so long as you continue serving on the same IP. This means that you can have an Android and iOS device both running the same build and get the same updates although they must have been built in succession with a closing of the command before moving onto the other.
- When the deployment is finished, `capacitor.config.json`, `AndroidManifest.xml`, and `AndroidManifest.xml.orig` may appear as pending changes in source control. They contain temporary configuration changes necessary to facilitate livereload. They should be automatically removed from pending changes upon `Ctrl + C` of the process but manual removal may occasionally be necessary if the clean-up step fails.

### Manual Build and Deploy
- To build the front-end and copy the files to the native app, run
  - `npm run cap.build`
- Open the native IDE (if it's not already open) with
  - `npx cap open ios` or `npx cap open android`
- Use the native IDE to build and deploy the native app.


## Steps to Reproduce

- Open `/src/app/pendo.service.ts`. There are a couple of tweaks you'll want to make. You can find these areas by searching for the string `sample-awareness` in the file.
  - Specify the Pendo snippet API key you'd like to use.
  - For the Pendo Web SDK `opts` (`visitor`, `id`, etc.), specify the values you'd like to use.
- Get the app running by following [Running the App](#running-the-app).
- Once the app is running, make sure the Pendo guide with the text area is showing.
- Put focus in the text area so that the virtual keyboard shows.
- You should observe that the keyboard shows and then hides immediately.
- You can [use Safari's dev tools on macOS](https://ionicframework.com/docs/developing/ios#using-safari-web-inspector) to connect to the app remotely and debug.

## The @capacitor/keyboard Plugin

- Removing the `@capacitor/keyboard` plugin will make the issue "go away" but will be a notable behavior change to the app. To try this, do the following:
  - In `package.json`, remove the `@capacitor/keyboard` plugin
  - Run `npm install`
  - Run `npx cap sync`
  - Use the method you're using to build and deploy the front-end code and the native code (live reload or manual build and deploy).
  - Try to reproduce the issue. The keyboard will no longer immediately show and then hide.
- While this results in the keyboard no longer immediately hiding upon open, [Ionic recommends](https://capacitorjs.com/docs/getting-started/with-ionic#existing-ionic-project) using the Keyboard plugin with Ionic Framework + Capacitor. We also utilize the plugin to do more advanced things in our app, so we definitely want to keep it.
- The Keyboard plugin resizes/"squishes"/"stretches" the web content viewport when it shows/hides. The web content being resized is likely core to the issue with the Pendo SDK.
- The Keyboard plugin can be configured to use an alternative [resize method](https://capacitorjs.com/docs/apis/keyboard#keyboardresize) which can also make the issue "go away", but we like the default Capacitor behavior where the web content is resized when the keyboard shows/hides.
