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
        
        new Chart(myChartRef, {
            type: "bar",
            data: {
                labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturdays", "Sundays"],
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