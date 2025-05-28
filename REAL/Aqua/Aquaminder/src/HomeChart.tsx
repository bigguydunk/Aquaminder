import { Component } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import './Chart.css';
import supabase from '../supabaseClient';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';

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
    isMdOrAbove: boolean;
}

class RadialBar extends Component<{}, RadialBarState, { options: ApexOptions; series: number[]; aquariumID: number }> {
    constructor(props: {}) {
        super(props);

        this.state = {
            options: {
                chart: {
                    height: 450, // was 280
                    type: "radialBar",
                },
                colors: ["#4F8FBF"], // Updated color
                plotOptions: {
                    radialBar: {
                        hollow: {
                            margin: 0,
                            size: "70%", // was 70%, make donut ring thicker
                            background: "transparent",
                        },
                        track: {
                            background: '#FFE3B3',
                            strokeWidth: '100%',
                            margin: 0,
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
                    type: "solid",
                    gradient: {
                        shade: "dark",
                        type: "vertical",
                        gradientToColors: ["#4F8FBF"], // Updated gradient color
                        stops: [0, 100],
                    },
                },
                stroke: {
                },
                labels: ["Kesehatan Ikan"],
            },
            series: [0],
            aquariumID: 1, // Example progress value
            akuariumDetail: null,
            detailOpen: false,
            penyakitName: null,
            penyakitNames: null,
            isMdOrAbove: window.innerWidth >= 768, // md breakpoint (Tailwind: 768px)
        } as any;
    }

    updateIsMdOrAbove = () => {
        this.setState({ isMdOrAbove: window.innerWidth >= 768 });
    };

    async fetchDetailData() {
        try {
            const { data, error } = await supabase
                .from('akuarium')
                .select('*')
                .eq('akuarium_id', this.state.aquariumID)
                .single();
            if (error) throw error;
            let penyakitNames: string[] | null = null;
            if (data && data.akuarium_id != null) {
                // Fetch all penyakit_ids for this akuarium from the join table
                const { data: apData, error: apError } = await supabase
                    .from('akuarium_penyakit')
                    .select('penyakit_id')
                    .eq('akuarium_id', data.akuarium_id);
                if (!apError && apData && apData.length > 0) {
                    const penyakitIds = apData.map((row: any) => row.penyakit_id);
                    // Fetch all penyakit names in one query
                    const { data: penyakitData, error: penyakitError } = await supabase
                        .from('penyakit')
                        .select('nama_penyakit, penyakit_id')
                        .in('penyakit_id', penyakitIds);
                    if (!penyakitError && penyakitData) {
                        penyakitNames = penyakitData.map((row: any) => row.nama_penyakit);
                    }
                }
            }
            this.setState({ akuariumDetail: data, penyakitNames });
        } catch (err) {
            console.error('Gagal fetch detail akuarium:', err);
        }
    }

    async componentDidMount() {
        window.addEventListener('resize', this.updateIsMdOrAbove);
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
        if (this.state.isMdOrAbove) {
            this.fetchDetailData();
        }
      }      

    componentDidUpdate(_prevProps: {}, prevState: RadialBarState) {
        // If screen size changes to md+ or aquariumID changes, fetch detail data
        if ((this.state.isMdOrAbove && !prevState.isMdOrAbove) ||
            (this.state.isMdOrAbove && this.state.aquariumID !== prevState.aquariumID)) {
            this.fetchDetailData();
        }
    }

    handleDetailOpen = async () => {
        if (!this.state.akuariumDetail || !this.state.isMdOrAbove) {
            await this.fetchDetailData();
        }
        this.setState({ detailOpen: true });
    };

    handleDetailClose = () => {
        this.setState({ detailOpen: false });
    };

    render() {
        const { akuariumDetail, detailOpen, isMdOrAbove } = this.state as any;
        return (
            <div className="flex md:flex-col flex-row  items-center justify-center w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto p-2 bg-transparent rounded-xl transition-all">
                <div className="w-full flex flex-col items-center">
                    <Chart
                        options={this.state.options}
                        series={this.state.series}
                        type="radialBar"
                        width="100%"
                        height="100%"
                    />
                </div>
                <div className="w-full flex flex-col items-cente mt-4 mb-2">
                    {isMdOrAbove ? (
                        // Inline content for md and above
                        <div className="flex flex-col items-center gap-2 min-w-[250px]">
                            <span className="font-bold text-[#FFE3B3] text-2xl">Aquarium {this.state.aquariumID}</span>
                            <div className="max-w-xs w-[90vw] min-w-0 relative">
                                {akuariumDetail ? (
                                    <Card className="bg-[#FFE3B3] text-[#26648B] shadow-md">
                                        <CardContent>
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <b>Ikan Sehat:</b>{" "}
                                                    {akuariumDetail.jumlah_ikan_total != null && akuariumDetail.jumlah_ikan_sakit != null
                                                        ? `${akuariumDetail.jumlah_ikan_total - akuariumDetail.jumlah_ikan_sakit} / ${akuariumDetail.jumlah_ikan_total}`
                                                        : "-"}
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
                            </div>
                        </div>
                    ) : (
                        // Dialog popup for mobile
                        <Dialog open={detailOpen} onOpenChange={(open) => { if (!open) this.handleDetailClose(); }}>
                            <DialogTrigger asChild>
                                <div className="flex flex-col items-center gap-2 min-w-[250px]">
                                    <span className="font-bold text-[#FFE3B3] text-2xl">Aquarium {this.state.aquariumID}</span>
                                    <Button
                                        variant="outline"
                                        onClick={this.handleDetailOpen}
                                        className="!bg-[#4F8FBF] focus:outline-none shadow-md focus-visible:outline-none text-[#FFE3B3]"
                                    >
                                        Detail 🔍︎
                                    </Button>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-xs w-[90vw] min-w-0">
                                <button
                                    onClick={this.handleDetailClose}
                                    className="absolute top-2 right-2 bg-transparent border-none text-lg text-gray-500 hover:text-gray-800 font-bold focus:outline-none z-10"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                                <DialogTitle>Detail Akuarium #{this.state.aquariumID}</DialogTitle>
                                <DialogDescription>Semua data dari tabel akuarium untuk ID ini.</DialogDescription>
                                {akuariumDetail ? (
                                    <Card>
                                        <CardContent>
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <b>Ikan Sehat:</b>{" "}
                                                    {akuariumDetail.jumlah_ikan_total != null && akuariumDetail.jumlah_ikan_sakit != null
                                                        ? `${akuariumDetail.jumlah_ikan_total - akuariumDetail.jumlah_ikan_sakit} / ${akuariumDetail.jumlah_ikan_total}`
                                                        : "-"}
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
                    )}
                </div>
            </div>
        );
    }
}

export default RadialBar;