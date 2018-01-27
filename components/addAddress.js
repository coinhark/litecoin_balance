import React, { Component } from 'react';
import { Text, TextInput, View, StyleSheet, Alert, AsyncStorage } from 'react-native';
import { FormLabel, FormInput, FormValidationMessage, Button, Card } from 'react-native-elements'
import GlobalConstants from '../globals';
import renderIf from '../utils/renderIf.js';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

require('../shim');

export default class AddAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            address: '',
            ltcPrice: '',
            db: {
                "balanceInfo": {
                    "name": "Coinhark API",
                    "date": "1318464000",
                    "totalBalance": "0.00000000",
                    "addresses": []
                },
                "exchange": {
                    "price": 0.00,
                    "date": "1318464000",
                    "name": "CoinMarketCap API"
                }
            },
            text: 'useless',
            nameDirty: false,
            addressDirty: false,
            invalidAddress: false,
            addressExists: false
        };
        this.globals = new GlobalConstants();
    }

    componentWillMount() {
        AsyncStorage.getItem("db").then((value) => {
            this.setState({"db": JSON.parse(value)});
        }).done();

        if (this.props.navigation.state != null && this.props.navigation.state.params != null) {
            this.setState({"address": this.props.navigation.state.params.scanned});
            console.log("Setting address state from params.scanned: " + this.props.navigation.state.params.scanned);
        }
    }

    static navigationOptions = ({navigate, navigation}) => ({
        title: GlobalConstants.getAppName(),
        gesturesEnabled: false,
        headerLeft: <Icon name="keyboard-backspace" style={styles.leftButton} onPress={() => {
            navigation.navigate('ManageAddresses');
        }}/>,
        headerRight: <Icon name="qrcode" style={styles.rightButton} onPress={() => {
            navigation.navigate('Scanner');
        }}/>,
    })

    _checkDisabled = () => {
        return disabled = this.state.address === '' || this.state.name === '';
    }

    _submitAddress = () => {
        let address = {
            "address": this.state.address,
            "inputAddress": this.state.address,
            "name": this.state.name
        }
        if (this.state.db.balanceInfo.addresses.find(o => o.address === this.state.address)) {
            this.setState({addressExists: true});
        } else {
            this.globals.validateAddress(address, this);
        }
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <Card title="Add Public Address">
                <FormLabel>Address</FormLabel>
                <FormInput
                    autoCorrect={false}
                    inputStyle={{ fontSize: 14 }}
                    onBlur={() => this.setState({addressDirty: true})}
                    onChangeText={(address) => this.setState({address})}
                    value={this.state.address}/>
                {renderIf(this.state.address === '' && this.state.addressDirty, <FormValidationMessage style>
                    {'This field is required'}
                </FormValidationMessage>)}
                {renderIf(this.state.invalidAddress && this.state.address !== '', <FormValidationMessage style>
                    {'Invalid ' + this.globals.getCoinName() + ' Address'}
                </FormValidationMessage>)}
                {renderIf(this.state.addressExists && this.state.address !== '', <FormValidationMessage style>
                    {'This address already exists'}
                </FormValidationMessage>)}
                <FormLabel>Name</FormLabel>
                <FormInput
                    autoCorrect={false}
                    inputStyle={{ fontSize: 14 }}
                    onBlur={() => this.setState({nameDirty: true})}
                    onChangeText={(name) => this.setState({name})}
                    value={this.state.name}/>
                {renderIf(this.state.name === '' && this.state.nameDirty, <FormValidationMessage style>
                    {'This field is required'}
                </FormValidationMessage>)}
                <Button
                    disabled={this._checkDisabled()}
                    containerViewStyle={styles.buttonStyle}
                    onPress={this._submitAddress}
                    raised
                    backgroundColor={'#2196f3'}
                    title='Submit Address'
                />
            </Card>
        );
    }
}

const styles = {
    buttonStyle: {
        marginTop: 30,
    },
    rightButton: {
        marginRight: 16,
        fontSize: 26,
        color: '#555555',
    },
    leftButton: {
        marginLeft: 16,
        fontSize: 26,
        color: '#555555',
    },
}
