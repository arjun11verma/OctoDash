import React, { Component } from 'react'
import firebase from './firebase'
import LineGraph from './LineGraph'

class Homepage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            restaurauntName: ((((window.location.pathname).split("/"))[2]).replace("%20", " ")),
            data: []
        };
    }

    componentDidMount = () => {
        firebase.database().ref("Accounts").once('value').then(function(snapshot) {
            snapshot.forEach(childSnapshot => {
                if(childSnapshot.child("resturauntName").val() === this.state.restaurauntName) {
                    this.setState({
                        data: childSnapshot.child("customersPerWeek")
                    });
                }
            });
        });
    }

    render() {
        return(
            <div>
                <LineGraph data = {(this.state.data)}></LineGraph>
            </div>
        )
    }
}

export default Homepage;