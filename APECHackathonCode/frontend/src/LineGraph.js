import React, { Component } from 'react';
import Chart from "chart.js";



class LineGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
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
                    }
                ]
            },
            options: {
                //Customize chart options
            }
        });
    }

    render() {
        return (
            <div>
                <canvas
                    id="myChart"
                    ref={this.chartRef}
                />
            </div>
        )
    }
}

export default LineGraph