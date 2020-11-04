import axios from 'axios';
import React, { Component } from 'react'
import Chart from "chart.js";
import firebase from './firebase'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { Paper } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {DataGrid} from "@material-ui/data-grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import DeleteIcon from '@material-ui/icons/Delete';
import Autocomplete from "@material-ui/lab/Autocomplete";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import {AccountCircle} from "@material-ui/icons"
import { Textfit } from 'react-textfit';

// ADD ANOTHER DATA LINE FOR COVID DATA TO SPAN COVID DATA TO YOUR RESTURAUNT DATA
var globalThis;
const weeks = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
var currentDate = new Date();
var sideDate = new Date();
var dateLabelsChart = [currentDate.toDateString()];
var dateLabels = [sideDate.toDateString()];
for(var i = 1; i < 7; i++) {
    currentDate.setDate(currentDate.getDate() + 1);
    sideDate.setDate(sideDate.getDate() - 1);
    dateLabelsChart.push(currentDate.toDateString());
    dateLabels.push(sideDate.toDateString());
}
dateLabels.push(sideDate.toDateString());

class Homepage extends Component {
    constructor(props) {
        super(props);
        globalThis = this;
        this.state = {
            restaurauntName: ((((window.location.pathname).split("/"))[2]).replace("%20", " ")),
            lineChartRef: React.createRef(),
            pieChartRef: React.createRef(),
            mlData: [],
            pastData: [],
            currentData: [],
            urlDataList: [],
            runningAverage: 0,
            currentAverage: 0,
            overallAverage: 0,
            customerMessage: "",
            newsMessage: "Based on our predictions, you will be getting more customers next week! Here is some news regarding handling extra customers during COVID19.",
            customerName: "",
            urlList: "",
            casesPerDay: [],
            color: "#66cc66",
            arrow: "▲",
            customeropen: false,
            supplyopen: false,
            categoryopen: false,
            categoryaddopen: false,
            supplydataopen: false,
            AnchorEl: null,
            percent: "",
            amount: "",
            activesupplyid: false,
            categories: [
                {id: 1, categoryName: "COVID"},
                {id: 2, categoryName: "Food"}
            ],
            columns: [
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'item', headerName: 'Item', width: 200 },
                { field: 'category', headerName: 'Category', width: 200 },
                {
                    field: 'weeklyquantity',
                    headerName: 'Weekly Quantity',
                    type: 'number',
                    width: 150,
                },
                {
                    field: 'predictedquantity',
                    headerName: 'Weekly Quantity',
                    type: 'number',
                    width: 150,
                },
                {
                    field: 'editbutton',
                    headerName: ' ',
                    width: 150,
                    renderCell: (params) => (
                        <strong>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                style={{ marginLeft: 16 }}
                            >
                                Edit
                            </Button>
                        </strong>
                    )
                }
            ],
            rows: [
                { id: 1, item: 'Enter Items', category: 'None', weeklyquantity: 0, predictedquantity: 0},
            ]
        };
    }

    editButton = (element) => {
        console.log("row" + element.rowIndex +
            " - column" + element.cellIndex)
    }

    componentDidMount = () => {
        const myPieChartRef = this.state.pieChartRef.current.getContext("2d");

        var tempPieChart = new Chart(myPieChartRef, {
            type: "pie",
            data: {
                labels: ["test1", "test2"],
                datasets: [{
                        data: [123, 2314],
                        backgroundColor: [
                            "#bfc0c0",
                            "#dc042c",
                            "#2d3142",
                            "#283b63",
                            "#1b2b5f",
                            "#f5f5f5",
                        ],
                        borderColor: 'rgba(0, 0, 0, 1)',
                    }
                ]
            },
            options: {
                legend: {
                    position: 'top',
                },
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

        const myLineChartRef = this.state.lineChartRef.current.getContext("2d");
        var country = "USA";

        var tempChart = new Chart(myLineChartRef, {
            type: "line",
            data: {
                labels: dateLabelsChart,
                datasets: [
                    {
                        label: "Predicted Daily Customers",
                        data: this.state.currentData,
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: 'rgba(0, 0, 0, 1)',
                    }, 
                    {
                        label: "Predicted Daily Covid Cases",
                        data: this.state.casesPerDay,
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        borderColor: 'rgba(200, 0, 0, .3)',
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
        var name = this.state.restaurauntName;
        var nameList = [];
        var quantityList = [];

        firebase.database().ref("Accounts").once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    inputData = childSnapshot.child("customersPerWeek").val();
                    var supplyList = [];

                    if(childSnapshot.hasChild("Supplies")) {
                        childSnapshot.child("Supplies").forEach(supply => {
                            supplyList.push({id: supplyList.length + 1,item: supply.child("name").val(), category: supply.child("category").val(), weeklyquantity: (supply.child("quantity").val())[(supply.child("quantity").val()).length - 1], predictedquantity: 0});
                            nameList.push(supply.child("name").val());
                        });
                    }

                    if(supplyList !== undefined && supplyList !== []) {
                        globalThis.setState({
                            rows: supplyList
                        });
                    }
                }
            });

            globalThis.setState({
                customerName: name
            })

            var weightedWeeklyData = [];
            var tempAvg = 0;

            var innerLen = (inputData.length/6 | 0);
            if(innerLen === 0) {
                innerLen = 1; 
            }
            var sendLen = innerLen;
            for(var i = 0; i < inputData.length; i += sendLen) {
                tempAvg = 0;
                if(inputData.length - i < innerLen) {
                    innerLen = inputData.length - i;
                }
                for(var j = 0; j < innerLen; j++) {
                    tempAvg += inputData[i + j];
                }
                weightedWeeklyData.push((tempAvg/innerLen));
            }
            console.log(weightedWeeklyData);

            axios.post('http://127.0.0.1:5000/analyzeCustomerData', { 'data': weightedWeeklyData }).then(res => {
                console.log(res.data.data);
                var pastData = inputData;
                var resData = res.data.data;
                var calculatedData = [];
                var topper = resData[0];
                var tempAvg = 0;

                for (var i = 1; i < 8; i++) {
                    calculatedData.push(pastData[pastData.length - 8 + i] + resData[i - 1]*0.30 - topper*0.30);
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
                        newsMessage: "Based on our predictions, you will be getting less customers on average next week. Here is some news regarding maintaining popularity and customer base during COVID19.",
                        color: "#DC042C",
                        arrow: "▼"
                    });
                }

                var percentDifference = Math.abs(globalThis.state.runningAverage - globalThis.state.currentAverage) / (globalThis.state.runningAverage) * 100 | 0;
                var inputMessage = "Your restaurant had " + globalThis.state.runningAverage + " customers last week and we predict that your restaurant will have " + globalThis.state.currentAverage + " customers next week. Based off of this, you should order " + percentDifference + "% " + amount + " supplies for next week.";
                
                var supplyInputData = globalThis.state.rows;
                var sum = 0;
                for(var x = 0; x < supplyInputData.length; x++) {
                    var data = parseInt(supplyInputData[x].weeklyquantity) + (supplyInputData[x].weeklyquantity * percentDifference / 100 | 0);
                    sum += (data);
                    quantityList.push(data);
                    supplyInputData[x].predictedquantity = data;
                }

                if (tempPieChart != null) {
                    tempPieChart.data.labels = nameList;
                    tempPieChart.data.datasets[0].data = quantityList;
                    tempPieChart.update();
                }

                globalThis.setState({
                    customerMessage: inputMessage,
                    percent: percentDifference,
                    amount: amount,
                    rows: supplyInputData
                });
            });

            var urlBoxList = [];
            axios.post('http://127.0.0.1:5000/getArticleInfo', { 'country': country }).then(res => {
                var data = res.data;
                for (var i = 0; i < 10; i++) {
                    urlBoxList.push(data[i]);
                }

                globalThis.setState({
                    urlDataList: urlBoxList
                });
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
                        tempChart.data.datasets[1].label = "Predicted Daily COVID Cases " + divisorMessage;
                        tempChart.data.datasets[1].data = globalThis.state.casesPerDay;
                        tempChart.update();
                    }
                });
            });
        });
    }

    returnSupplyHomepage = () => {
        var rows = this.state.rows;
        var mult1 = 9;
        var add1 = 2;
        var mult2 = 6;
        var add2 = 5;
        return (
            rows.map(text =>
                <Grid item xs={(((text.item.length + text.predictedquantity.toString().length) - ((text.item.length + text.predictedquantity.toString().length ) % mult1)) / mult1) + add1}>
                    <Paper style={{
                        backgroundColor: "white",
                    }} elevation={5}>
                        <Grid container spacing={0} justify="center" direction="row" margin="25px">
                            <Grid item xs={((((text.item.length) - (text.item.length % mult2)) / mult2) + add2)} style={{display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                height: "7vh"
                            }}>
                                <Textfit min={18} max={22} mode="single" forceSingleModeWidth={false} style={{
                                    textAlign: "right",
                                }}>
                                    {text.item}
                                </Textfit>
                            </Grid>
                            <Grid item xs={1} style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}>
                                <Textfit min={8} max={13} mode="single" forceSingleModeWidth={false} style={{
                                    textAlign: "center",
                                }}>
                                    {text.weeklyquantity}
                                </Textfit>
                            </Grid>
                            <Grid item xs={11-((((text.item.length) - (text.item.length % mult2)) / mult2) + add2)} style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center"
                            }}>
                                <Textfit min={20} mode="single" forceSingleModeWidth={false} style={{
                                    textAlign: "left",
                                    color: this.state.color,
                                }}>
                                    {this.state.arrow}{text.predictedquantity}
                                </Textfit>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>)
        )
    }

    returnList = () => {
        var categories = this.state.categories;
        var categories_listtype = [];
        for (var i = 0; i < categories.length; i++) {
            categories_listtype.push(categories[i]["categoryName"])
        }
        return (
            categories_listtype.map(text =>
                <ListItem button>
                    <ListItemText primary={text}/>
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>)
        )
    }

    handleSupplyDataClickOpen = () => {
        this.setState({supplydataopen: true});
    };

    handleCategoryAddClickOpen = () => {
        this.setState({categoryaddopen: true});
    };

    handleCustomerClickOpen = () => {
        this.setState({customeropen: true});
    };

    handleCategoryClickOpen = () => {
        this.setState({categoryopen: true});
    };

    handleSupplyClickOpen = (id) => {
        if (id !== "new")
        {
            this.setState({
                supplyopen: true,
                activesupplyid: id
            });
        }
        else {
            this.setState({
                supplyopen: true,
                activesupplyid: id
            });
        }
    };

    handleCustomerDataClose = () => {
        this.setState({customeropen: false});
    }

    handleCustomerClose = () => {
        this.setState({customeropen: false});

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
            window.location.reload(false);
        });
    };

    handleSupplyClose = () => {
        var list = this.state.rows;
        list.push({ id: Object.keys(list).length + 1, item: document.getElementById('supply_name').value, category: document.getElementById('category_list').value, weeklyquantity: document.getElementById('supply_quantity').value, predictedquantity: 0 });
        
        this.setState({
            rows: list
        });

        this.setState({
            supplyopen: false,
            activesupplyid: false
        });

        this.setState({
            supplydataopen: false,
        });

        setTimeout(() => {
            this.setState({
                supplydataopen: true,
            });
        }, 300);
    };

    handleCategoryClose = () => {
        this.setState({
            categoryopen: false,
        });
    };

    handleCategoryAddClose = () => {
        var upload = document.getElementById("category").value;
        var categories = this.state.categories;
        categories.push({id: 0, categoryName: upload})
        this.setState({
            categoryaddopen: false,
            categories: categories
        });
    };

    handleSupplyDataClose = () => {
        this.setState({
            supplydataopen: false,
        });
        window.location.reload(false);
    };

    onRowClick = (rowIdx, row) => {
        this.handleSupplyClickOpen(rowIdx["data"]["id"])
    }
    
    createSupply = () => {
        this.handleSupplyClickOpen("new")
    }

    manageCategory = () => {
        this.handleCategoryClickOpen()
    }

    updateSupplyData =() => {
        var db = firebase.database().ref("Accounts");
        var supplyData = this.state.rows;
        var name = this.state.restaurauntName;

        db.once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    if (childSnapshot.child("customersPerWeek").val() != null) {
                        for(var i = 0; i < Object.keys(supplyData).length; i++) {
                            var quantity = childSnapshot.hasChild(supplyData[i].item) ? childSnapshot.child(supplyData[i].item).child("quantity").val() : [];
                            quantity.push(supplyData[i].weeklyquantity);
                            db.child(name).child("Supplies").child(supplyData[i].item).child("name").set(supplyData[i].item);
                            db.child(name).child("Supplies").child(supplyData[i].item).child("quantity").set(quantity);
                            db.child(name).child("Supplies").child(supplyData[i].item).child("category").set(supplyData[i].category);
                        }
                    }

                    globalThis.setState({
                        supplydataopen: false
                    });
                    window.location.reload(false);
                }
            });
        });
    }

    handleMenuClose = () => {
        this.setState({
            AnchorEl: null
        })
    }

    handleMenu = (event) => {
        this.setState({
            AnchorEl: event.currentTarget
        })
    }

    logOut = () => {
        window.open("/");
        window.close("/Homepage/" + this.state.customerName);
    }

    render() {
        return (
            <div>
                <AppBar position="static" style={{ backgroundColor: "#283B63"}}>
                    <Toolbar style={{minHeight: "7vh"}}>
                        <Typography style={{ flexGrow: "1"}} variant="h6" >
                            Octo Dashboard - {this.state.customerName}
                        </Typography>
                        <Button variant="contained" onClick={this.handleSupplyDataClickOpen} style={{marginRight: "25px", backgroundColor: "#BFC0C0"}}>
                            Edit Supply Data
                        </Button>
                        <Button variant="contained" onClick={this.handleCustomerClickOpen} style={{backgroundColor: "#BFC0C0"}}>
                            Add Customer Data
                        </Button>
                        <IconButton
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={this.handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={this.state.AnchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(this.state.AnchorEl)}
                            onClose={this.handleMenuClose}
                        >
                            <MenuItem onClick={this.handleMenuClose}>My Account</MenuItem>
                            <MenuItem onClick={this.logOut}>Log Out</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <Grid container justify="center" style={{ paddingTop: "25px", backgroundColor: "#F5F5F5", height: "93vh"}}>
                    <Grid item xs={9} style={{ paddingLeft: "25px", paddingRight: "25px"}}>
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
                                            id="lineChart"
                                            ref={this.state.lineChartRef}
                                        />
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                }} elevation={5}>
                                    <Typography style = {{padding: "10px", textAlign: "center"}}>Ever since you began using the Octo terminal, {this.state.restaurauntName} has had an average of {this.state.overallAverage} customers per week!</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={9}>
                            <Grid container spacing={3} justify="center" direction="row">
                                <Grid item xs={12} style={{paddingLeft: "2.5vw", paddingRight: "2.5vw"}}>
                                    <Paper elevation={5}>
                                        <Typography style={{ textAlign: "center", paddingTop: "15px" }}>
                                            Predicted Quantity Required of Each Item Next Week
                                        </Typography>
                                        <div class="chart-container" style={{ margin: "auto" }}>
                                            <canvas
                                                id="myPieChartRef"
                                                ref={this.state.pieChartRef}
                                            />
                                        </div>
                                    </Paper>
                                </Grid>
                            </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={3} style={{ paddingRight: "25px" }} >
                        <Grid container spacing={3} justify="center">
                            <Grid item xs={6}>
                                <Paper style={{backgroundColor: "#BFC0C0", padding: "2px"}}>
                                    <Paper style={{
                                        textAlign: "center",
                                        padding: "5px",
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
                                    </Paper>
                                </Paper>
                            </Grid>
                            <Grid item xs={6}>
                                <Paper style={{backgroundColor: this.state.color, padding: "2px"}}> 
                                    <Paper style={{
                                        borderColor: this.state.color,
                                        borderWidth: "5px",
                                        textAlign: "center",
                                        padding: "5px",
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
                                    height: "auto",
                                    padding: "10px"
                                }} elevation={5}>
                                    <Typography>{this.state.newsMessage}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "745px",
                                    overflowY: 'scroll'
                                }} elevation={5}>
                                    <Typography style = {{padding: "10px"}}>{this.state.urlList}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                    
                    <Grid item xs={3}>
                    </Grid>
                </Grid>
                <Dialog fullWidth={true} maxWidth = {'md'} open={this.state.supplydataopen} onClose={this.handleCategoryAddClose} aria-labelledby="supply-data-dialog">
                    <DialogTitle id="supply-data-dialog">Resturaunt Supplies Used</DialogTitle>
                    <DialogContent>
                        <Paper style={{
                            backgroundColor: "white",
                            height: "400px"
                        }} elevation={0}>
                            <Grid container direction = "row" alignItems = "center" spacing = {5} style={{padding: "25px"}}>
                                <Typography> Current Week: {dateLabels[6]} - {dateLabels[0]} </Typography>
                                <Button variant="contained" onClick={this.createSupply}>
                                    Add Supply
                                </Button>
                                <Button variant="contained" onClick={this.manageCategory}>
                                    Manage Categories
                                </Button>
                            </Grid>
                            <DataGrid
                                rows={this.state.rows}
                                columns={this.state.columns}
                                hideFooter
                                onRowClick={this.onRowClick}
                            />
                        </Paper>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={this.handleSupplyDataClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.updateSupplyData} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.categoryaddopen} onClose={this.handleCategoryAddClose} aria-labelledby="category-add-dialog">
                    <DialogTitle id="category-add-dialog">Add Categories </DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Category"
                                id="category"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCategoryAddClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleCategoryAddClose} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.categoryopen} onClose={this.handleCategoryClose} aria-labelledby="category-dialog">
                    <DialogTitle id="category-dialog">Edit Categories </DialogTitle>
                    <DialogContent>
                        <form>
                            <List component="categories" aria-label="categorylist">
                                {this.returnList()}
                            </List>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCategoryAddClickOpen} color="primary">
                            Add Category
                        </Button>
                        <Button onClick={this.handleCategoryClose} color="primary">
                            Done
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.supplyopen} onClose={this.handleSupplyClose} aria-labelledby="supply-dialog">
                    <DialogTitle id="supply-dialog">Input your weekly data for {this.state.activesupplyid}</DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Supply Name"
                                id="supply_name"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <Autocomplete
                                id="category_list"
                                options={this.state.categories}
                                getOptionLabel={(option) => option.categoryName}
                                style={{width: "80%", marginLeft: "10%"}}
                                renderInput={(params) => <TextField {...params} label="Category" variant="outlined" />}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Weekly Quantity"
                                id="supply_quantity"
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleSupplyClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSupplyClose} color="primary">
                            Add Entry
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.customeropen} onClose={this.handleCustomerClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Input your weekly data</DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label= {dateLabels[6]}
                                id="mon"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label= {dateLabels[5]}
                                id="tue"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label= {dateLabels[4]}
                                id="wed"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label= {dateLabels[3]}
                                id="thu"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label= {dateLabels[2]}
                                id="fri"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label= {dateLabels[1]}
                                id="sat"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label= {dateLabels[0]}
                                id="sun"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCustomerDataClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleCustomerClose} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            </div >
        )
    }
}

export default Homepage;