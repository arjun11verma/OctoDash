import React, { Component } from 'react';
import Chart from "chart.js";

class LineGraph extends Component {
    chartRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            data: props.data
        }
    }
    
    componentDidMount() {
        const myChartRef = this.chartRef.current.getContext("2d");
        console.log("Quit being a faggot");
        console.log(this.state.data);

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
                        ref={this.chartRef}
                    />
                </div>                
            </div>
        )
    }
}

export default LineGraph