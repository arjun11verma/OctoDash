import React, { Component } from 'react';
import { FormControl, Input, InputLabel } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { AppBar } from '@material-ui/core';
import { Button } from '@material-ui/core';
import firebase from './firebase';

class CreateAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    uploadAccount = () => {
        var username = document.getElementById("usernameinput");
        var password = document.getElementById("passwordinput");
        var resturauntName = document.getElementById("resturauntinput");

        firebase.database().ref("Accounts").child(resturauntName.value).child("resturauntName").set(resturauntName.value);
        firebase.database().ref("Accounts").child(resturauntName.value).child("username").set(username.value);
        firebase.database().ref("Accounts").child(resturauntName.value).child("password").set(password.value);
        
        window.open("/"); // create a seperate class with all of your data when you need it on login 
        window.close("/CreateAccount");
    }

    render() {
        return (
            <div>
                <AppBar style={{ color: "CFDBD5", textAlign: "center" }}> <Typography style={{ fontFamily: "Garamond", fontSize: "40px" }}>LavaLAMP - Create An Account</Typography></AppBar>
                
                <Grid container direction = "column" alignItems = "center" spacing = {3} style = {{backgroundColor: "azure", width: "500px", margin: "auto", marginTop: "230px"}}>
                    <Grid item>
                        <Typography style = {{fontFamily: "Garamond", fontSize: "30px"}}>Please fill out the following fields</Typography>
                    </Grid>
                    <Grid item>
                        <FormControl>
                            <InputLabel htmlFor="usernameinput" style = {{fontSize: "20px"}}>Your username</InputLabel>
                            <Input id="usernameinput" style = {{fontSize: "20px"}}/>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <FormControl>
                            <InputLabel htmlFor="passwordinput" style = {{fontSize: "20px"}}>Your password</InputLabel>
                            <Input id="passwordinput" style = {{fontSize: "20px"}}/>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <FormControl>
                            <InputLabel htmlFor="resturauntinput" style = {{fontSize: "20px"}}>Name of your resturaunt</InputLabel>
                            <Input id="resturauntinput" style = {{fontSize: "20px"}}/>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <Button onClick = {this.uploadAccount} style = {{fontFamily: "Garamond", fontSize: "20px"}}>Click to create an account!</Button>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default CreateAccount;