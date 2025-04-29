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
                colors: ["#20E647"],
                plotOptions: {
                    radialBar: {
                        hollow: {
                            margin: 0,
                            size: "70%",
                            background: "#293450",
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
                                color: "#fff",
                                fontSize: "13px",
                            },
                            value: {
                                color: "#fff",
                                fontSize: "30px",
                                show: true,
                            },
                        },
                    },
                },
                fill: {
                    type: "gradient",
                    gradient: {
                        shade: "dark",
                        type: "vertical",
                        gradientToColors: ["#20E647"],
                        stops: [0, 100],
                    },
                },
                stroke: {
                    lineCap: "round",
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
                <h1>Aquarium 1</h1>
            </div>
        );
    }
}

export default RadialBar;