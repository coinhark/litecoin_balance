import React, { Component } from 'react';
import { RefreshControl, Clipboard, Text, View, ScrollView, StyleSheet, Alert, AsyncStorage, ActivityIndicator, Keyboard } from 'react-native';
import { FormLabel, FormInput, Button, Card } from 'react-native-elements'
import GlobalConstants from '../globals';
import renderIf from '../utils/renderIf.js';
import Swipeout from 'react-native-swipeout';
import Numbers from '../utils/numbers';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class ManageAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addressBalance: '',
            valueInDollars: '',
            loading: true,
            refreshing: false,
            apiError: null,
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
            }
        }
        this.wallets = [];
        this.globals = new GlobalConstants();
    }

    componentDidMount() {
        Keyboard.dismiss();
        this.initView();
    }

    static navigationOptions = ({ navigate, navigation }) => ({
        title: GlobalConstants.getAppName(),
        gesturesEnabled: false,
        headerLeft: <Icon name="home" style={styles.leftButton} onPress={() =>{ navigation.navigate('Home'); }} />,
        headerRight: <Icon name="add" style={styles.rightButton} onPress={() =>{ navigation.navigate('AddAddress')}}/>
    })

    initView = () => {
        this.setState({loaded: false});
        AsyncStorage.getItem("db").then((value) => {
            this.setState({"db": JSON.parse(value)});
            console.log("db state is now: " + value);
            let tmpDb = this.state.db;
            fetch(this.globals.getMarketApi().url)
                .then(response => response.json())
                .then(responseJson => {
                    tmpDb.exchange.price = responseJson[0].price_usd;
            })
            Promise.all(this.state.db.balanceInfo.addresses.map(o =>
                fetch(this.globals.getBlockchainApi().url + o.inputAddress).then(resp => resp.json())
            )).then(json => {
                    if(!Array.isArray(json) || json[0].balance == null) {
                        console.log(`Unexpected result from ${this.globals.getBlockchainApi().name} API.`);
                        this.setState({ apiError: `Unexpected result from ${this.globals.getBlockchainApi().name} API.`});
                    }
                json.forEach((element, index) => {
                    const path = tmpDb.balanceInfo.addresses[index];
                    path.totalBalance = Numbers.formatBalance(element.balance, 'US');
                    path.valueInDollars = Numbers.formatPrice(tmpDb.exchange.price * element.balance, 'US');
                })
                this.setState({ db: tmpDb});
                AsyncStorage.setItem("db", JSON.stringify(tmpDb));
                console.log("db state is now: " + JSON.stringify(this.state.db));
            }).catch(error => {
                this.setState({ apiError: `Error connecting to the ${this.globals.getBlockchainApi().name} API.`});
                console.log(`Error connecting to the ${this.globals.getBlockchainApi().name} API.`);
            });
            this.setState({loading: false, refreshing: false});
        }).done()
    }

    refreshState = () => {
        this.setState({ loading: true });
        this.initView();
    }

    copyToClipboard = async (address) => {
        Clipboard.setString(address);
        alert(address + ' copied to clipboard.');
    }

    deleteAddress = (address) => {
        let copy = this.state.db;
        let lotto = copy.balanceInfo.addresses.filter(wallet => {
            return wallet.address !== address;
        });
        copy.balanceInfo.addresses = lotto;
        this.setState({db: copy})
        AsyncStorage.setItem("db", JSON.stringify(this.state.db));
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <ScrollView horizontal={false}
                        refreshControl={
                            <RefreshControl
                                enabled={true}
                                refreshing={this.state.refreshing}
                                onRefresh={() => this.initView()}
                            />
                        }>
                <Card>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                    <View style={{ flex: 0.25, borderBottomColor: "#e1e8ee", borderBottomWidth: 1, marginLeft: 2 }} />
                    <View style={{ flex: 0.50, borderBottomColor: "#e1e8ee", borderBottomWidth: 1 }} >
                        <Text style={styles.cardTitle}>Addresses</Text>
                    </View>
                    <View style={{ flex: 0.25, borderBottomColor: "#e1e8ee", borderBottomWidth: 1, marginRight: 2 }} />
                    </View>
                    {renderIf(this.state.db.balanceInfo.addresses.length == 0, <View>
                        <Icon name="add-alert" style={styles.addressIcon} fadeDuration={100} />
                        <Text style={styles.noAddress}>It looks like you don't have any addresses yet.</Text>
                        <Text style={styles.noAddress}>You can add one below.</Text>
                    </View>)}
                    {
                        this.state.db.balanceInfo.addresses.map((w, i) => {
                            let swipeoutBtns = [
                                {
                                    text: 'Copy',
                                    backgroundColor: '#2196f3',
                                    underlayColor: '#2196f3',
                                    onPress: () => {this.copyToClipboard(w.address)},
                                },
                                {
                                    text: 'Delete',
                                    backgroundColor: '#FC3D38',
                                    underlayColor: '#FC3D38',
                                    onPress: () => {this.deleteAddress(w.address)},
                                }
                            ]
                            return (
                                    <View key={i} style={styles.address}>
                                        <Swipeout
                                            autoClose={true}
                                            backgroundColor={'#ffffff'}
                                            right={swipeoutBtns}
                                            buttonWidth={72}
                                        >
                                        <Text key={i + '-text'}numberOfLines={1} ellipsizeMode='tail' style={styles.addressName}>{w.name}</Text>
                                            <Text style={styles.addressBalance}>{w.totalBalance}
                                                <Text style={{fontWeight: '100'}}> {this.globals.getCoinTicker()}</Text>
                                            </Text>
                                            <Text style={styles.addressBalance}>${w.valueInDollars}
                                                <Text style={{fontWeight: '100'}}> USD</Text>
                                            </Text>
                                        <Text selectable={true} style={styles.addressText}>{w.address}</Text>
                                        </Swipeout>
                                    </View>
                            );
                        })
                    }
                    <Button
                        containerViewStyle={styles.buttonStyle}
                        onPress={() => navigate('AddAddress', {ltcPrice: this.state.ltcPrice})}
                        raised
                        backgroundColor={'#2196f3'}
                        title='Add New Address'
                    />
                </Card>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    address: {
        borderBottomColor: "#CCCCCC",
        borderBottomWidth: 1,
        marginLeft: 16,
        marginRight: 16
    },
    cardTitle: {
        color: "#43484d",
        fontSize: 16.099999,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    addressName: {
        fontSize: 16,
        marginTop: 8,
        marginBottom: 1,
        fontWeight: 'bold'
    },
    addressBalance: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 1,
    },
    addressText: {
        fontSize: 12,
        marginBottom: 8
    },
    addressIcon: {
        fontSize: 50,
        color: '#2196f3',
        textAlign: 'center',
        marginBottom: 14,
        marginTop: 20
    },
    noAddress: {
        fontSize: 12,
        textAlign: 'center',
        alignItems: 'center'
    },
    buttonStyle: {
        marginTop: 30,
    },
    refreshButton: {
        fontSize: 24,
        color: '#555555',
        textAlign: 'right',
    },
    spinner: {
        marginLeft: 50
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
});
