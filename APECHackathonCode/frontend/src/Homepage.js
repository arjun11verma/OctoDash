import axios from 'axios';
import React, { Component } from 'react'
import firebase from './firebase'
import LineGraph from './LineGraph'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import MenuItem from "@material-ui/core/MenuItem";
import Badge from "@material-ui/core/Badge";
import {AccountCircle} from "@material-ui/icons";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import ListItemIcon from '@material-ui/core/ListItemIcon';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import {Container, Paper} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

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
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <MenuIcon />
                        </IconButton>
                        <Typography style={{flexGrow: "1"}} variant="h6" >
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
                <Grid container justify="center" style={{paddingTop: "25px"}}>
                    <Grid item xs={9} style={{paddingLeft: "25px", paddingRight: "25px"}}>
                        <Grid container spacing={3} justify="center">
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                }} elevation={5}>
                                    <LineGraph data={(this.state.data)}></LineGraph>
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
                    <Grid item xs={3} style={{paddingRight: "25px"}}>
                        <Grid container spacing={3} justify="center">
                            <Grid item xs={12}>
                                <Paper style={{
                                    backgroundColor: "white",
                                    height: "200px"
                                }} elevation={5}>
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
            </div>
        )
    }
}

export default Homepage;