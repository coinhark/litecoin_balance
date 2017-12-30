'use strict'

class Numbers {
    constructor() {

    }

    static formatPrice(balance, locale) {
        return new Number(balance).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    static formatBalance(balance, locale) {
        return balance.toLocaleString('en', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 8
        });
        //return new Number(balance).toFixed(8).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, ",");
    }
}

export default Numbers;