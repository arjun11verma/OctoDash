import React, { Component } from 'react'
import { Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';
import { Container } from '@material-ui/core';
import { Paper } from '@material-ui/core';
import firebase from './firebase';
import { TextField } from "@material-ui/core";
import { FormControlLabel } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    login = () => {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;

        firebase.database().ref("Accounts").once('value').then(function(snapshot) {
            snapshot.forEach(childSnapshot => {
                console.log(childSnapshot.child("username").val());
                if(childSnapshot.child("username").val() === username) {
                    if(childSnapshot.child("password").val() === password) {
                        window.open("/Homepage/" + childSnapshot.child("resturauntName").val());
                        window.close("/");
                    }
                }
            });
        });
    }

    createAccount = () => {
        window.open("/CreateAccount");
        window.close("/");
    }

    render() {
        const handleSubmit = e => {
            e.preventDefault();
            this.login()
        };
        const handleKeypress = e => {
            //it triggers by pressing the enter key
            if (e.keyCode === 13) {
                handleSubmit();
            }
        };
        return (
            <div class="animated-background" style={{height: "100vh"}}>
                <div>
                    <Container>
                        <Typography style={{paddingTop: "10%", marginBottom: "-5%", textAlign: "center"}} component="h1" variant="h3">
                            <b>Octo Dashboard</b>
                        </Typography>
                        <Typography style={{paddingTop: "5%", textAlign: "center"}} component="h1" variant="h6">
                            Supporting local businesses during unprecedented times.
                        </Typography>
                    </Container>
                    <Container component="main" maxWidth="sm" style={{paddingTop: "3%"}}>
                        <Paper style={{backgroundColor: "white", display: "flex", flexDirection: "column", alignItems: "center"}} elevation={24}>

                            <Typography style={{paddingTop: "5%", marginBottom: "2%"}} component="h1" variant="h5">
                                Sign in
                            </Typography>
                            <form>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    label="Username"
                                    id="username"
                                    autoFocus
                                    style={{width: "80%", marginLeft: "10%"}}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    id="password"
                                    style={{width: "80%", marginLeft: "10%"}}
                                />
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" />}
                                    label="Remember me"
                                    style={{width: "80%", marginLeft: "10%"}}
                                />
                                <Button
                                    onClick = {handleSubmit}
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    style={{width: "80%", marginLeft: "10%", marginTop: "3%", marginBottom: "5%"}}
                                >
                                    Sign In
                                </Button>
                                <Grid container style={{marginBottom: "5%"}}>
                                    <Grid item xs>
                                        <Link style={{width: "80%", marginLeft: "10%", marginTop: "5%", marginBottom: "5%"}} href="/CreateAccount">
                                            {"Don't have an account? Sign up!"}
                                        </Link>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Container>
                </div>
            </div>
        )
    }
}

export default Login;