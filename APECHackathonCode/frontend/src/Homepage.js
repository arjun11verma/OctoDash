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
import { DataGrid } from "@material-ui/data-grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import DeleteIcon from '@material-ui/icons/Delete';
import Autocomplete from "@material-ui/lab/Autocomplete";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import { AccountCircle } from "@material-ui/icons"
import { Textfit } from 'react-textfit';
import Link from "@material-ui/core/Link";
import Divider from "@material-ui/core/Divider";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel"
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import { Card } from '@material-ui/core'
import { CardActionArea } from '@material-ui/core'
import { CardContent } from '@material-ui/core';
import { CardMedia } from '@material-ui/core';
import InfiniteCalendar from 'react-infinite-calendar'
import 'react-infinite-calendar/styles.css'
import Skeleton from "@material-ui/lab/Skeleton";

var globalThis;
const weeks = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const setDate = new Date();

class Homepage extends Component {
    constructor(props) {
        super(props);
        globalThis = this;
        this.state = {
            restaurauntName: ((((window.location.pathname).split("/"))[2]).replace("%20", " ")),
            lineChartRef: React.createRef(),
            pieChartRef: React.createRef(),
            objectiveDate: 0,
            divisor: 0,
            uiurls: [],
            openEdit: false,
            closeEdit: false,
            mlData: [],
            actualCovidData: [],
            dateLabels: [],
            pastData: [],
            currentData: [],
            urlDataList: [],
            runningAverage: 0,
            currentAverage: 0,
            overallAverage: 0,
            customerMessage: "",
            newsMessage: "Based on our predictions, you will be getting more customers next week! Here is some news regarding handling extra customers during COVID-19.",
            customerName: "",
            titleGraphText: "Predicted Number of COVID Cases and Customers Next Week",
            urlList: "",
            casesPerDay: [],
            color: "#66cc66",
            arrow: "▲",
            customeropen: false,
            supplyopen: false,
            categoryopen: false,
            categoryaddopen: false,
            supplydataopen: false,
            accountopen: false,
            AnchorEl: null,
            percent: "",
            amount: "",
            view: "week",
            today: new Date(),
            selecteddate: null,
            lineGraph: null,
            activesupplyid: false,
            categories: [
                { id: 1, categoryName: "COVID" },
                { id: 2, categoryName: "Food" }
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
                { id: 1, item: 'Enter Items', category: 'None', weeklyquantity: 0, predictedquantity: 0 },
            ]
        };
    }

    editButton = (element) => {
        console.log("HELLO");
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
                responsive: true,
                legend: {
                    position: 'top',
                },
            }
        });

        const myLineChartRef = this.state.lineChartRef.current.getContext("2d");
        var country = "USA";

        globalThis.setState({
            lineGraph: new Chart(myLineChartRef, {
                type: "line",
                data: {
                    labels: [1, 2, 3, 4, 5, 6, 7],
                    datasets: [
                        {
                            label: "Predicted Daily Customers",
                            data: this.state.currentData,
                            backgroundColor: 'rgba(0,0,0,0)',
                            borderColor: 'rgba(0, 0, 0, 1)',
                            borderDash: [5, 5]
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
                    maintainAspectRatio: false
                }
            })
        })

        var inputData = [];
        var name = this.state.restaurauntName;
        var nameList = [];
        var quantityList = [];

        firebase.database().ref("Accounts").once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    inputData = childSnapshot.child("customersPerWeek").val();
                    country = childSnapshot.child("country").val();

                    globalThis.setState({
                        pastData: inputData
                    })

                    var supplyList = [];

                    if (childSnapshot.hasChild("Supplies")) {
                        childSnapshot.child("Supplies").forEach(supply => {
                            supplyList.push({ id: supplyList.length + 1, item: supply.child("name").val(), category: supply.child("category").val(), weeklyquantity: (supply.child("quantity").val())[(supply.child("quantity").val()).length - 1], predictedquantity: 0 });
                            nameList.push(supply.child("name").val());
                        });
                    }

                    var currentDate = new Date();
                    if (childSnapshot.hasChild("StartWeek")) {
                        var dateBlock = childSnapshot.child("StartWeek").val();
                        currentDate = new Date(dateBlock.year, dateBlock.month - 1, dateBlock.day);
                        for (var i = 0; i < inputData.length - 7; i++) {
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                    }

                    globalThis.setState({
                        objectiveDate: currentDate
                    })

                    var dateList = [];
                    for (var i = 0; i < 7; i++) {
                        dateList.push(currentDate.toDateString());
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                    if (supplyList !== undefined && supplyList !== []) {
                        globalThis.setState({
                            rows: supplyList
                        });
                    }

                    globalThis.setState({
                        dateLabels: dateList
                    });

                    if (globalThis.state.lineGraph !== null) {
                        globalThis.state.lineGraph.data.labels = dateList;
                    }

                    console.log(globalThis.state.rows);
                }
            });

            globalThis.setState({
                customerName: name
            })

            var weightedWeeklyData = [];
            var tempAvg = 0;
            var innerLen = 1;
            var arrLen = 0;

            if (inputData !== null) {
                arrLen = inputData.length;
                innerLen = (arrLen / 6 | 0);
            }
            if(innerLen === 0) {
                innerLen = 1;
            }
            var sendLen = innerLen;
            for (var i = 0; i < arrLen; i += sendLen) {
                tempAvg = 0;
                if (inputData.length - i < innerLen) {
                    innerLen = inputData.length - i;
                }
                for (var j = 0; j < innerLen; j++) {
                    tempAvg += inputData[i + j];
                }
                weightedWeeklyData.push((tempAvg / innerLen));
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
                    calculatedData.push(pastData[pastData.length - 8 + i] + resData[i - 1] * 0.50 - topper * 0.50);
                    tempAvg += pastData[pastData.length - i];
                }

                globalThis.setState({
                    mlData: calculatedData
                });

                if (globalThis.state.lineGraph != null) {
                    globalThis.state.lineGraph.data.datasets[0].data = globalThis.state.mlData;
                    globalThis.state.lineGraph.update();
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
                for (var x = 0; x < supplyInputData.length; x++) {
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
                var outerDict;
                var rows = [];
                var cards = []
                console.log(data)
                for (var i = 0; i < Object.keys(data).length; i++) {
                    outerDict = data[i + ""];
                    if(outerDict !== undefined) {
                        rows.push(outerDict);
                    }
                }
                console.log(rows);
                cards = rows.map(info =>
                    <Card>
                        <CardActionArea onClick = {() => {window.open(info.url); console.log(info.url)}}>
                            <Grid container direction="column">
                                <CardContent inline>
                                    <Grid container direction="row">
                                        <Grid xs = {4}>
                                            <img src = {info.imageURL} alt = "image" width = "90px"></img>
                                        </Grid>
                                        <Grid xs = {8}>
                                            <Typography style = {{fontSize: "13px"}} component="h2">
                                                {info.title}
                                            </Typography>
                                            <Typography style = {{fontSize: "10px"}} color="textSecondary" component="p">
                                                {info.authors[0]} - {info.date}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Grid>
                        </CardActionArea>
                    </Card>);
               
                globalThis.setState({
                    uiurls: cards
                });
            });

            axios.post('http://127.0.0.1:5000/covidData', { 'country': country }).then(res => {
                var covidData = [];
                const len = Object.keys(res.data).length;
                const data = res.data;
                for (var i = len - 1; i > len - 8; i--) {
                    covidData.push(data[i].cases);
                }

                globalThis.setState({
                    actualCovidData: covidData
                })

                axios.post('http://127.0.0.1:5000/analyzeCustomerData', { 'data': covidData }).then(res => {
                    var resData = res.data.data;
                    var calculatedData = [];
                    var topper = resData[0];
                    var divisor = 1000;
                    var divisorMessage = "(Thousands)";
                    if (globalThis.state.currentAverage > 500) {
                        divisor = 100;
                        divisorMessage = "(Hundreds)";
                    }

                    globalThis.setState({
                        divisor: divisor
                    });

                    for (var i = 1; i < 8; i++) {
                        calculatedData.push((covidData[covidData.length - 8 + i] + resData[i - 1]*0.33 - topper*0.33) / divisor | 0);
                    }

                    globalThis.setState({
                        casesPerDay: calculatedData
                    });

                    if (globalThis.state.lineGraph != null) {
                        globalThis.state.lineGraph.data.datasets[1].label = "Predicted Daily COVID Cases " + divisorMessage;
                        globalThis.state.lineGraph.data.datasets[1].data = globalThis.state.casesPerDay;
                        globalThis.state.lineGraph.update();
                    }
                });
            });
        });
    }

    previousWeeklyView = () => {
        globalThis.setState({
            titleGraphText: "Previous Week's Data and Next Week's Predictions"
        })

        var newData = this.state.mlData;
        var oldData = [];
        for (var i = 0; i < 7; i++) {
            oldData.unshift((this.state.pastData)[this.state.pastData.length - i - 1]);
            newData.unshift(null);
        }
        newData[newData.length - 8] = oldData[oldData.length - 1];

        var middleDate = this.state.objectiveDate;
        var dateList = [];
        middleDate.setDate(middleDate.getDate() - 14);
        for (var i = 0; i < 14; i++) {
            dateList.push(middleDate.toDateString());
            middleDate.setDate(middleDate.getDate() + 1);
        }

        var covidList = (globalThis.state.casesPerDay);
        for(var i = 0; i < 7; i++) {
            covidList.unshift(((globalThis.state.actualCovidData)[i])/globalThis.state.divisor | 0);
        }
        console.log(globalThis.state.casesPerDay);

        if (globalThis.state.lineGraph != null) {
            globalThis.state.lineGraph.data.labels = dateList;
            globalThis.state.lineGraph.data.datasets[0].data = newData;
            globalThis.state.lineGraph.data.datasets[1].data = covidList;
            globalThis.state.lineGraph.data.datasets.push({
                label: "Last Week's Customers",
                data: oldData,
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: 'rgba(0, 0, 0, 1)',
            });
            globalThis.state.lineGraph.update();
        }
    }

    returnSupplyHomepage = () => {
        var rows = this.state.rows;
        if(rows[0] !== undefined) {
            var plus = "";
            var val = parseInt(rows[0].predictedquantity) - parseInt(rows[0].weeklyquantity);
            if(val > 0) {
                plus = "+";
            }
            return (
                rows.map(text =>
                    <Grid item xs={6} sm={2}>
                        <Paper style={{
                            backgroundColor: "white",
                            height: "11vh",
                            overflow: "hidden"
                        }} elevation={5}>
                            <Grid container spacing={0} justify="left" direction="row">
                                <Grid item xs={8} style={{ paddingLeft: "10px", paddingTop: "10px" }}>
                                    <Typography variant="h7">
                                        {text.item}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4} style={{ paddingRight: "10px", paddingTop: "10px" }}>
                                    <Chip
                                        size="small"
                                        label={text.category}
                                        clickable
                                        color="primary"
                                    />
                                </Grid>
                                <Grid item xs={12} style={{ paddingLeft: "20px", paddingBottom: "3px" }}>
                                    <Typography variant="h5" display="inline" style={{
                                        color: this.state.color,
                                        paddingRight: "4px",
                                    }}>
                                        {this.state.arrow}{text.predictedquantity}
                                    </Typography>
                                    <Typography variant="subtitle2" display="inline">
                                        orders/wk
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} style={{ paddingLeft: "10px", paddingBottom: "10px" }}>
                                    <Typography variant="subtitle2" display="inline" style={{
                                        color: this.state.color,
                                        paddingRight: "4px"
                                    }}>
                                        {plus + (parseInt(text.predictedquantity) - parseInt(text.weeklyquantity))}
                                    </Typography>
                                    <Typography variant="subtitle2" display="inline" inline>
                                        from <i>{text.weeklyquantity} orders/wk </i>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>)
            );
        }  
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
                    <ListItemText primary={text} />
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>)
        )
    }

    handleSupplyDataClickOpen = () => {
        this.setState({ supplydataopen: true });
    };

    handleCategoryAddClickOpen = () => {
        this.setState({ categoryaddopen: true });
    };

    handleCustomerClickOpen = () => {
        this.setState({ customeropen: true });
    };

    handleCategoryClickOpen = () => {
        this.setState({ categoryopen: true });
    };

    handleAccountClickOpen = () => {
        this.setState({ accountopen: true, AnchorEl: null });
    };

    handleSupplyClickOpen = (id) => {
        if (id !== "new") {
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
        this.setState({ customeropen: false });
    }

    handleCustomerClose = () => {
        this.setState({ customeropen: false });

        var input = [];
        var name = this.state.restaurauntName;
        firebase.database().ref("Accounts").once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    if (!childSnapshot.hasChild("StartWeek")) {
                        firebase.database().ref("Accounts").child(name).child("StartWeek").set({ 'day': setDate.getDate(), 'month': setDate.getMonth() + 1, 'year': setDate.getFullYear() });
                    }
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

    handleDateSelect = (date) => {
        var setDate = new Date(date);
        this.setState({
            selecteddate: setDate
        });
    }

    submitData = () => {
        var setDate = this.state.selecteddate;
        var newVal = document.getElementById("customerday").value;
        var name = this.state.restaurauntName;

        firebase.database().ref("Accounts").once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if(!childSnapshot.hasChild("StartWeek")) {
                    firebase.database().ref("Accounts").child(name).child("StartWeek").set({ 'day': setDate.getDate(), 'month': setDate.getMonth() + 1, 'year': setDate.getFullYear() });
                }
                else {
                    var dateBlock = childSnapshot.child("StartWeek").val();
                    var currentDate = new Date(dateBlock.year, dateBlock.month - 1, dateBlock.day);

                    console.log(setDate);
                    console.log(currentDate);

                    var currentCustomerList = childSnapshot.child("customersPerWeek").val();
                    const diffTime = Math.abs(setDate - currentDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    console.log(diffDays);

                    if((setDate - currentDate > 0) && diffDays < currentCustomerList.length) {
                        currentCustomerList[diffDays] = parseInt(newVal);
                    } else {
                        currentCustomerList.push(parseInt(newVal));
                    }

                    console.log(currentCustomerList);
                    firebase.database().ref("Accounts").child(name).child("customersPerWeek").set(currentCustomerList);
                }
            });
        });
    }

    handleCategoryAddClose = () => {
        var upload = document.getElementById("category").value;
        var categories = this.state.categories;
        categories.push({ id: 0, categoryName: upload })
        this.setState({
            categoryaddopen: false,
            categories: categories
        });
    };

    handleSupplyDataClose = () => {
        this.setState({
            supplydataopen: false,
        });
    };

    handleNoDataSupplyClose = () => {
        this.setState({
            supplyopen: false,
        });
    }

    handleAccountClose = () => {
        this.setState({
            accountopen: false,
        });
    };

    onRowClick = (rowIdx, row) => {
        var id = rowIdx["data"]["id"];

        if (id !== "new") {
            this.setState({
                openEdit: true,
                activesupplyid: id
            });
        }
        else {
            this.setState({
                openEdit: true,
                activesupplyid: id
            });
        }
    }

    closeNothingEdit = () => {
        this.setState({
            openEdit: false
        });
    }

    closeEdit = () => {
        var newQuantity = parseInt(document.getElementById("supply_quantity_edit").value);
        var name = "";
        var rows = this.state.rows;
        for(var i = 0; i < rows.length; i++) {
            if(rows[i].id === this.state.activesupplyid) {
                name = rows[i].item;
                rows[i].weeklyquantity = newQuantity;
                rows[i].predictedquantity = (newQuantity * (1 + (Math.abs(globalThis.state.runningAverage - globalThis.state.currentAverage) / (globalThis.state.runningAverage)))) | 0;
            }
        }

        globalThis.setState({
            rows: rows
        });

        firebase.database().ref("Accounts").child(this.state.restaurauntName).child("Supplies").child(name).child("quantity").set([newQuantity]);
       
        setTimeout(() => {
            globalThis.setState({
                openEdit: false
            });
        }, 500);
    }

    createSupply = () => {
        this.handleSupplyClickOpen("new")
    }

    manageCategory = () => {
        this.handleCategoryClickOpen()
    }

    updateSupplyData = () => {
        var db = firebase.database().ref("Accounts");
        var supplyData = this.state.rows;
        var name = this.state.restaurauntName;

        db.once('value').then(function (snapshot) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.child("resturauntName").val() === name) {
                    if (childSnapshot.child("customersPerWeek").val() != null) {
                        for (var i = 0; i < Object.keys(supplyData).length; i++) {
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
        const countryListAllIsoData = [
            { "code": "AU", "code3": "AUS", "name": "Australia", "number": "036" },
            { "code": "BN", "code3": "BRN", "name": "Brunei Darussalam", "number": "096" },
            { "code": "CA", "code3": "CAN", "name": "Canada", "number": "124" },
            { "code": "CL", "code3": "CHL", "name": "Chile", "number": "152" },
            { "code": "CN", "code3": "CHN", "name": "China", "number": "156" },
            { "code": "HK", "code3": "HKG", "name": "Hong Kong", "number": "344" },
            { "code": "ID", "code3": "IDN", "name": "Indonesia", "number": "360" },
            { "code": "JP", "code3": "JPN", "name": "Japan", "number": "392" },
            { "code": "KR", "code3": "KOR", "name": "Korea (the Republic of)", "number": "410" },
            { "code": "MY", "code3": "MYS", "name": "Malaysia", "number": "458" },
            { "code": "MX", "code3": "MEX", "name": "Mexico", "number": "484" },
            { "code": "NZ", "code3": "NZL", "name": "New Zealand", "number": "554" },
            { "code": "PG", "code3": "PNG", "name": "Papua New Guinea", "number": "598" },
            { "code": "PE", "code3": "PER", "name": "Peru", "number": "604" },
            { "code": "PH", "code3": "PHL", "name": "Philippines (the)", "number": "608" },
            { "code": "RU", "code3": "RUS", "name": "Russian Federation (the)", "number": "643" },
            { "code": "SG", "code3": "SGP", "name": "Singapore", "number": "702" },
            { "code": "TW", "code3": "TWN", "name": "Taiwan", "number": "158" },
            { "code": "TH", "code3": "THA", "name": "Thailand", "number": "764" },
            { "code": "US", "code3": "USA", "name": "United States of America (the)", "number": "840" },
            { "code": "VN", "code3": "VNM", "name": "Viet Nam", "number": "704" },
        ];
        var lastWeek = new Date(this.state.today.getFullYear(), this.state.today.getMonth(), this.state.today.getDate() - 7);
        return (
            <div>
                <AppBar position="static" style={{ backgroundColor: "#283B63" }}>
                    <Toolbar style={{ minHeight: "7vh" }}>
                        <Typography style={{ flexGrow: "1" }} variant="h6" >
                            OctoDash - {this.state.customerName}
                        </Typography>
                        <Button variant="contained" onClick={this.handleSupplyDataClickOpen} style={{ marginRight: "25px", backgroundColor: "#BFC0C0" }}>
                            Edit Supply Data
                        </Button>
                        <Button variant="contained" onClick={this.handleCustomerClickOpen} style={{ backgroundColor: "#BFC0C0" }}>
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
                            <MenuItem onClick={this.handleAccountClickOpen}>My Account</MenuItem>
                            <MenuItem onClick={this.logOut}>Log Out</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <Grid container justify="center" style={{ paddingTop: "25px", height: "93vh", backgroundColor: "#F5F5F5" }}>
                    <Grid item xs={9} style={{ paddingLeft: "25px", paddingRight: "25px" }}>
                        <Grid container spacing={3} justify="center" direction="row">
                            <Grid item xs={12} sm={3}>
                                <Grid container spacing={3} justify="center" direction="row">
                                    <Grid item xs={6}>
                                        <Paper style={{ backgroundColor: "#BFC0C0", padding: "2px" }}>
                                            <Paper style={{
                                                textAlign: "center",
                                                padding: "5px",
                                                height: "11vh",
                                                overflow: "hidden"
                                            }} elevation={5}>
                                                <Typography variant="subtitle2">
                                                    Recorded
                                                </Typography>
                                                <Typography variant="h5">
                                                    {this.state.runningAverage}
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    Customers
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    this week
                                                </Typography>
                                            </Paper>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper style={{ backgroundColor: this.state.color, padding: "2px" }}>
                                            <Paper style={{
                                                borderColor: this.state.color,
                                                borderWidth: "5px",
                                                textAlign: "center",
                                                padding: "5px",
                                                height: "11vh",
                                                overflow: "hidden",
                                            }} elevation={5}>
                                                <Typography variant="subtitle2">
                                                    Predicted
                                                </Typography>
                                                <Typography variant="h5">
                                                    {this.state.currentAverage}
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    Customers
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    next week
                                                </Typography>
                                            </Paper>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Paper style={{
                                            textAlign: "center",
                                            height: "9vh",
                                            overflow: "hidden",
                                        }} elevation={5}>
                                            <Typography variant="subtitle2">
                                                You should order
                                            </Typography>
                                            <Typography variant="h5">
                                                {this.state.percent}% <span style={{ color: this.state.color }}>{this.state.amount}</span>
                                            </Typography>
                                            <Typography variant="subtitle2">
                                                Supplies for next week
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Paper elevation={5} style={{
                                            height: "28vh"
                                        }}>
                                            <Typography style={{ textAlign: "center", paddingLeft: "15px", paddingRight: "15px", paddingTop: "15px", paddingBottom: "0px" }}>
                                                Predicted Quantity Required of Each Item Next Week
                                            </Typography>
                                            <div class="chart-container" style={{ margin: "auto", paddingBottom: "20px", paddingLeft: "15px", paddingRight: "15px", paddingTop: "0px"}}>
                                                <canvas
                                                    id="myPieChartRef"
                                                    ref={this.state.pieChartRef}
                                                    height="220px"
                                                />
                                            </div>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Paper elevation={5} style={{
                                            height: "13vh",
                                            overflow: "hidden"
                                        }}>
                                            <Typography style={{ padding: "10px", textAlign: "center" }}>Ever since you began using the Octo terminal, {this.state.restaurauntName} has had an average of {this.state.overallAverage} customers per week!</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sm={9}>
                                <Grid container spacing={3} justify="center" direction="row">
                                    <Grid item xs={12}>
                                        <Paper style={{
                                            backgroundColor: "white",
                                            height: "71vh"
                                        }} elevation={5}>
                                            <Grid container direction="row" alignItems="center" justify="center">
                                                <Grid item xs={2}>
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <Typography style={{ textAlign: "center", paddingTop: "15px" }}>
                                                        {this.state.titleGraphText}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={3} justify = "center" alignItems = "center">
                                                    <FormControl style = {{justify: "center"}}>
                                                        <InputLabel>Biweekly Data</InputLabel>
                                                        <Select
                                                            style = {{width: "150px"}}
                                                            inputProps={{ 'aria-label': 'Without label' }}
                                                            autoWidth
                                                        >
                                                            <MenuItem onClick = {() => {window.location.reload(false)}}>Next Week's Predictions</MenuItem>
                                                            <MenuItem value = {0} onClick = {this.previousWeeklyView} selected>Previous Week's Data and Next Week's Predictions</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12} style={{paddingLeft: "25px", paddingRight: "25px", paddingBottom: "25px", paddingTop: "15px"}}>
                                                <div class="chart-container" style={{height: "60vh"}}>
                                                    <canvas
                                                        id="lineChart"
                                                        ref={this.state.lineChartRef}
                                                    />
                                                </div>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3} justify="center" alignItems="center" direction="row" style={{
                                paddingTop: "15px"
                            }}>
                                {this.returnSupplyHomepage()}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={3} style={{ paddingRight: "25px" }} >
                        <Grid container spacing={3} justify="center">
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "12vh",
                                    padding: "12px",
                                    overflow: "scroll",
                                }} elevation={5}>
                                    <Typography>{this.state.newsMessage}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    overflowY: 'scroll',
                                    height: "70vh"
                                }} elevation={5}>
                                    <Skeleton variant="rect" height={"60vh"} style={{padding: "25px"}} />
                                    {this.state.uiurls}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Dialog fullWidth={true} maxWidth={'md'} open={this.state.supplydataopen} onClose={this.handleCategoryAddClose} aria-labelledby="supply-data-dialog">
                    <DialogTitle id="supply-data-dialog">Resturaunt Supplies Used</DialogTitle>
                    <DialogContent>
                        <Paper style={{
                            backgroundColor: "white",
                            height: "400px"
                        }} elevation={0}>
                            <Grid container direction="row" alignItems="center" spacing={5} style={{ padding: "25px" }}>
                                <Typography> Current Week: {this.state.dateLabels[6]} - {this.state.dateLabels[0]} </Typography>
                                <Button variant="contained" onClick={this.createSupply} style={{marginLeft: "25px", marginRight:"25px"}}> 
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
                                style={{ width: "80%", marginLeft: "10%" }}
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
                <Dialog open={this.state.openEdit} onClose = {this.closeEdit} aria-labelledby="supply-dialog">
                    <DialogTitle id="supply-dialog">Edit your weekly data for {this.state.activesupplyid}</DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Weekly Quantity"
                                id="supply_quantity_edit"
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeNothingEdit} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.closeEdit} color="primary">
                            Add Entry
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
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <Autocomplete
                                id="category_list"
                                options={this.state.categories}
                                getOptionLabel={(option) => option.categoryName}
                                style={{ width: "80%", marginLeft: "10%" }}
                                renderInput={(params) => <TextField {...params} label="Category" variant="outlined" />}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Weekly Quantity"
                                id="supply_quantity"
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleNoDataSupplyClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSupplyClose} color="primary">
                            Add Entry
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog maxWidth={"lg"} open={this.state.customeropen} onClose={this.handleCustomerClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Input your weekly data</DialogTitle>
                    <DialogContent>
                        <form>
                            <Paper style={{width: "1000px"}}>
                                <Grid container spacing={3} justify="center" direction="row">
                                    <Grid item xs={6}>
                                        <InfiniteCalendar
                                            height={400}
                                            width={500}
                                            selected={this.state.today}
                                            minDate={lastWeek}
                                            onSelect={this.handleDateSelect}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            variant="outlined"
                                            margin="normal"
                                            required
                                            fullWidth
                                            label="Customers on this day"
                                            id="customerday"
                                            style={{ width: "80%", marginLeft: "10%", marginTop: "2%", marginBottom: "2%" }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCustomerDataClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.submitData} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.accountopen} onClose={this.handleAccountClose} aria-labelledby="account-dialog">
                    <DialogTitle id="account-dialog">Edit Account Details</DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Your Name"
                                id="name"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%", marginTop: "2%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Restaurant Name"
                                id="resturauntName"
                                style={{ width: "80%", marginLeft: "10%", marginTop: "2%", marginBottom: "2%" }}
                            />
                            <Autocomplete
                                fullwidth
                                options={countryListAllIsoData}
                                getOptionLabel={(option) => option.name}
                                id="country"
                                style={{ width: "80%", marginLeft: "10%", marginTop: "2%", marginBottom: "2%" }}
                                renderInput={(params) => <TextField {...params} label="Country" variant="outlined" />}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullwidth
                                label="Username"
                                id="username"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%", marginTop: "2%", marginBottom: "2%" }}
                            />
                            <Divider />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                id="password"
                                style={{ width: "80%", marginLeft: "10%", marginTop: "2%", marginBottom: "2%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                id="confirmpassword"
                                style={{ width: "80%", marginLeft: "10%", marginTop: "2%", marginBottom: "2%" }}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleAccountClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleAccountClose} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            </div >
        )
    }
}

export default Homepage;