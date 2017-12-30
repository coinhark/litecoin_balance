import React from 'react';
import { StyleSheet, Text, View, Image, Clipboard, Platform, StatusBar } from 'react-native';
import BarcodeScanner from './components/barcodeScanner.js';
import AddAddress from './components/addAddress.js';
import ManageAddresses from './components/manageAddresses.js';
import WelcomeScreen from './components/welcomeScreen.js';
import { StackNavigator } from 'react-navigation';
import { FormLabel, FormInput, Button, Card } from 'react-native-elements'

export const Coinhark = StackNavigator({
    Home: { screen: WelcomeScreen },
    AddAddress: { screen: AddAddress },
    Scanner: { screen: BarcodeScanner },
    ManageAddresses: { screen: ManageAddresses }
});

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Coinhark />;
    }
}