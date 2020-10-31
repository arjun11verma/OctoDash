import axios from 'axios';
import React, { Component } from 'react'
import Chart from "chart.js";
import firebase from './firebase'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import Badge from "@material-ui/core/Badge";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

var globalThis;

class Homepage extends Component {
    constructor(props) {
        super(props);
        globalThis = this;
        this.state = {
            restaurauntName: ((((window.location.pathname).split("/"))[2]).replace("%20", " ")),
            chartRef: React.createRef(),
            mlData: [],
            pastData: [],
            currentData: [],
            runningAverage: 0,
            currentAverage: 0,
            newsMessage: "Based on our predictions, you will be getting more customers on average next week! Here is some news regarding handling extra customers during COVID19."
        };
    }

    componentDidMount = () => {
        const myChartRef = this.state.chartRef.current.getContext("2d");
        var country = "USA";

        var tempChart = new Chart(myChartRef, {
            type: "line",
            data: {
                labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                datasets: [
                    {
                        label: "Customers",
                        data: this.state.currentData,
                        backgroundColor: [
                            'rgba(0,0,0,0)',
                        ]

                    }
                ]
            },
            options: {
                layout: {
                    padding: 30
                }
            }
        });

        var inputData = [];
        var stop = false;
        var name = this.state.restaurauntName;

        firebase.database().ref("Accounts").once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    inputData = childSnapshot.child("customersPerWeek").val();
                }
            });

            axios.post('http://127.0.0.1:5000/analyzeCustomerData', { 'data': inputData }).then(res => {
                globalThis.setState({
                    mlData: res.data
                });

                if (tempChart != null && !stop) {
                    tempChart.data.datasets[0].data = globalThis.state.mlData.data;
                    tempChart.update();
                    stop = true;
                }

                var pastData = inputData;
                var tempAvg = 0;
                for (var i = 0; i < pastData.length; i++) {
                    tempAvg += pastData[i];
                }
                tempAvg /= pastData.length;

                globalThis.setState({
                    runningAverage: tempAvg | 0
                });

                tempAvg = 0;
                pastData = globalThis.state.mlData.data;
                for (var a = 0; a < pastData.length; a++) {
                    tempAvg += pastData[a];
                }
                tempAvg /= pastData.length;

                globalThis.setState({
                    currentAverage: tempAvg | 0
                });
            });

            if (globalThis.state.currentAverage < globalThis.state.runningAverage) {
                globalThis.setState({
                    newsMessage: "Based on our predictions, you will be getting less customers on average next week. Here are some articles on maintaining customers and popularity in your resturaunt during COVID19."
                });
            }

            axios.post('http://127.0.0.1:5000/getNewsUrls', { 'country': country }).then(res => {
                console.log(res);
            });
        });
    }

    render() {
        return (
            <div>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <MenuIcon />
                        </IconButton>
                        <Typography style={{ flexGrow: "1" }} variant="h6" >
                            lavaLAMP
                        </Typography>
                        <IconButton aria-label="show 17 new notifications" color="inherit">
                            <Badge badgeContent={17} color="secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-haspopup="true"
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Grid container justify="center" style={{ paddingTop: "25px" }}>
                    <Grid item xs={9} style={{ paddingLeft: "25px", paddingRight: "25px" }}>
                        <Grid container spacing={3} justify="center">
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                }} elevation={5}>
                                    <Typography style={{ textAlign: "center", paddingTop: "25px" }}>
                                        Predicted Number of Customers Next Week
                                    </Typography>
                                    <canvas
                                        id="myChart"
                                        ref={this.state.chartRef}
                                    />
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "200px"
                                }} elevation={5}>
                                </Paper>
                            </Grid>
                            <Grid item xs={8}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "200px"
                                }} elevation={5}>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={3} style={{ paddingRight: "25px" }}>
                        <Grid container spacing={3} justify="center">
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "200px",
                                    padding: "10px"
                                }} elevation={5}>
                                    <Typography>{this.state.newsMessage}</Typography>
                                    <Typography>Predicted Average (customers per week): {this.state.currentAverage}</Typography>
                                    <Typography>Recorded Average (customers per week): {this.state.runningAverage}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "650px"
                                }} elevation={5}>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div >
        )
    }
}

export default Homepage;