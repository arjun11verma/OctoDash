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
import AddIcon from "@material-ui/icons/Add"
import Fab from "@material-ui/core/Fab"

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
            newsMessage: "Based on our predictions, you will be getting more customers on average next week! Here is some news regarding handling extra customers during COVID19.",
            customerMessage: "",
            customerName: "",
            urlList: ""
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
                        label: "Daily Customers",
                        data: this.state.currentData,
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: 'rgba(0, 0, 0, 1)',
                    }
                ]
            },
            options: {
                layout: {
                    padding: {
                        left: 20,
                        right: 40,
                        top: 5,
                        bottom: 15,
                    }
                }
            }
        });

        var inputData = [];
        var stop = false;
        var name = this.state.restaurauntName;
        var personalName = "";

        firebase.database().ref("Accounts").once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    inputData = childSnapshot.child("customersPerWeek").val();
                    personalName = childSnapshot.child("name").val();
                }
            });

            axios.post('http://127.0.0.1:5000/analyzeCustomerData', { 'data': inputData }).then(res => {
                var pastData = inputData;
                var resData = res.data.data;
                console.log(resData);
                console.log(pastData);
                var calculatedData = [];
                var topper = resData[0];
                var tempAvg = 0;

                for (var i = 1; i < 8; i++) {
                    calculatedData.push(pastData[pastData.length - 8 + i] + resData[i - 1] - topper);
                    tempAvg += pastData[pastData.length - i];
                }

                globalThis.setState({
                    mlData: calculatedData
                });

                if (tempChart != null && !stop) {
                    tempChart.data.datasets[0].data = globalThis.state.mlData;
                    tempChart.update();
                    stop = true;
                }

                globalThis.setState({
                    runningAverage: tempAvg | 0
                });

                tempAvg = 0;
                pastData = globalThis.state.mlData;
                for (var a = 0; a < pastData.length; a++) {
                    tempAvg += pastData[a];
                }

                globalThis.setState({
                    currentAverage: tempAvg | 0
                });

                var amount = "more";

                if (globalThis.state.currentAverage < globalThis.state.runningAverage) {
                    amount = "less";
                    globalThis.setState({
                        newsMessage: "Based on our predictions, you will be getting less customers next week. Here are some articles on maintaining customers and popularity in your resturaunt during COVID19."
                    });
                }

                var percentDifference = Math.abs(globalThis.state.runningAverage - globalThis.state.currentAverage)/(globalThis.state.runningAverage) * 100 | 0;
                var inputMessage = "Your resturaunt had " + globalThis.state.runningAverage + " customers last week and we predict that your resturaunt will have " + globalThis.state.currentAverage + " customers next week. Based off of this, you should order " + percentDifference + "% " + amount + " supplies for next week.";
                globalThis.setState({
                    customerMessage: inputMessage
                });
            });

            axios.post('http://127.0.0.1:5000/getNewsUrls', { 'country': country }).then(res => {
                var urlList = [];
                for(var i = 0; i < 10; i++) {
                    urlList.push(res.data[i.toString()]);
                    urlList.push("\n");
                }
                globalThis.setState({
                    urlList: urlList
                });
                console.log(globalThis.state.urlList);
            });
        });
    }

    changePage = () => {
        window.open("/InputData/" + this.state.restaurauntName);
        window.close("/Homepage/" + this.state.restaurauntName);
    }

    render() {
        return (
            <div>
                <AppBar position="static">
                    <Toolbar>
                        <Typography style={{ flexGrow: "1" }} variant="h6" >
                            Octo Dashboard
                        </Typography>
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-haspopup="true"
                            color="inherit"
                            onClick = {this.changePage}
                        >
                            <Typography>Input Weekly Data!</Typography>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Grid container justify="center" style={{ paddingTop: "25px" }}>
                    <Grid item xs={9} style={{ paddingLeft: "25px", paddingRight: "25px" }}>
                        <Grid container spacing={3} justify="center" direction = "row">
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                }} elevation={5}>
                                    <Typography style={{ textAlign: "center", paddingTop: "15px" }}>
                                        Predicted Number of Customers Next Week
                                    </Typography>
                                    <div class="chart-container" style={{margin: "auto"}}>
                                        <canvas
                                        id="myChart"
                                        ref={this.state.chartRef}
                                        />
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "150px",
                                    width: "532px"
                                }} elevation={5}>
                                </Paper>
                            </Grid>
                            <Grid item>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "150px",
                                    width: "532px"
                                }} elevation={5}>
                                    <Typography style = {{padding: "10px"}}>{this.state.customerMessage}</Typography>
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
                                    <Typography>Predicted Number (customers per week): {this.state.currentAverage}</Typography>
                                    <Typography>Recorded Number (customers per week): {this.state.runningAverage}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "525px",
                                    width: "357px",
                                    overflowY: 'scroll'
                                }} elevation={5}>
                                    <Typography>{this.state.urlList}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Fab color="primary" aria-label="add" style={{position: "absolute", bottom: "25", left: "25"}}>
                    <AddIcon />
                </Fab>
            </div >
        )
    }
}

export default Homepage;