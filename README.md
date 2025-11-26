# Field Reporter App – Offline-First Reporting System

This is a **React Native** project built for field reporters who often work in areas with poor or no internet connectivity.  
Users can create reports, attach media, and keep using the app fully **offline**.  
All data automatically syncs to Firebase once an internet connection becomes available.  
The app also supports **Light & Dark mode** and **English + Urdu languages**.

---

## Features

- **User Authentication**: Secure login with offline session persistence.
- **Offline Report Management**: Create, edit, delete, and view reports without internet.
- **Sync Queue System**: Offline actions are auto-queued and synced when the network is restored.
- **Camera Integration**: Capture photos & videos using `react-native-imagePicker` and `video`.
- **Local Media Storage**: Save media offline using `react-native-fs`.
- **Report Map View**: View all reports as markers on a map (coming soon).
- **Optimized Report List**: Smooth scrolling with FlashList.
- **Gestures & Animations**: Swipe actions + animations using Reanimated v3.
- **Multi-Language Support**: English + Urdu language switching.
- **Themes**: Fully supports Light & Dark mode.

---

## Tech Stack

1. **Frontend**: React Native, JavaScript  
2. **Backend / Database**: Firebase (Auth, Firestore, Storage)  
3. **State Management**: Redux Toolkit  
4. **Navigation**: React Navigation v6  
5. **Offline Storage**: react-native-fs + local DB architecture  
6. **Camera**: react-native-imagePicker & video 
7. **Location**: react-native-geolocation-service  
8. **Permissions**: react-native-permissions  
9. **Lists & UI**: FlashList, Reanimated v3, Gesture Handler  
10. **Network Detection**: @react-native-community/netinfo


This is a new React Native project, bootstrapped using @react-native-community/cli.

Getting Started
Note: Make sure you have completed the Set Up Your Environment guide before proceeding.

Step 1: Start Metro
First, you will need to run Metro, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

# Using npm
npm start

# OR using Yarn
yarn start
Step 2: Build and run your app
With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

Android
# Using npm
npm run android

# OR using Yarn
yarn android
iOS
For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

bundle install
Then, and every time you update your native dependencies, run:

bundle exec pod install
For more information, please visit CocoaPods Getting Started guide.

# Using npm
npm run ios

# OR using Yarn
yarn ios
If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

Step 3: Modify your app
Now that you have successfully run the app, let's make changes!

Open App.tsx in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by Fast Refresh.

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

Android: Press the R key twice or select "Reload" from the Dev Menu, accessed via Ctrl + M (Windows/Linux) or Cmd ⌘ + M (macOS).
iOS: Press R in iOS Simulator.
Congratulations! 🎉
You've successfully run and modified your React Native App. 🥳

Now what?
If you want to add this new React Native code to an existing application, check out the Integration guide.
If you're curious to learn more about React Native, check out the docs.
Troubleshooting
If you're having issues getting the above steps to work, see the Troubleshooting page.

Learn More
To learn more about React Native, take a look at the following resources:

React Native Website - learn more about React Native.
Getting Started - an overview of React Native and how setup your environment.
Learn the Basics - a guided tour of the React Native basics.
Blog - read the latest official React Native Blog posts.
@facebook/react-native - the Open Source; GitHub repository for React Native.
