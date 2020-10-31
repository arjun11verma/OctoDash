import React, { Component } from 'react';
import Chart from "chart.js";
import { Button } from '@material-ui/core';

class LineGraph extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            chartRef: React.createRef()
        }
    }
    
    componentDidMount() {
        const myChartRef = this.state.chartRef.current.getContext("2d");

        new Chart(myChartRef, {
            type: "line",
            data: {
                labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                datasets: [
                    {
                        label: "Customers",
                        data: this.state.data,
                        backgroundColor: [
                            'rgba(0,0,0,0)',
                        ]
                            
                    }
                ]
            },
            options: {
                layout: {
                    padding: 30
                }  
            }
        });
    }

    render() {
        return (
            <div>
                <div class="chart-container">
                    <canvas
                        id="myChart"
                        ref={this.state.chartRef}
                    />
                    <Button onClick = {this.props.click}>
                        Click to change the graph!
                    </Button>
                </div>                
            </div>
        )
    }
}

export default LineGraph