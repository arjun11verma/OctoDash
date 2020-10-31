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
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {DataGrid} from "@material-ui/data-grid";

// ADD ANOTHER DATA LINE FOR COVID DATA TO SPAN COVID DATA TO YOUR RESTURAUNT DATA
var globalThis;
const weeks = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

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
            overallAverage: 0,
            newsMessage: "Based on our predictions, you will be getting more customers on average next week! Here is some news regarding handling extra customers during COVID19.",
            customerMessage: "",
            customerName: "",
            urlList: "",
            casesPerDay: [],
            open: false
            color: "#66cc66",
            open: false,
            percent: "",
            amount: "",
            columns: [
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'item', headerName: 'Item', width: 130 },
                { field: 'category', headerName: 'Category', width: 100 },
                {
                    field: 'weeklyquantity',
                    headerName: 'Weekly Quantity',
                    type: 'number',
                    width: 150,
                },
                { field: 'editbutton', headerName: 'Edit', width: 100 },
            ],
            rows: [
                { id: 1, item: 'Masks', category: 'COVID', weeklyquantity: 35 },
                { id: 2, item: 'Bread', category: 'Food', weeklyquantity: 70 },
            ]
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
                    }, 
                    {
                        label: "Daily Covid Cases",
                        data: this.state.casesPerDay,
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        borderColor: 'rgba(200, 200, 200, 255)',
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

        var rows = this.state.rows;
        console.log(rows[0])
        for (var i = 0; i < rows.length; i++) {
            var btn = document.createElement('input');
            btn.type = "button";
            btn.className = "btn-" + i;
            btn.value = "edit"
            rows[i]["editbutton"] = btn
        }

        /*  */
        console.log(rows)
        globalThis.setState({
            rows: rows
        });

        var inputData = [];
        var name = this.state.restaurauntName;

        firebase.database().ref("Accounts").once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    inputData = childSnapshot.child("customersPerWeek").val();
                }
            });

            globalThis.setState({
                customerName: name
            })

            axios.post('http://127.0.0.1:5000/analyzeCustomerData', { 'data': inputData }).then(res => {
                var pastData = inputData;
                var resData = res.data.data;
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

                if (tempChart != null) {
                    tempChart.data.datasets[0].data = globalThis.state.mlData;
                    tempChart.update();
                }

                globalThis.setState({
                    runningAverage: tempAvg | 0
                });

                tempAvg = 0;
                for (var b = 0; b < pastData.length; b++) {
                    tempAvg += pastData[b];
                }
                tempAvg /= (pastData.length / 7);

                globalThis.setState({
                    overallAverage: tempAvg | 0
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
                        newsMessage: "Based on our predictions, you will be getting less customers next week. Here are some articles on maintaining customers and popularity in your resturaunt during COVID19.",
                        color: "#ff6666"
                    });
                }

                var percentDifference = Math.abs(globalThis.state.runningAverage - globalThis.state.currentAverage) / (globalThis.state.runningAverage) * 100 | 0;
                var inputMessage = "Your restaurant had " + globalThis.state.runningAverage + " customers last week and we predict that your restaurant will have " + globalThis.state.currentAverage + " customers next week. Based off of this, you should order " + percentDifference + "% " + amount + " supplies for next week.";
                globalThis.setState({
                    customerMessage: inputMessage,
                    percent: percentDifference,
                    amount: amount
                });
            });

            axios.post('http://127.0.0.1:5000/getNewsUrls', { 'country': country }).then(res => {
                var urlList = [];
                for (var i = 0; i < 10; i++) {
                    urlList.push(res.data[i.toString()]);
                    urlList.push("\n");
                }
                globalThis.setState({
                    urlList: urlList
                });
                console.log(globalThis.state.urlList);
            });

            axios.post('http://127.0.0.1:5000/covidData', { 'country': country }).then(res => {
                var covidData = [];
                const len = Object.keys(res.data).length;
                const data = res.data;
                for (var i = len - 1; i > len - 8; i--) {
                    covidData.push(data[i].cases);
                }

                axios.post('http://127.0.0.1:5000/analyzeCustomerData', { 'data': covidData }).then(res => {
                    var resData = res.data.data;
                    var calculatedData = [];
                    var topper = resData[0];
                    var divisor = 1000;
                    var divisorMessage = "(Thousands)";
                    if(globalThis.state.currentAverage > 500) {
                        divisor = 100;
                        divisorMessage = "(Hundreds)";
                    }

                    for (var i = 1; i < 8; i++) {
                        calculatedData.push((covidData[covidData.length - 8 + i] + resData[i - 1] - topper)/divisor | 0);
                    }

                    globalThis.setState({
                        casesPerDay: calculatedData
                    });

                    if (tempChart != null) {
                        tempChart.data.datasets[1].label = "Daily COVID Cases " + divisorMessage;
                        tempChart.data.datasets[1].data = globalThis.state.casesPerDay;
                        tempChart.update();
                    }
                });
            });
        });
    }

    changePage = () => {
        window.open("/InputData/" + this.state.restaurauntName);
        window.close("/Homepage/" + this.state.restaurauntName);
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    }

    handleCloseNoData = () => {
        this.setState({ open: false });
    }

    handleClose = () => {
        this.setState({ open: false });

        var input = 0;
        var name = this.state.restaurauntName;
        firebase.database().ref("Accounts").once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    if (childSnapshot.child("customersPerWeek").val() != null) {
                        input = childSnapshot.child("customersPerWeek").val();
                    }
                }
            });

            for (var i = 0; i < 7; i++) {
                var upload = document.getElementById(weeks[i]).value;
                upload = parseInt(upload);
                input.push(upload);
            }

            firebase.database().ref("Accounts").child(name).child("customersPerWeek").set(input);

            window.open("/Homepage/" + name);
            window.close("/InputData/" + name);
        });
    };

    render() {
        const dataTable = props => {
            return (
                <DataGrid
                    rows={this.state.rows}
                    olumns={this.state.columns}
                    checkboxSelection
                />
            );
        };

        return (
            <div>
                <AppBar position="static">
                    <Toolbar>
                        <Typography style={{ flexGrow: "1" }} variant="h6" >
                            Octo Dashboard - {this.state.customerName}
                        </Typography>
                        <Button variant="contained" onClick={this.handleClickOpen}>
                            Add Data!
                        </Button>
                    </Toolbar>
                </AppBar>
                <Grid container justify="center" style={{ paddingTop: "25px" }}>
                    <Grid item xs={9} style={{ paddingLeft: "25px", paddingRight: "25px" }}>
                        <Grid container spacing={3} justify="center" direction="row">
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                }} elevation={5}>
                                    <Typography style={{ textAlign: "center", paddingTop: "15px" }}>
                                        Predicted Number of COVID Cases and Customers Next Week
                                    </Typography>
                                    <div class="chart-container" style={{ margin: "auto" }}>
                                        <canvas
                                            id="myChart"
                                            ref={this.state.chartRef}
                                        />
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "500px"
                                }} elevation={5}>
                                    {dataTable}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={3} style={{ paddingRight: "25px" }}>
                        <Grid container spacing={3} justify="center">
                            <Grid item xs={6}>
                                <Paper style={{
                                    backgroundColor: "#ffff99",
                                    textAlign: "center",
                                }} elevation={5}>
                                    <Typography variant="subtitle2">
                                        Recorded
                                    </Typography>
                                    <Typography variant="h5">
                                        {this.state.runningAverage}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Customers this week
                                    </Typography>
                                    <Typography style={{ padding: "10px", paddingBottom: "0px" }}>{this.state.customerMessage}</Typography>
                                    <Typography style={{ padding: "10px", paddingTop: "0px" }}>Your average number of customers per week since you started using Octo is {this.state.overallAverage}.</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6}>
                                <Paper style={{
                                    backgroundColor: this.state.color,
                                    textAlign: "center"
                                }} elevation={5}>
                                    <Typography variant="subtitle2">
                                        Predicted
                                    </Typography>
                                    <Typography variant="h5">
                                        {this.state.currentAverage}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Customers next week
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper style={{
                                    textAlign: "center"
                                }} elevation={5}>
                                    <Typography variant="subtitle2">
                                        You should order
                                    </Typography>
                                    <Typography variant="h5">
                                        {this.state.percent}% <span style={{color: this.state.color}}>{this.state.amount}</span>
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Supplies for next week
                                    </Typography>
                                </Paper>
                            </Grid>
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
                                    height: "515px",
                                    overflowY: 'scroll'
                                }} elevation={5}>
                                    <Typography>{this.state.urlList}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Input your weekly data</DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Monday"
                                id="mon"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Tuesday"
                                id="tue"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Wednesday"
                                id="wed"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Thursday"
                                id="thu"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Friday"
                                id="fri"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Saturday"
                                id="sat"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Sunday"
                                id="sun"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseNoData} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleClose} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            </div >
        )
    }
}

export default Homepage;