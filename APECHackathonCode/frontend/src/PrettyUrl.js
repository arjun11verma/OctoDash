import Typography from 'material-ui/styles/typography';
import React, { Component } from 'react'
import { Card } from '@material-ui/core'
import { CardContent } from '@material-ui/core'
import { Button } from '@material-ui/core'
import { CardActions } from '@material-ui/core'

class PrettyUrl extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return ( 
            <div>
                <Card variant="outlined">
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Doot  
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size = "medium">Check it out homie</Button>
                    </CardActions>
                </Card>
            </div>
        )     
    }
}

export default PrettyUrl;