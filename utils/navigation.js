'use strict'

class StatelessNavigation {
    constructor() {

    }

    static navigateWithProps(navigation, target, passedParams) {
        navigation.dispatch({
            type: 'Navigation/RESET',
            index: 0,
            actions: [{
                type: 'Navigate',
                routeName: target,
                params: passedParams
            }]
        });
    }

    static navigate(navigation, target) {
        navigation.dispatch({
            type: 'Navigation/RESET',
            index: 0,
            actions: [{
                type: 'Navigate',
                routeName: target
            }]
        });
    }
}

export default StatelessNavigation;