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
                            <CardMedia
                                src = {info.imageUrl}
                            />
                            <CardContent>
                                <Typography variant="body1" component="h2">
                                    {info.title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    {info.authors[0]} - {info.date}
                                </Typography>
                            </CardContent>
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
            { "code": "AF", "code3": "AFG", "name": "Afghanistan", "number": "004" },
            { "code": "AL", "code3": "ALB", "name": "Albania", "number": "008" },
            { "code": "DZ", "code3": "DZA", "name": "Algeria", "number": "012" },
            { "code": "AS", "code3": "ASM", "name": "American Samoa", "number": "016" },
            { "code": "AD", "code3": "AND", "name": "Andorra", "number": "020" },
            { "code": "AO", "code3": "AGO", "name": "Angola", "number": "024" },
            { "code": "AI", "code3": "AIA", "name": "Anguilla", "number": "660" },
            { "code": "AQ", "code3": "ATA", "name": "Antarctica", "number": "010" },
            { "code": "AG", "code3": "ATG", "name": "Antigua and Barbuda", "number": "028" },
            { "code": "AR", "code3": "ARG", "name": "Argentina", "number": "032" },
            { "code": "AM", "code3": "ARM", "name": "Armenia", "number": "051" },
            { "code": "AW", "code3": "ABW", "name": "Aruba", "number": "533" },
            { "code": "AU", "code3": "AUS", "name": "Australia", "number": "036" },
            { "code": "AT", "code3": "AUT", "name": "Austria", "number": "040" },
            { "code": "AZ", "code3": "AZE", "name": "Azerbaijan", "number": "031" },
            { "code": "BS", "code3": "BHS", "name": "Bahamas (the)", "number": "044" },
            { "code": "BH", "code3": "BHR", "name": "Bahrain", "number": "048" },
            { "code": "BD", "code3": "BGD", "name": "Bangladesh", "number": "050" },
            { "code": "BB", "code3": "BRB", "name": "Barbados", "number": "052" },
            { "code": "BY", "code3": "BLR", "name": "Belarus", "number": "112" },
            { "code": "BE", "code3": "BEL", "name": "Belgium", "number": "056" },
            { "code": "BZ", "code3": "BLZ", "name": "Belize", "number": "084" },
            { "code": "BJ", "code3": "BEN", "name": "Benin", "number": "204" },
            { "code": "BM", "code3": "BMU", "name": "Bermuda", "number": "060" },
            { "code": "BT", "code3": "BTN", "name": "Bhutan", "number": "064" },
            { "code": "BO", "code3": "BOL", "name": "Bolivia (Plurinational State of)", "number": "068" },
            { "code": "BQ", "code3": "BES", "name": "Bonaire, Sint Eustatius and Saba", "number": "535" },
            { "code": "BA", "code3": "BIH", "name": "Bosnia and Herzegovina", "number": "070" },
            { "code": "BW", "code3": "BWA", "name": "Botswana", "number": "072" },
            { "code": "BV", "code3": "BVT", "name": "Bouvet Island", "number": "074" },
            { "code": "BR", "code3": "BRA", "name": "Brazil", "number": "076" },
            { "code": "IO", "code3": "IOT", "name": "British Indian Ocean Territory (the)", "number": "086" },
            { "code": "BN", "code3": "BRN", "name": "Brunei Darussalam", "number": "096" },
            { "code": "BG", "code3": "BGR", "name": "Bulgaria", "number": "100" },
            { "code": "BF", "code3": "BFA", "name": "Burkina Faso", "number": "854" },
            { "code": "BI", "code3": "BDI", "name": "Burundi", "number": "108" },
            { "code": "CV", "code3": "CPV", "name": "Cabo Verde", "number": "132" },
            { "code": "KH", "code3": "KHM", "name": "Cambodia", "number": "116" },
            { "code": "CM", "code3": "CMR", "name": "Cameroon", "number": "120" },
            { "code": "CA", "code3": "CAN", "name": "Canada", "number": "124" },
            { "code": "KY", "code3": "CYM", "name": "Cayman Islands (the)", "number": "136" },
            { "code": "CF", "code3": "CAF", "name": "Central African Republic (the)", "number": "140" },
            { "code": "TD", "code3": "TCD", "name": "Chad", "number": "148" },
            { "code": "CL", "code3": "CHL", "name": "Chile", "number": "152" },
            { "code": "CN", "code3": "CHN", "name": "China", "number": "156" },
            { "code": "CX", "code3": "CXR", "name": "Christmas Island", "number": "162" },
            { "code": "CC", "code3": "CCK", "name": "Cocos (Keeling) Islands (the)", "number": "166" },
            { "code": "CO", "code3": "COL", "name": "Colombia", "number": "170" },
            { "code": "KM", "code3": "COM", "name": "Comoros (the)", "number": "174" },
            { "code": "CD", "code3": "COD", "name": "Congo (the Democratic Republic of the)", "number": "180" },
            { "code": "CG", "code3": "COG", "name": "Congo (the)", "number": "178" },
            { "code": "CK", "code3": "COK", "name": "Cook Islands (the)", "number": "184" },
            { "code": "CR", "code3": "CRI", "name": "Costa Rica", "number": "188" },
            { "code": "HR", "code3": "HRV", "name": "Croatia", "number": "191" },
            { "code": "CU", "code3": "CUB", "name": "Cuba", "number": "192" },
            { "code": "CW", "code3": "CUW", "name": "Curaçao", "number": "531" },
            { "code": "CY", "code3": "CYP", "name": "Cyprus", "number": "196" },
            { "code": "CZ", "code3": "CZE", "name": "Czechia", "number": "203" },
            { "code": "CI", "code3": "CIV", "name": "Côte d'Ivoire", "number": "384" },
            { "code": "DK", "code3": "DNK", "name": "Denmark", "number": "208" },
            { "code": "DJ", "code3": "DJI", "name": "Djibouti", "number": "262" },
            { "code": "DM", "code3": "DMA", "name": "Dominica", "number": "212" },
            { "code": "DO", "code3": "DOM", "name": "Dominican Republic (the)", "number": "214" },
            { "code": "EC", "code3": "ECU", "name": "Ecuador", "number": "218" },
            { "code": "EG", "code3": "EGY", "name": "Egypt", "number": "818" },
            { "code": "SV", "code3": "SLV", "name": "El Salvador", "number": "222" },
            { "code": "GQ", "code3": "GNQ", "name": "Equatorial Guinea", "number": "226" },
            { "code": "ER", "code3": "ERI", "name": "Eritrea", "number": "232" },
            { "code": "EE", "code3": "EST", "name": "Estonia", "number": "233" },
            { "code": "SZ", "code3": "SWZ", "name": "Eswatini", "number": "748" },
            { "code": "ET", "code3": "ETH", "name": "Ethiopia", "number": "231" },
            { "code": "FK", "code3": "FLK", "name": "Falkland Islands (the) [Malvinas]", "number": "238" },
            { "code": "FO", "code3": "FRO", "name": "Faroe Islands (the)", "number": "234" },
            { "code": "FJ", "code3": "FJI", "name": "Fiji", "number": "242" },
            { "code": "FI", "code3": "FIN", "name": "Finland", "number": "246" },
            { "code": "FR", "code3": "FRA", "name": "France", "number": "250" },
            { "code": "GF", "code3": "GUF", "name": "French Guiana", "number": "254" },
            { "code": "PF", "code3": "PYF", "name": "French Polynesia", "number": "258" },
            { "code": "TF", "code3": "ATF", "name": "French Southern Territories (the)", "number": "260" },
            { "code": "GA", "code3": "GAB", "name": "Gabon", "number": "266" },
            { "code": "GM", "code3": "GMB", "name": "Gambia (the)", "number": "270" },
            { "code": "GE", "code3": "GEO", "name": "Georgia", "number": "268" },
            { "code": "DE", "code3": "DEU", "name": "Germany", "number": "276" },
            { "code": "GH", "code3": "GHA", "name": "Ghana", "number": "288" },
            { "code": "GI", "code3": "GIB", "name": "Gibraltar", "number": "292" },
            { "code": "GR", "code3": "GRC", "name": "Greece", "number": "300" },
            { "code": "GL", "code3": "GRL", "name": "Greenland", "number": "304" },
            { "code": "GD", "code3": "GRD", "name": "Grenada", "number": "308" },
            { "code": "GP", "code3": "GLP", "name": "Guadeloupe", "number": "312" },
            { "code": "GU", "code3": "GUM", "name": "Guam", "number": "316" },
            { "code": "GT", "code3": "GTM", "name": "Guatemala", "number": "320" },
            { "code": "GG", "code3": "GGY", "name": "Guernsey", "number": "831" },
            { "code": "GN", "code3": "GIN", "name": "Guinea", "number": "324" },
            { "code": "GW", "code3": "GNB", "name": "Guinea-Bissau", "number": "624" },
            { "code": "GY", "code3": "GUY", "name": "Guyana", "number": "328" },
            { "code": "HT", "code3": "HTI", "name": "Haiti", "number": "332" },
            { "code": "HM", "code3": "HMD", "name": "Heard Island and McDonald Islands", "number": "334" },
            { "code": "VA", "code3": "VAT", "name": "Holy See (the)", "number": "336" },
            { "code": "HN", "code3": "HND", "name": "Honduras", "number": "340" },
            { "code": "HK", "code3": "HKG", "name": "Hong Kong", "number": "344" },
            { "code": "HU", "code3": "HUN", "name": "Hungary", "number": "348" },
            { "code": "IS", "code3": "ISL", "name": "Iceland", "number": "352" },
            { "code": "IN", "code3": "IND", "name": "India", "number": "356" },
            { "code": "ID", "code3": "IDN", "name": "Indonesia", "number": "360" },
            { "code": "IR", "code3": "IRN", "name": "Iran (Islamic Republic of)", "number": "364" },
            { "code": "IQ", "code3": "IRQ", "name": "Iraq", "number": "368" },
            { "code": "IE", "code3": "IRL", "name": "Ireland", "number": "372" },
            { "code": "IM", "code3": "IMN", "name": "Isle of Man", "number": "833" },
            { "code": "IL", "code3": "ISR", "name": "Israel", "number": "376" },
            { "code": "IT", "code3": "ITA", "name": "Italy", "number": "380" },
            { "code": "JM", "code3": "JAM", "name": "Jamaica", "number": "388" },
            { "code": "JP", "code3": "JPN", "name": "Japan", "number": "392" },
            { "code": "JE", "code3": "JEY", "name": "Jersey", "number": "832" },
            { "code": "JO", "code3": "JOR", "name": "Jordan", "number": "400" },
            { "code": "KZ", "code3": "KAZ", "name": "Kazakhstan", "number": "398" },
            { "code": "KE", "code3": "KEN", "name": "Kenya", "number": "404" },
            { "code": "KI", "code3": "KIR", "name": "Kiribati", "number": "296" },
            { "code": "KP", "code3": "PRK", "name": "Korea (the Democratic People's Republic of)", "number": "408" },
            { "code": "KR", "code3": "KOR", "name": "Korea (the Republic of)", "number": "410" },
            { "code": "KW", "code3": "KWT", "name": "Kuwait", "number": "414" },
            { "code": "KG", "code3": "KGZ", "name": "Kyrgyzstan", "number": "417" },
            { "code": "LA", "code3": "LAO", "name": "Lao People's Democratic Republic (the)", "number": "418" },
            { "code": "LV", "code3": "LVA", "name": "Latvia", "number": "428" },
            { "code": "LB", "code3": "LBN", "name": "Lebanon", "number": "422" },
            { "code": "LS", "code3": "LSO", "name": "Lesotho", "number": "426" },
            { "code": "LR", "code3": "LBR", "name": "Liberia", "number": "430" },
            { "code": "LY", "code3": "LBY", "name": "Libya", "number": "434" },
            { "code": "LI", "code3": "LIE", "name": "Liechtenstein", "number": "438" },
            { "code": "LT", "code3": "LTU", "name": "Lithuania", "number": "440" },
            { "code": "LU", "code3": "LUX", "name": "Luxembourg", "number": "442" },
            { "code": "MO", "code3": "MAC", "name": "Macao", "number": "446" },
            { "code": "MG", "code3": "MDG", "name": "Madagascar", "number": "450" },
            { "code": "MW", "code3": "MWI", "name": "Malawi", "number": "454" },
            { "code": "MY", "code3": "MYS", "name": "Malaysia", "number": "458" },
            { "code": "MV", "code3": "MDV", "name": "Maldives", "number": "462" },
            { "code": "ML", "code3": "MLI", "name": "Mali", "number": "466" },
            { "code": "MT", "code3": "MLT", "name": "Malta", "number": "470" },
            { "code": "MH", "code3": "MHL", "name": "Marshall Islands (the)", "number": "584" },
            { "code": "MQ", "code3": "MTQ", "name": "Martinique", "number": "474" },
            { "code": "MR", "code3": "MRT", "name": "Mauritania", "number": "478" },
            { "code": "MU", "code3": "MUS", "name": "Mauritius", "number": "480" },
            { "code": "YT", "code3": "MYT", "name": "Mayotte", "number": "175" },
            { "code": "MX", "code3": "MEX", "name": "Mexico", "number": "484" },
            { "code": "FM", "code3": "FSM", "name": "Micronesia (Federated States of)", "number": "583" },
            { "code": "MD", "code3": "MDA", "name": "Moldova (the Republic of)", "number": "498" },
            { "code": "MC", "code3": "MCO", "name": "Monaco", "number": "492" },
            { "code": "MN", "code3": "MNG", "name": "Mongolia", "number": "496" },
            { "code": "ME", "code3": "MNE", "name": "Montenegro", "number": "499" },
            { "code": "MS", "code3": "MSR", "name": "Montserrat", "number": "500" },
            { "code": "MA", "code3": "MAR", "name": "Morocco", "number": "504" },
            { "code": "MZ", "code3": "MOZ", "name": "Mozambique", "number": "508" },
            { "code": "MM", "code3": "MMR", "name": "Myanmar", "number": "104" },
            { "code": "NA", "code3": "NAM", "name": "Namibia", "number": "516" },
            { "code": "NR", "code3": "NRU", "name": "Nauru", "number": "520" },
            { "code": "NP", "code3": "NPL", "name": "Nepal", "number": "524" },
            { "code": "NL", "code3": "NLD", "name": "Netherlands (the)", "number": "528" },
            { "code": "NC", "code3": "NCL", "name": "New Caledonia", "number": "540" },
            { "code": "NZ", "code3": "NZL", "name": "New Zealand", "number": "554" },
            { "code": "NI", "code3": "NIC", "name": "Nicaragua", "number": "558" },
            { "code": "NE", "code3": "NER", "name": "Niger (the)", "number": "562" },
            { "code": "NG", "code3": "NGA", "name": "Nigeria", "number": "566" },
            { "code": "NU", "code3": "NIU", "name": "Niue", "number": "570" },
            { "code": "NF", "code3": "NFK", "name": "Norfolk Island", "number": "574" },
            { "code": "MP", "code3": "MNP", "name": "Northern Mariana Islands (the)", "number": "580" },
            { "code": "NO", "code3": "NOR", "name": "Norway", "number": "578" },
            { "code": "OM", "code3": "OMN", "name": "Oman", "number": "512" },
            { "code": "PK", "code3": "PAK", "name": "Pakistan", "number": "586" },
            { "code": "PW", "code3": "PLW", "name": "Palau", "number": "585" },
            { "code": "PS", "code3": "PSE", "name": "Palestine, State of", "number": "275" },
            { "code": "PA", "code3": "PAN", "name": "Panama", "number": "591" },
            { "code": "PG", "code3": "PNG", "name": "Papua New Guinea", "number": "598" },
            { "code": "PY", "code3": "PRY", "name": "Paraguay", "number": "600" },
            { "code": "PE", "code3": "PER", "name": "Peru", "number": "604" },
            { "code": "PH", "code3": "PHL", "name": "Philippines (the)", "number": "608" },
            { "code": "PN", "code3": "PCN", "name": "Pitcairn", "number": "612" },
            { "code": "PL", "code3": "POL", "name": "Poland", "number": "616" },
            { "code": "PT", "code3": "PRT", "name": "Portugal", "number": "620" },
            { "code": "PR", "code3": "PRI", "name": "Puerto Rico", "number": "630" },
            { "code": "QA", "code3": "QAT", "name": "Qatar", "number": "634" },
            { "code": "MK", "code3": "MKD", "name": "Republic of North Macedonia", "number": "807" },
            { "code": "RO", "code3": "ROU", "name": "Romania", "number": "642" },
            { "code": "RU", "code3": "RUS", "name": "Russian Federation (the)", "number": "643" },
            { "code": "RW", "code3": "RWA", "name": "Rwanda", "number": "646" },
            { "code": "RE", "code3": "REU", "name": "Réunion", "number": "638" },
            { "code": "BL", "code3": "BLM", "name": "Saint Barthélemy", "number": "652" },
            { "code": "SH", "code3": "SHN", "name": "Saint Helena, Ascension and Tristan da Cunha", "number": "654" },
            { "code": "KN", "code3": "KNA", "name": "Saint Kitts and Nevis", "number": "659" },
            { "code": "LC", "code3": "LCA", "name": "Saint Lucia", "number": "662" },
            { "code": "MF", "code3": "MAF", "name": "Saint Martin (French part)", "number": "663" },
            { "code": "PM", "code3": "SPM", "name": "Saint Pierre and Miquelon", "number": "666" },
            { "code": "VC", "code3": "VCT", "name": "Saint Vincent and the Grenadines", "number": "670" },
            { "code": "WS", "code3": "WSM", "name": "Samoa", "number": "882" },
            { "code": "SM", "code3": "SMR", "name": "San Marino", "number": "674" },
            { "code": "ST", "code3": "STP", "name": "Sao Tome and Principe", "number": "678" },
            { "code": "SA", "code3": "SAU", "name": "Saudi Arabia", "number": "682" },
            { "code": "SN", "code3": "SEN", "name": "Senegal", "number": "686" },
            { "code": "RS", "code3": "SRB", "name": "Serbia", "number": "688" },
            { "code": "SC", "code3": "SYC", "name": "Seychelles", "number": "690" },
            { "code": "SL", "code3": "SLE", "name": "Sierra Leone", "number": "694" },
            { "code": "SG", "code3": "SGP", "name": "Singapore", "number": "702" },
            { "code": "SX", "code3": "SXM", "name": "Sint Maarten (Dutch part)", "number": "534" },
            { "code": "SK", "code3": "SVK", "name": "Slovakia", "number": "703" },
            { "code": "SI", "code3": "SVN", "name": "Slovenia", "number": "705" },
            { "code": "SB", "code3": "SLB", "name": "Solomon Islands", "number": "090" },
            { "code": "SO", "code3": "SOM", "name": "Somalia", "number": "706" },
            { "code": "ZA", "code3": "ZAF", "name": "South Africa", "number": "710" },
            { "code": "GS", "code3": "SGS", "name": "South Georgia and the South Sandwich Islands", "number": "239" },
            { "code": "SS", "code3": "SSD", "name": "South Sudan", "number": "728" },
            { "code": "ES", "code3": "ESP", "name": "Spain", "number": "724" },
            { "code": "LK", "code3": "LKA", "name": "Sri Lanka", "number": "144" },
            { "code": "SD", "code3": "SDN", "name": "Sudan (the)", "number": "729" },
            { "code": "SR", "code3": "SUR", "name": "Suriname", "number": "740" },
            { "code": "SJ", "code3": "SJM", "name": "Svalbard and Jan Mayen", "number": "744" },
            { "code": "SE", "code3": "SWE", "name": "Sweden", "number": "752" },
            { "code": "CH", "code3": "CHE", "name": "Switzerland", "number": "756" },
            { "code": "SY", "code3": "SYR", "name": "Syrian Arab Republic", "number": "760" },
            { "code": "TW", "code3": "TWN", "name": "Taiwan", "number": "158" },
            { "code": "TJ", "code3": "TJK", "name": "Tajikistan", "number": "762" },
            { "code": "TZ", "code3": "TZA", "name": "Tanzania, United Republic of", "number": "834" },
            { "code": "TH", "code3": "THA", "name": "Thailand", "number": "764" },
            { "code": "TL", "code3": "TLS", "name": "Timor-Leste", "number": "626" },
            { "code": "TG", "code3": "TGO", "name": "Togo", "number": "768" },
            { "code": "TK", "code3": "TKL", "name": "Tokelau", "number": "772" },
            { "code": "TO", "code3": "TON", "name": "Tonga", "number": "776" },
            { "code": "TT", "code3": "TTO", "name": "Trinidad and Tobago", "number": "780" },
            { "code": "TN", "code3": "TUN", "name": "Tunisia", "number": "788" },
            { "code": "TR", "code3": "TUR", "name": "Turkey", "number": "792" },
            { "code": "TM", "code3": "TKM", "name": "Turkmenistan", "number": "795" },
            { "code": "TC", "code3": "TCA", "name": "Turks and Caicos Islands (the)", "number": "796" },
            { "code": "TV", "code3": "TUV", "name": "Tuvalu", "number": "798" },
            { "code": "UG", "code3": "UGA", "name": "Uganda", "number": "800" },
            { "code": "UA", "code3": "UKR", "name": "Ukraine", "number": "804" },
            { "code": "AE", "code3": "ARE", "name": "United Arab Emirates (the)", "number": "784" },
            { "code": "GB", "code3": "GBR", "name": "United Kingdom of Great Britain and Northern Ireland (the)", "number": "826" },
            { "code": "UM", "code3": "UMI", "name": "United States Minor Outlying Islands (the)", "number": "581" },
            { "code": "US", "code3": "USA", "name": "United States of America (the)", "number": "840" },
            { "code": "UY", "code3": "URY", "name": "Uruguay", "number": "858" },
            { "code": "UZ", "code3": "UZB", "name": "Uzbekistan", "number": "860" },
            { "code": "VU", "code3": "VUT", "name": "Vanuatu", "number": "548" },
            { "code": "VE", "code3": "VEN", "name": "Venezuela (Bolivarian Republic of)", "number": "862" },
            { "code": "VN", "code3": "VNM", "name": "Viet Nam", "number": "704" },
            { "code": "VG", "code3": "VGB", "name": "Virgin Islands (British)", "number": "092" },
            { "code": "VI", "code3": "VIR", "name": "Virgin Islands (U.S.)", "number": "850" },
            { "code": "WF", "code3": "WLF", "name": "Wallis and Futuna", "number": "876" },
            { "code": "EH", "code3": "ESH", "name": "Western Sahara", "number": "732" },
            { "code": "YE", "code3": "YEM", "name": "Yemen", "number": "887" },
            { "code": "ZM", "code3": "ZMB", "name": "Zambia", "number": "894" },
            { "code": "ZW", "code3": "ZWE", "name": "Zimbabwe", "number": "716" },
            { "code": "AX", "code3": "ALA", "name": "Åland Islands", "number": "248" }
        ];
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
                                            <Typography style={{ textAlign: "center", paddingLeft: "15px", paddingRight: "15px", paddingTop: "15px", paddingBottom: "10px" }}>
                                                Predicted Quantity Required of Each Item Next Week
                                            </Typography>
                                            <div class="chart-container" style={{ margin: "auto", paddingBottom: "20px", paddingLeft: "15px", paddingRight: "15px"}}>
                                                <canvas
                                                    id="myPieChartRef"
                                                    ref={this.state.pieChartRef}
                                                    height="200px"
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
                                label={this.state.dateLabels[6]}
                                id="mon"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label={this.state.dateLabels[5]}
                                id="tue"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label={this.state.dateLabels[4]}
                                id="wed"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label={this.state.dateLabels[3]}
                                id="thu"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label={this.state.dateLabels[2]}
                                id="fri"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label={this.state.dateLabels[1]}
                                id="sat"
                                autoFocus
                                style={{ width: "80%", marginLeft: "10%" }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label={this.state.dateLabels[0]}
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