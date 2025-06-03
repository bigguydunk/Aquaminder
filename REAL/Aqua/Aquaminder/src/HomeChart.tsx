import { Component } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import './Chart.css';
import supabase from '../supabaseClient';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { BiInfoCircle } from "react-icons/bi";
import { Link } from 'react-router-dom';

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
    penyakitIds?: number[] | null;
    isMdOrAbove: boolean;
    editableDialogOpen?: boolean; // <-- Added
    allPenyakit: { penyakit_id: number, nama_penyakit: string }[] | null;
    selectedPenyakitIds: number[];
}

interface RadialBarProps {
    aquariumID: number;
}

class RadialBar extends Component<RadialBarProps, RadialBarState, { options: ApexOptions; series: number[]; aquariumID: number }> {
    editableFields = {
        total: '',
        sakit: '',
        penyakit: '',
    };

    constructor(props: RadialBarProps) {
        super(props);
        this.state = {
            ...this.defaultState(props.aquariumID)
        };
    }

    defaultState(aquariumID: number): RadialBarState {
        return {
            options: {
                chart: {
                    height: 450,
                    type: "radialBar",
                },
                colors: ["#4F8FBF"],
                plotOptions: {
                    radialBar: {
                        hollow: {
                            margin: 0,
                            size: "70%",
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
                        gradientToColors: ["#4F8FBF"],
                        stops: [0, 100],
                    },
                },
                stroke: {},
                labels: ["Kesehatan Ikan"],
            },
            series: [0],
            aquariumID,
            akuariumDetail: null,
            detailOpen: false,
            penyakitName: null,
            penyakitNames: null,
            penyakitIds: null,
            isMdOrAbove: window.innerWidth >= 768,
            editableDialogOpen: false,
            allPenyakit: null,
            selectedPenyakitIds: [],
        };
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
            let penyakitIds: number[] | null = null;
            if (data && data.akuarium_id != null) {
                // Fetch penyakit_id
                const { data: apData, error: apError } = await supabase
                    .from('akuarium_penyakit')
                    .select('penyakit_id')
                    .eq('akuarium_id', data.akuarium_id);
                if (!apError && apData && apData.length > 0) {
                    const penyakitIdsArr = apData.map((row: any) => row.penyakit_id);
                    // Fetch penyakit names and ids in one query
                    const { data: penyakitData, error: penyakitError } = await supabase
                        .from('penyakit')
                        .select('nama_penyakit, penyakit_id')
                        .in('penyakit_id', penyakitIdsArr);
                    if (!penyakitError && penyakitData) {
                        penyakitNames = penyakitData.map((row: any) => row.nama_penyakit);
                        penyakitIds = penyakitData.map((row: any) => row.penyakit_id);
                        // Store nama dan id penyakit
                        this.setState({
                            akuariumDetail: data,
                            penyakitNames,
                            penyakitIds
                        });
                        return;
                    }
                }
            }
            this.setState({ akuariumDetail: data, penyakitNames, penyakitIds: null });
        } catch (err) {
            console.error('Gagal fetch detail akuarium:', err);
        }
    }

    async componentDidMount() {
        window.addEventListener('resize', this.updateIsMdOrAbove);
        await this.fetchAndSetData(this.props.aquariumID);
        if (this.state.isMdOrAbove) {
            this.fetchDetailData();
        }
    }

    async componentDidUpdate(prevProps: RadialBarProps, prevState: RadialBarState) {
        if (this.props.aquariumID !== prevProps.aquariumID) {
            await this.fetchAndSetData(this.props.aquariumID);
            if (this.state.isMdOrAbove) {
                this.fetchDetailData();
            }
        }
        if ((this.state.isMdOrAbove && !prevState.isMdOrAbove) ||
            (this.state.isMdOrAbove && this.state.aquariumID !== prevState.aquariumID)) {
            this.fetchDetailData();
        }
    }

    async fetchAndSetData(aquariumID: number) {
        try {
            const { data, error } = await supabase
                .from('akuarium')
                .select('akuarium_id, jumlah_ikan_sakit, jumlah_ikan_total')
                .eq('akuarium_id', aquariumID);
            if (error) throw error;
            if (data && data.length > 0) {
                const { akuarium_id, jumlah_ikan_sakit: s, jumlah_ikan_total: t } = data[0];
                const persen = t > 0 ? ((t - s) / t) * 100 : 0;
                this.setState({ aquariumID: akuarium_id, series: [parseFloat(persen.toFixed(2))] });
            }
        } catch (err) {
            console.error('Gagal fetch persentase:', err);
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

    editableDialogOpen = false;

    handleEditableDialogOpen = async () => {
        const { akuariumDetail, penyakitIds } = this.state;
        const { data: allPenyakit } = await supabase
            .from('penyakit')
            .select('penyakit_id, nama_penyakit');
        this.editableFields = {
            total: akuariumDetail && akuariumDetail.jumlah_ikan_total != null ? String(akuariumDetail.jumlah_ikan_total) : '',
            sakit: akuariumDetail && akuariumDetail.jumlah_ikan_sakit != null ? String(akuariumDetail.jumlah_ikan_sakit) : '',
            penyakit: '', 
        };
        this.setState({
            editableDialogOpen: true,
            allPenyakit: allPenyakit || [],
            selectedPenyakitIds: penyakitIds || [],
        });
    };

    handlePenyakitCheckboxChange = (penyakit_id: number, checked: boolean) => {
        let selected = this.state.selectedPenyakitIds ? [...this.state.selectedPenyakitIds] : [];
        if (checked) {
            if (!selected.includes(penyakit_id)) selected.push(penyakit_id);
        } else {
            selected = selected.filter(id => id !== penyakit_id);
        }
        this.setState({ selectedPenyakitIds: selected });
    };

    handleEditableDialogClose = () => {
        this.setState({ editableDialogOpen: false });
    };

    handleEditableFieldChange = (field: string, value: string) => {
        this.editableFields = { ...this.editableFields, [field]: value };
        this.forceUpdate();
    };

    handleEditableDialogSave = async () => {
        const total = parseInt(this.editableFields.total);
        const sakit = parseInt(this.editableFields.sakit);
        const akuariumID = this.state.aquariumID;
        const penyakitIds = this.state.selectedPenyakitIds || [];

        // 1. Update akuarium table
        await supabase
            .from('akuarium')
            .update({ jumlah_ikan_total: total, jumlah_ikan_sakit: sakit })
            .eq('akuarium_id', akuariumID);

        // 2. Update penyakit (akuarium_penyakit join table)
        await supabase
            .from('akuarium_penyakit')
            .delete()
            .eq('akuarium_id', akuariumID);
        if (penyakitIds.length > 0) {
            await supabase
                .from('akuarium_penyakit')
                .insert(penyakitIds.map(pid => ({ akuarium_id: akuariumID, penyakit_id: pid })));
        }

        this.setState(prev => ({
            akuariumDetail: {
                ...prev.akuariumDetail!,
                jumlah_ikan_total: total,
                jumlah_ikan_sakit: sakit,
            },
            editableDialogOpen: false,
        }));
        this.fetchDetailData();
    };

    render() {
        const { akuariumDetail, isMdOrAbove, editableDialogOpen, detailOpen } = this.state;
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
                        <div className="flex flex-col items-center gap-2 min-w-[250px]">
                            <span className="font-bold text-[#FFE3B3] text-2xl">Aquarium {this.state.aquariumID}</span>
                            <div className="max-w-xs w-[90vw] min-w-0 relative !items-center">
                                <button onClick={this.handleEditableDialogOpen} className="absolute top-0 right-0 text-[#4F8FBF] hover:text-[#26648B] !bg-transparent z-10" title="Edit Data">
                                    <BiInfoCircle size={24} />
                                </button>
                                {akuariumDetail ? (
                                    <Card className="bg-[#FFE3B3] w-[800%] xl:w-[100%] items-center text-[#26648B] shadow-md mx-auto">
                                        <CardContent>
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    <b>Ikan Sehat:</b>{' '}
                                                    {akuariumDetail.jumlah_ikan_total != null && akuariumDetail.jumlah_ikan_sakit != null
                                                        ? `${akuariumDetail.jumlah_ikan_total - akuariumDetail.jumlah_ikan_sakit} / ${akuariumDetail.jumlah_ikan_total}`
                                                        : "-"}
                                                </div>
                                                <div><b>Ikan Sakit:</b> {akuariumDetail.jumlah_ikan_sakit ?? '-'}</div>
                                                <div>
                                                    <b>Penyakit:</b>{' '}
                                                    {this.state.penyakitNames && this.state.penyakitNames.length > 0 && this.state.akuariumDetail && this.state.penyakitIds && this.state.penyakitIds.length === this.state.penyakitNames.length
                                                        ? this.state.penyakitNames.map((name, idx, arr) => (
                                                            <span key={name}>
                                                                <Link to={`/disease-detail/${this.state.penyakitIds ? this.state.penyakitIds[idx] : ''}`} className="underline text-[#26648B] hover:text-[#4F8FBF]">
                                                                    {name}
                                                                </Link>
                                                                {idx < (arr?.length ?? 0) - 1 ? ', ' : ''}
                                                            </span>
                                                        ))
                                                        : '-'}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className='!text-[#FFE3B3]'>Loading...</div>
                                )}
                                <Dialog open={!!editableDialogOpen} onOpenChange={(open) => { if (!open) this.handleEditableDialogClose(); }}>
                                    <DialogContent className="max-w-xs w-[90vw] min-w-0 bg-[#FFE3B3] text-[#26648B] ">
                                        <DialogTitle>Edit Data Akuarium</DialogTitle>
                                        <div className="flex flex-col gap-2">
                                            <label>
                                                Total Ikan:
                                                <input type="number" className="border !border-[#4F8FBF] !rounded-lg p-1 w-full" value={this.editableFields.total} onChange={e => this.handleEditableFieldChange('total', e.target.value)} />
                                            </label>
                                            <label>
                                                Ikan Sakit:
                                                <input type="number" className="border !border-[#4F8FBF] !rounded-lg p-1 w-full" value={this.editableFields.sakit} onChange={e => this.handleEditableFieldChange('sakit', e.target.value)} />
                                            </label>
                                            <label>
                                                Penyakit:
                                                <div className="flex flex-col gap-1 max-h-40 !border-[#4F8FBF] !rounded-lg overflow-y-auto p-2 border custom-scrollbar" style={{ background: '#FFE3B3' }}>
                                                    {this.state.allPenyakit && this.state.allPenyakit.length > 0 ? (
                                                        // Sort: selected first, then by name
                                                        [...this.state.allPenyakit].sort((a, b) => {
                                                            const aSelected = this.state.selectedPenyakitIds.includes(a.penyakit_id);
                                                            const bSelected = this.state.selectedPenyakitIds.includes(b.penyakit_id);
                                                            if (aSelected && !bSelected) return -1;
                                                            if (!aSelected && bSelected) return 1;
                                                            return a.nama_penyakit.localeCompare(b.nama_penyakit);
                                                        }).map(p => (
                                                            <label key={p.penyakit_id} className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={this.state.selectedPenyakitIds?.includes(p.penyakit_id) || false}
                                                                    onChange={e => this.handlePenyakitCheckboxChange(p.penyakit_id, e.target.checked)}
                                                                />
                                                                <span>{p.nama_penyakit}</span>
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400">Tidak ada penyakit</span>
                                                    )}
                                                </div>
                                            </label>
                                            <div className="flex gap-2 mt-2">
                                                <Button onClick={this.handleEditableDialogSave} className="!bg-[#4F8FBF] text-[#FFE3B3]">Save</Button>
                                                <Button variant="outline" className='!bg-transparent' onClick={this.handleEditableDialogClose}>Cancel</Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ) : (
                        // Dialog popup for mobile
                        <Dialog open={detailOpen} onOpenChange={(open) => { if (!open) this.handleDetailClose(); }}>
                            <DialogTrigger asChild>
                                <div className="flex flex-col items-start gap-2 min-w-[250px]">
                                    <span className="font-bold text-[#FFE3B3] text-2xl">Aquarium {this.state.aquariumID}</span>
                                    <Button
                                        variant="outline"
                                        onClick={this.handleDetailOpen}
                                        className="!bg-[#4F8FBF] focus:outline-none shadow-md focus-visible:outline-none text-[#FFE3B3]"
                                    >
                                        Detail 
                                    </Button>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-xs w-[90vw] min-w-0 bg-[#FFE3B3] text-[#26648B] ">
                                <button
                                    onClick={this.handleDetailClose}
                                    className="absolute top-2 right-2 !bg-transparent border-none text-lg !text-[#26648B] hover:text-gray-800 font-bold focus:outline-none z-10"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                                <DialogTitle className='bg-[#FFE3B3] text-[#26648B]'>Detail Akuarium #{this.state.aquariumID}</DialogTitle>
                                {akuariumDetail ? (
                                    <div className="flex flex-col gap-2 bg-[#FFE3B3] text-[#26648B]">
                                        <div>
                                            <b>Ikan Sehat:</b>{' '}
                                            {akuariumDetail.jumlah_ikan_total != null && akuariumDetail.jumlah_ikan_sakit != null
                                                ? `${akuariumDetail.jumlah_ikan_total - akuariumDetail.jumlah_ikan_sakit} / ${akuariumDetail.jumlah_ikan_total}`
                                                : "-"}
                                        </div>
                                        <div><b>Ikan Sakit:</b> {akuariumDetail.jumlah_ikan_sakit ?? '-'}</div>
                                        <div>
                                            <b>Penyakit:</b>{' '}
                                            {this.state.penyakitNames && this.state.penyakitNames.length > 0 && this.state.akuariumDetail && this.state.penyakitIds && this.state.penyakitIds.length === this.state.penyakitNames.length
                                                ? this.state.penyakitNames.map((name, idx, arr) => (
                                                    <span key={name}>
                                                        <Link to={`/disease-detail/${this.state.penyakitIds ? this.state.penyakitIds[idx] : ''}`} className="underline text-[#26648B] hover:text-[#4F8FBF]">
                                                            {name}
                                                        </Link>
                                                        {idx < (arr?.length ?? 0) - 1 ? ', ' : ''}
                                                    </span>
                                                ))
                                                : '-'}
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button onClick={this.handleEditableDialogOpen} className="!bg-[#2F4F8F] text-[#FFE3B3] w-full">Edit</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='!text-[#FFE3B3]'>Loading...</div>
                                )}
                                {/* Editable Dialog for mobile, nested */}
                                <Dialog open={!!editableDialogOpen} onOpenChange={(open) => { if (!open) this.handleEditableDialogClose(); }}>
                                    <DialogContent className="max-w-xs w-[90vw] min-w-0 bg-[#FFE3B3] text-[#26648B] ">
                                        <DialogTitle>Edit Data Akuarium</DialogTitle>
                                        <div className="flex flex-col gap-2">
                                            <label>
                                                Total Ikan:
                                                <input type="number" className="border !border-[#4F8FBF] !rounded-lg rounded p-1 w-full" value={this.editableFields.total} onChange={e => this.handleEditableFieldChange('total', e.target.value)} />
                                            </label>
                                            <label>
                                                Ikan Sakit:
                                                <input type="number" className="border  !border-[#4F8FBF] !rounded-lg rounded p-1 w-full" value={this.editableFields.sakit} onChange={e => this.handleEditableFieldChange('sakit', e.target.value)} />
                                            </label>
                                            <label>
                                                Penyakit:
                                                <div className="flex flex-col gap-1 max-h-40 !border-[#4F8FBF] !rounded-lg overflow-y-auto rounded p-2 border custom-scrollbar" style={{ background: '#FFE3B3' }}>
                                                    {this.state.allPenyakit && this.state.allPenyakit.length > 0 ? (
                                                        // Sortibg
                                                        [...this.state.allPenyakit].sort((a, b) => {
                                                            const aSelected = this.state.selectedPenyakitIds.includes(a.penyakit_id);
                                                            const bSelected = this.state.selectedPenyakitIds.includes(b.penyakit_id);
                                                            if (aSelected && !bSelected) return -1;
                                                            if (!aSelected && bSelected) return 1;
                                                            return a.nama_penyakit.localeCompare(b.nama_penyakit);
                                                        }).map(p => (
                                                            <label key={p.penyakit_id} className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={this.state.selectedPenyakitIds?.includes(p.penyakit_id) || false}
                                                                    onChange={e => this.handlePenyakitCheckboxChange(p.penyakit_id, e.target.checked)}
                                                                />
                                                                <span>{p.nama_penyakit}</span>
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400">Tidak ada penyakit</span>
                                                    )}
                                                </div>
                                            </label>
                                            <div className="flex gap-2 mt-2">
                                                   <Button onClick={this.handleEditableDialogSave} className="!bg-[#4F8FBF] text-[#FFE3B3]">Save</Button>
                                                <Button variant="outline" className='!bg-transparent' onClick={this.handleEditableDialogClose}>Cancel</Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        );
    }
}

export default RadialBar;