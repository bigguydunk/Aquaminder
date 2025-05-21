import { Component } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import './Chart.css';
import supabase from '../supabaseClient';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Card, CardContent} from './components/ui/card';


interface RadialBarState {
    options: ApexOptions;
    series: number[];
    aquariumID: number;
    akuariumDetail?: {
        akuarium_id: number;
        ikan_id: number | null;
        jumlah_ikan_sakit: number | null;
        jumlah_ikan_total: number | null;
        pegawai_bertugas: number | null;
        penyakit_id: number | null;
        reminder_cleaning: number | null;
        reminder_pakan: number | null;
    } | null;
    detailOpen?: boolean;
    penyakitName?: string | null;
    penyakitNames?: string[] | null;
}

class RadialBar2 extends Component<{}, RadialBarState, { options: ApexOptions; series: number[]; aquariumID: number }> {
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
            aquariumID: 2, // Example progress value
            akuariumDetail: null,
            detailOpen: false,
            penyakitName: null,
            penyakitNames: null,
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

    handleDetailOpen = async () => {
        try {
            const { data, error } = await supabase
                .from('akuarium')
                .select('*')
                .eq('akuarium_id', this.state.aquariumID)
                .single();
            if (error) throw error;
            let penyakitNames: string[] | null = null;
            if (data && data.akuarium_id != null) {
                const { data: apData, error: apError } = await supabase
                    .from('akuarium_penyakit')
                    .select('penyakit_id')
                    .eq('akuarium_id', data.akuarium_id);
                if (!apError && apData && apData.length > 0) {
                    const penyakitIds = apData.map((row: any) => row.penyakit_id);
                    const { data: penyakitData, error: penyakitError } = await supabase
                        .from('penyakit')
                        .select('nama_penyakit, penyakit_id')
                        .in('penyakit_id', penyakitIds);
                    if (!penyakitError && penyakitData) {
                        penyakitNames = penyakitData.map((row: any) => row.nama_penyakit);
                    }
                }
            }
            this.setState({ akuariumDetail: data, detailOpen: true, penyakitNames });
        } catch (err) {
            console.error('Gagal fetch detail akuarium:', err);
        }
    };

    handleDetailClose = () => {
        this.setState({ detailOpen: false });
    };

    render() {
        const { akuariumDetail, detailOpen } = this.state;
        return (
            <div className="donut">
                <Chart
                    options={this.state.options}
                    series={this.state.series}
                    type="radialBar"
                    width="100%"
                />
                <div style={{ marginTop: 16, marginBottom: 8 }}>
                    <Dialog open={detailOpen} onOpenChange={(open) => { if (!open) this.handleDetailClose(); }}>
                        <DialogTrigger asChild>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, minWidth: 250 }}>
                                <span style={{ fontWeight: 'bold', color: '#181619', fontSize: 24 }}> Aquarium #{this.state.aquariumID}  </span>
                                <Button variant="outline" onClick={this.handleDetailOpen} className='!bg-white focus:outline-none focus-visible:outline-none'>
                                    Detail 🔍︎ 
                                </Button>
                            </div>
                        </DialogTrigger>
                        <DialogContent style={{ maxWidth: '350px', width: '90vw', minWidth: 'unset' }}>
                            <button
                                onClick={this.handleDetailClose}
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: 15, 
                                    cursor: 'pointer',
                                    color: '#888',
                                    zIndex: 10
                                }}
                                aria-label="Close"
                            >
                                ×
                            </button>
                            <DialogTitle>Detail Akuarium #{this.state.aquariumID}</DialogTitle>
                            <DialogDescription>Semua data dari tabel akuarium untuk ID ini.</DialogDescription>
                            {akuariumDetail ? (
                                <Card>
                                    <CardContent>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <div>
                                                <b>Ikan Sehat:</b>{' '}
                                                {akuariumDetail.jumlah_ikan_total != null && akuariumDetail.jumlah_ikan_sakit != null
                                                    ? `${akuariumDetail.jumlah_ikan_total - akuariumDetail.jumlah_ikan_sakit} / ${akuariumDetail.jumlah_ikan_total}`
                                                    : '-'}
                                            </div>
                                            <div><b>Ikan Sakit:</b> {akuariumDetail.jumlah_ikan_sakit ?? '-'}</div>
                                            <div>
                                                <b>Penyakit:</b>{' '}
                                                {this.state.penyakitNames && this.state.penyakitNames.length > 0
                                                    ? this.state.penyakitNames.join(', ')
                                                    : '-'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div>Loading...</div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        );
    }
}

export default RadialBar2;