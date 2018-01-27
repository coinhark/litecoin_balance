import React, { Component } from 'react';
import { Text, View, StyleSheet, Alert, Keyboard } from 'react-native';
import { NavigationActions } from 'react-navigation';
import StatelessNavigation from '../utils/navigation';
import Camera from 'react-native-camera';
import GlobalConstants from '../globals';

export default class BarcodeScanner extends Component {
    constructor(props) {
        super(props);
        this.state = {data: ''};
        this.count = 0;
    }

    static navigationOptions = {
        title: GlobalConstants.getAppName(),
        gesturesEnabled: false
    };

    async componentWillMount() {
        Keyboard.dismiss();
    }

    render() {
        return (
            <View style={styles.container}>
                <Camera
                    playSoundOnCapture={true}
                    barCodeTypes={[Camera.constants.BarCodeType.qr]}
                    onBarCodeRead={this._onBarCodeRead} style={styles.camera}>
                    <View style={styles.rectangleContainer}>
                        <View style={styles.rectangle}/>
                    </View>
                </Camera>
            </View>
        );
    }

    _onBarCodeRead = ({type, data}) => {
        let scan = data;
        this.count += 1;
        if (this.count === 1) {
            if(data.indexOf(':') !== -1) {
                let tokens = data.split(':');
                scan = tokens[1];
            }
            this.setState({data: scan});
            StatelessNavigation.navigateWithProps(this.props.navigation, 'AddAddress', { scanned: scan });
            console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
        } else {
            console.log('Scan failed to duplicate scan');
        }
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },

    camera: {
        height: 300,
        width: 300,
        alignItems: 'center',
    },

    rectangleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },

    rectangle: {
        height: 300,
        width: 300,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent',
    },
});
