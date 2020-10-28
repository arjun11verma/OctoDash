import React, { Component } from 'react'
import { FormControl, Input, InputLabel } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { AppBar } from '@material-ui/core';
import { Button } from '@material-ui/core';
import firebase from './firebase'

const weeks = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

class InputData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            restaurauntName: ((((window.location.pathname).split("/"))[2]).replace("%20", " "))
        };
    }

    uploadData = () => {
        var input = [];
        var name = this.state.restaurauntName;
        firebase.database().ref("Accounts").once('value').then(function(snapshot) {
            snapshot.forEach(childSnapshot => {
                if(childSnapshot.child("resturauntName").val() === name) {
                    input = childSnapshot.child("customersPerWeek").val();
                }
            });
        });

        setTimeout(() => { 
            for(var i = 0; i < 7; i++) {
                var upload = document.getElementById(weeks[i]).value;
                upload = parseInt(upload);
                input.push(upload);
                document.getElementById(weeks[i]).value = ""; 
            }
    
            firebase.database().ref("Accounts").child(name).child("customersPerWeek").set(input);

            
        }, 600);
    }

    render() {
        return(
            <div>
                <Grid container direction = "column" alignItems = "center" spacing = {3} style = {{backgroundColor: "azure", width: "500px", margin: "auto", marginTop: "130px"}}>
                    <Grid item>
                        <Typography style = {{fontFamily: "Garamond", fontSize: "30px"}}>Please input the number of customers that came in each day of the week</Typography>
                    </Grid>
                    <Grid item>
                        <FormControl>
                            <InputLabel htmlFor="mon" style = {{fontSize: "20px"}}>Monday</InputLabel>
                            <Input id="mon" style = {{fontSize: "20px"}}/>
                        </FormControl>
                        <FormControl>
                            <InputLabel htmlFor="tue" style = {{fontSize: "20px"}}>Tuesday</InputLabel>
                            <Input id="tue" style = {{fontSize: "20px"}}/>
                        </FormControl>
                        <FormControl>
                            <InputLabel htmlFor="wed" style = {{fontSize: "20px"}}>Wednesday</InputLabel>
                            <Input id="wed" style = {{fontSize: "20px"}}/>
                        </FormControl>
                        <FormControl>
                            <InputLabel htmlFor="thu" style = {{fontSize: "20px"}}>Thursday</InputLabel>
                            <Input id="thu" style = {{fontSize: "20px"}}/>
                        </FormControl>
                        <FormControl>
                            <InputLabel htmlFor="fri" style = {{fontSize: "20px"}}>Friday</InputLabel>
                            <Input id="fri" style = {{fontSize: "20px"}}/>
                        </FormControl>
                        <FormControl>
                            <InputLabel htmlFor="sat" style = {{fontSize: "20px"}}>Saturday</InputLabel>
                            <Input id="sat" style = {{fontSize: "20px"}}/>
                        </FormControl>
                        <FormControl>
                            <InputLabel htmlFor="sun" style = {{fontSize: "20px"}}>Sunday</InputLabel>
                            <Input id="sun" style = {{fontSize: "20px"}}/>
                        </FormControl>
                    </Grid>
                    <Grid item>
                        <Button onClick = {this.uploadData}>Upload the data!</Button>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default InputData;