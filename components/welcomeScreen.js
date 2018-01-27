import React, {Component} from 'react';
import {ScrollView, RefreshControl, Clipboard, Text, View, StyleSheet, Alert, Image, AsyncStorage, ActivityIndicator, Keyboard} from 'react-native';
import {FormLabel, FormInput, Button, Card} from 'react-native-elements';
import GlobalConstants from '../globals';
import Numbers from '../utils/numbers';

export default class WelcomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalBalance: 0.00000000,
            valueInDollars: 0.00,
            loaded: false,
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
        this.globals = new GlobalConstants();
    }

    componentDidMount() {
        // Hard reset of db for dev
        //AsyncStorage.removeItem("db");
        this.initView();
        Keyboard.dismiss();
     }

     initView = () => {
         this.setState({loaded: false, refresh: true});
         AsyncStorage.getItem("db").then((value) => {
             if (value == null) {
                 // init db
                 AsyncStorage.setItem("db", JSON.stringify(this.globals.bareDb));
                 console.log("Creating new db of: " + JSON.stringify(this.state.db));
                 this.setState({db: this.globals.bareDb})
                 console.log("db state is now bare: " + JSON.stringify(this.state.db));
                 this.setState({loaded: true, refreshing: false});
             } else {
                 this.setState({db: JSON.parse(value)});
                 console.log("db state is now: " + JSON.stringify(this.state.db));
                 if (this.state.db.balanceInfo.addresses.length > 0) {
                     Promise.all(this.state.db.balanceInfo.addresses.map(o =>
                         fetch(this.globals.getBlockchainApi().url + o.inputAddress).then(resp => resp.json())
                     )).then(json => {
                         json = this.globals.formatBlockchainApiResponse(json);
                         if (!Array.isArray(json) || json[0].balance == null) {
                             console.log(`Unexpected result from ${this.globals.getBlockchainApi().name} API.`);
                             this.setState({apiError: `Unexpected result from ${this.globals.getBlockchainApi().name} API.`});
                         }
                         let ret = json.reduce((agg, elem) => {
                             var tmpDb = this.state.db;
                             tmpDb.balanceInfo.addresses.forEach((a) => {
                                 if (a.inputAddress == elem.addrStr) {
                                     a.totalBalance = elem.balance;
                                 }
                             });
                             tmpDb.balanceInfo.name = this.globals.getBlockchainApi().name;
                             tmpDb.balanceInfo.date = new Date().getTime().toString();
                             this.setState({db: tmpDb});
                             AsyncStorage.setItem("db", JSON.stringify(tmpDb));
                             console.log("db state is now: " + JSON.stringify(this.state.db));
                             return agg + parseFloat(elem.balance);
                         }, 0);
                         this.setState({totalBalance: ret});
                     }).then(bal => {
                         fetch(this.globals.getMarketApi().url)
                             .then(response => response.json())
                             .then(responseJson => {
                                 responseJson = this.globals.formatMarketApiResponse(responseJson);
                                 if (!Array.isArray(responseJson) || responseJson[0].price_usd == null) {
                                     console.log(`Unexpected result from ${this.globals.getMarketApi().name} API.`);
                                     this.setState({apiError: `Unexpected result from ${this.globals.getMarketApi().name} API.`});
                                 }
                                 let exchange = {
                                     "price": responseJson[0].price_usd,
                                     "name": this.globals.getMarketApi().name,
                                     "date": new Date().getTime().toString()
                                 }
                                 let value = Numbers.formatPrice(this.state.totalBalance * exchange.price, 'US');
                                 let tmpDb = this.state.db;
                                 tmpDb.exchange = exchange;
                                 this.setState({valueInDollars: value, loaded: true, refreshing: false, db: tmpDb});
                                 AsyncStorage.setItem("db", JSON.stringify(this.state.db));
                                 console.log("db state after exchange is now: " + JSON.stringify(this.state.db));
                             })
                             .catch(error => {
                                 this.setState({apiError: `Error connecting to the ${this.globals.getMarketApi().name} API.`});
                                 console.log(`Error connecting to the ${this.globals.getMarketApi().name} API`);
                             });
                     }).catch(error => {
                         this.setState({apiError: `Error connecting to the ${this.globals.getBlockchainApi().name} API.`});
                         console.log(`Error connecting to the ${this.globals.getBlockchainApi().name} API.`);
                     });
                 } else {
                     this.setState({loaded: true, refreshing: false});
                 }
             }
         }).done();
     }

    _onRefresh() {
        this.setState({refreshing: true});
        console.log('refreshing');
    }

    static navigationOptions = ({navigate, navigation}) => ({
        title: GlobalConstants.getAppName(),
        headerLeft: null,
        gesturesEnabled: false
    })

    render() {
        const {navigate} = this.props.navigation;

        let visibletext = null;
        if(this.state.loaded) {
            visibletext = (
                <Card wrapperStyle={styles.card} title="Welcome">
                    <Image style={styles.symbol} source={this.globals.getAssets().symbol}/>
                    <Text style={styles.viewTitleL}>Total Balance:</Text>
                    <Text style={styles.viewTitle}>{Numbers.formatBalance(this.state.totalBalance, 'US')} {this.globals.getCoinTicker()}</Text>
                    <Text wrapperStyle={styles.card} style={styles.viewTitleSM}>${this.state.valueInDollars} USD</Text>
                    <Button
                        raised
                        onPress={() => navigate('ManageAddresses')}
                        backgroundColor={'#2196f3'}
                        title='Manage Addresses'
                    />
                </Card>
            );
        } else {
            visibletext = (
                <Card wrapperStyle={styles.card} title="Welcome">
                    <Image style={styles.symbol} source={this.globals.getAssets().symbol}/>
                    <Text style={styles.viewTitleL}>Total Balance</Text>
                    <ActivityIndicator style={styles.viewTitleSpinner} size="small" color="#2196f3" />
                    <Button
                        raised
                        onPress={() => navigate('ManageAddresses')}
                        backgroundColor={'#2196f3'}
                        title='Manage Addresses'
                    />
                </Card>
            );
        }

        if(this.state.apiError != null) {
            visibletext = (
                <Card wrapperStyle={styles.card} title="Welcome">
                    <Image style={styles.symbol} source={this.globals.getAssets().symbol}/>
                    <Text style={styles.viewTitleL}>Total Balance</Text>
                    <Text style={styles.error} size="small">{this.state.apiError}</Text>
                    <Text style={styles.refresh} size="small" onPress={() => this.initView()}>Refresh Now</Text>
                    <Button
                        raised
                        onPress={() => navigate('ManageAddresses')}
                        backgroundColor={'#2196f3'}
                        title='Manage Addresses'
                    />
                </Card>
            );
        }

        return (
            <ScrollView horizontal={false}
                        refreshControl={
                            <RefreshControl
                                enabled={true}
                                refreshing={this.state.refreshing}
                                onRefresh={() => this.initView()}
                            />
                        }>
                { visibletext }
                <View style={styles.donateContainer}>
                    <Text style={styles.donateTitle}>Donate to our {this.globals.getCoinName()} development</Text>
                    <Text selectable={true} style={styles.donateAddress}>{this.globals.donate}</Text>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    card: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0
    },
    error: {
        marginTop: 28,
        marginBottom: 28,
        color: '#DC143C',
    },
    viewTitleSpinner: {
        marginTop: 28,
        marginBottom: 28
    },
    viewTitleL: {
        marginTop: 35,
        marginBottom: 5,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#34495e',
    },
    viewTitle: {
        margin: 5,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#34495e',
    },
    viewTitleSM: {
        marginBottom: 24,
        fontSize: 14,
        textAlign: 'left',
        color: '#34495e',
    },
    donateContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 36,
    },
    donateTitle: {
        margin: 5,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#34495e',
        marginBottom: 4
    },
    donateAddress: {
        margin: 5,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#34495e',
        marginBottom: 8,
    },
    rightButton: {
        marginRight: 16,
        fontSize: 26,
        color: '#555555',
    },
    symbol: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
