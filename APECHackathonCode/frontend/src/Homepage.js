import axios from 'axios';
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
        var inputData = [];
        var name = this.state.restaurauntName;

        firebase.database().ref("Accounts").once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    inputData = childSnapshot.child("customersPerWeek").val();
                }
            });
        });

        setTimeout(() => {
            var tempInput = [];
            for (var i = 0; i < 0 + 7; i++) {
                tempInput.push(inputData[i]);
            }

            this.setState({
                data: tempInput
            })
        }, 500);

        axios.post('http://127.0.0.1:5000/getNewsUrls', {'country': "USA"}).then(res => {
            console.log(res);
        });
    }

    render() {
        return (
            <div>
                <LineGraph data={(this.state.data)}></LineGraph>
            </div>
        )
    }
}

export default Homepage;