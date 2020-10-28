import React, { Component } from 'react'
import firebase from './firebase'

class Homepage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            restaurauntName: ((((window.location.pathname).split("/"))[2]).replace("%20", " "))
        };
    }

    render() {
        return(
            <div>
                
            </div>
        )
    }
}

export default Homepage;