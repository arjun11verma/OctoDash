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
import clsx from "clsx";
import makeStyles from "@material-ui/core/styles/makeStyles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import DeleteIcon from '@material-ui/icons/Delete';
import Autocomplete from "@material-ui/lab/Autocomplete";

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
            newsMessage: "Based on our predictions, you will be getting more customers on average next week! Here is some news regarding handling extra customers during COVID19.",
            customerMessage: "",
            customerName: "",
            urlList: "",
            color: "#66cc66",
            customeropen: false,
            supplyopen: false,
            categoryopen: false,
            categoryaddopen: false,
            percent: "",
            amount: "",
            activesupplyid: false,
            categories: [
                {id: 1, categoryName: "COVID"},
                {id: 2, categoryName: "Food"}
            ],
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
                {
                    field: 'editbutton',
                    headerName: 'Edit',
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
                { id: 1, item: 'Masks', category: 'COVID', weeklyquantity: 35 },
                { id: 2, item: 'Bread', category: 'Food', weeklyquantity: 70 },
            ]
        };
    }

    editButton = (element) => {
        console.log("row" + element.rowIndex +
            " - column" + element.cellIndex)
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
        });
    }

    returnList = () => {
        var categories = this.state.categories;
        var categories_listtype = []
        for (var i = 0; i < categories.length; i++) {
            categories_listtype.push(categories[i]["categoryName"])
        }
        return (
            categories_listtype.map(text =>
                <ListItem button>
                    <ListItemText primary={text}/>
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-lavel="delete">
                            <DeleteIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>)
        )
    }

    changePage = () => {
        window.open("/InputData/" + this.state.restaurauntName);
        window.close("/Homepage/" + this.state.restaurauntName);
    }

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
        if (id != "new")
        {
            this.setState({
                supplyopen: true,
                activesupplyid: id
            });
        }
        else {
            {
                this.setState({
                    supplyopen: true,
                    activesupplyid: id
                });
            }
        }
    };

    handleCustomerClose = () => {
        this.setState({open: false});

        var input = 0;
        var name = this.state.restaurauntName;
        firebase.database().ref("Accounts").once('value').then(function(snapshot) {
            snapshot.forEach(childSnapshot => {
                if(childSnapshot.child("resturauntName").val() === name) {
                    if(childSnapshot.child("customersPerWeek").val() != null) {
                        input = childSnapshot.child("customersPerWeek").val();
                    }
                }
            });

            for(var i = 0; i < 7; i++) {
                var upload = document.getElementById(weeks[i]).value;
                upload = parseInt(upload);
                input.push(upload);
            }

            firebase.database().ref("Accounts").child(name).child("customersPerWeek").set(input);

            window.open("/Homepage/" + name);
            window.close("/InputData/" + name);
        });
    };

    handleSupplyClose = () => {
        this.setState({
            supplyopen: false,
            activesupplyid: false
        });
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

    render() {
        const onRowClick = (rowIdx, row) => {
            console.log(rowIdx);
            this.handleSupplyClickOpen(rowIdx["data"]["id"])
        }
        const createSupply = () => {
            this.handleSupplyClickOpen("new")
        }
        const manageCategory = () => {
            this.handleCategoryClickOpen()
        }
        return (
            <div>
                <AppBar position="static">
                    <Toolbar>
                        <Typography style={{ flexGrow: "1" }} variant="h6" >
                            Octo Dashboard - {this.state.customerName}
                        </Typography>
                        <Button variant="contained" onClick={this.handleCustomerClickOpen}>
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
                                        Predicted Number of Customers Next Week
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
                                    <DataGrid
                                        rows={globalThis.state.rows}
                                        columns={globalThis.state.columns}
                                        hideFooter
                                        onRowClick={onRowClick}
                                    />
                                    <Button style={{position: "relative", top: "200px"}} variant="contained" onClick={createSupply}>
                                        Add Supply Entry
                                    </Button>
                                    <Button style={{position: "relative", top: "200px"}} variant="contained" onClick={manageCategory}>
                                        Manage Supply Categories
                                    </Button>
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
                                label="Monday"
                                id="mon"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Tuesday"
                                id="tue"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Wednesday"
                                id="wed"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Thursday"
                                id="thu"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Friday"
                                id="fri"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Saturday"
                                id="sat"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Sunday"
                                id="sun"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCustomerClose} color="primary">
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