import React, { Component } from 'react';
import { Text, View, StyleSheet, Alert, Keyboard } from 'react-native';
import { NavigationActions } from 'react-navigation'
import StatelessNavigation from '../utils/navigation'
import GlobalConstants from '../globals';

export default class BarcodeScanner extends Component {
    constructor(props) {
        super(props);
        this.state = { data: '' };
    }

    static navigationOptions = {
        title: GlobalConstants.getAppName() + " Balance",
        gesturesEnabled: false
    };

    state = {
        hasCameraPermission: null
    };

    async componentWillMount() {
        Keyboard.dismiss();
        //const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasCameraPermission: status === 'granted'});
    }

    render() {
        const { hasCameraPermission } = this.state;

        if (hasCameraPermission === null) {
            return <Text>Requesting for camera permission</Text>;
        } else if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        } else {
            return (
                <View style={styles.container}>
                    <View style={{width: 300, height: 300, borderColor: '#FFFFFF', borderWidth: 1}}>

                    </View>
                </View>
            );
        }
    }

    _handleBarCodeRead = ({ type, data }) => {
        let scan = data;
        if (data !== '') {
            this.setState({read: data})
        }
        if (data === '' || this.state.read === data) {
            console.log('Scan failure due to duplicate scan');
        } else {
            if(data.indexOf(':') !== -1) {
                let tokens = data.split(':');
                scan = tokens[1];
            }
            this.setState({data: scan});
            StatelessNavigation.navigateWithProps(this.props.navigation, 'AddAddress', { scanned: scan });
            console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
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
});