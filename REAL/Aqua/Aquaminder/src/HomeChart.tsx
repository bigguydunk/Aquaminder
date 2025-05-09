import React, { Component } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import './Chart.css';
import supabase from '../supabaseClient';

interface RadialBarState {
    options: ApexOptions;
    series: number[];
    aquariumID: number;
}


class RadialBar extends Component<{}, RadialBarState, { options: ApexOptions; series: number[]; aquariumID: number }> {
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
            series: [0],
            aquariumID: 1, // Example progress value
        };
    }
    async componentDidMount() {
        try {
          const { data, error } = await supabase
            .from('akuarium')
            .select('akuarium_id, jumlah_ikan_sakit, jumlah_ikan_total')
            .eq('akuarium_id', this.state.aquariumID);
          if (error) throw error;

          if (data && data.length > 0) {
          const { akuarium_id, jumlah_ikan_sakit: s, jumlah_ikan_total: t } = data[0];
          const persen     = t > 0 ? ((t-s) / t) * 100 : 0;
          this.setState({ aquariumID: akuarium_id, series: [parseFloat(persen.toFixed(2))] });
        }
        } catch (err) {
          console.error('Gagal fetch persentase:', err);
        }
      }      

    render() {
        return (
            <div className="donut">
                <Chart
                    options={this.state.options}
                    series={this.state.series}
                    type="radialBar"
                    width="100%"
                />
                <h1 className="chart-title" style={{ color: '#181619', fontWeight: 'bold' }}>
                    Aquarium {this.state.aquariumID}
                </h1>
            </div>
        );
    }
}

export default RadialBar;