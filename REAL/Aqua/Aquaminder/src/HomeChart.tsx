import React, { Component } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import './Chart.css';

interface RadialBarState {
    options: ApexOptions;
    series: number[];
}

class RadialBar extends Component<{}, RadialBarState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            options: {
                chart: {
                    height: 280,
                    type: "radialBar",
                },
                colors: ["#3443E9"], // Updated color
                plotOptions: {
                    radialBar: {
                        hollow: {
                            margin: 0,
                            size: "50%",
                            background: "transparent", // Set to transparent
                        },
                        track: {
    
                            dropShadow: {
                                enabled: true,
                                top: 2,
                                left: 0,
                                blur: 4,
                                opacity: 0.15,
                            },
                        },
                        dataLabels: {
                            name: {
                                offsetY: -10,
                                color: "#black",
                                fontSize: "20px",
                                fontWeight: "bold",
                                show: false,
                            },
                            value: {
                                color: "#black",
                                fontSize: "40px",
                                fontWeight: "bold",
                                show: false,
                            },
                        },
                    },
                },
                fill: {
                    type: "gradient",
                    gradient: {
                        shade: "dark",
                        type: "vertical",
                        gradientToColors: ["#3443E9"], // Updated gradient color
                        stops: [0, 100],
                    },
                },
                stroke: {
                },
                labels: ["Kesehatan Ikan"],
            },
            series: [67], // Example progress value
        };
    }

    render() {
        return (
            <div className="donut">
                <Chart
                    options={this.state.options}
                    series={this.state.series}
                    type="radialBar"
                    width="380"
                />
                <h1 style={{ color: 'black', fontWeight: 'bold' }}>Aquarium 1</h1>
            </div>
        );
    }
}

export default RadialBar;