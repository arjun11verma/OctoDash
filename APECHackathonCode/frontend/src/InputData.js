import React, { Component } from 'react'
import { FormControl, Input, InputLabel } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';
import firebase from './firebase'
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";

const weeks = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

class InputData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            restaurauntName: ((((window.location.pathname).split("/"))[2]).replace("%20", " ")),
            open: false,
        };
    }

    uploadData = () => {
        var input = [];
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
    }


    render() {

        const handleClickOpen = () => {
            this.setState({open: true});
        };

        const handleClose = () => {
            this.setState({open: false});
        };

        return(
            <div>
                <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                    Open form dialog
                </Button>
                <Dialog open={this.state.open} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Input your weekly data</DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Monday"
                                id="monday"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Tuesday"
                                id="tuesday"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Wednesday"
                                id="wednesday"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Thursday"
                                id="thursday"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Friday"
                                id="friday"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Saturday"
                                id="saturday"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                label="Sunday"
                                id="sunday"
                                autoFocus
                                style={{width: "80%", marginLeft: "10%"}}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleClose} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>

                <Grid container direction = "column" alignItems = "center" spacing = {3} style = {{backgroundColor: "azure", width: "500px", margin: "auto", marginTop: "130px"}}>
                    <Grid item>
                        <Typography style = {{fontFamily: "Garamond", fontSize: "30px"}}>Please input the number of customers that came in each day of the week.</Typography>
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