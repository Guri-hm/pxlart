'use client';
import React, { useRef } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Box from '@mui/material/Box';
import { AllStrokesType, CurrentStrokeType, PxlType } from './strokeTypes';
import { GridCountType } from './gridTypes';
import { Mode } from './modeTypes';

// CSV の最大許容グリッドサイズ
const MAX_COLS = 100;
const MAX_ROWS = 100;
// 1セルの最大文字数（カラーコード "transparent" or "#RRGGBB" 相当）
const MAX_CELL_LEN = 16;
// HEX カラーコード or "transparent" のみ許可
const VALID_CELL_RE = /^(#[0-9A-Fa-f]{6}|transparent)$/;

type Props = {
    open: boolean;
    onClose: () => void;
    onExport: () => void;
    onImport: (strokes: AllStrokesType, grid: GridCountType) => void;
    onError: (msg: string) => void;
};

/**
 * CSV文字列を AllStrokesType / GridCountType に変換してバリデーションする。
 * 問題があれば例外を投げる。
 */
function parseCsv(text: string): { strokes: AllStrokesType; grid: GridCountType } {
    // BOM 除去
    const cleaned = text.replace(/^\uFEFF/, '').trim();
    const lines = cleaned.split(/\r?\n/).filter(l => l.length > 0);

    if (lines.length === 0) throw new Error('CSVが空です');
    if (lines.length > MAX_ROWS) throw new Error(`行数が上限(${MAX_ROWS})を超えています`);

    const pxls: PxlType[] = [];
    let colsCount = 0;

    for (let r = 0; r < lines.length; r++) {
        const cells = lines[r].split(',');

        if (r === 0) {
            colsCount = cells.length;
        } else if (cells.length !== colsCount) {
            throw new Error(`${r + 1}行目の列数が不正です`);
        }

        if (colsCount > MAX_COLS) throw new Error(`列数が上限(${MAX_COLS})を超えています`);

        for (let c = 0; c < cells.length; c++) {
            const raw = cells[c].trim();

            // 長さチェック（インジェクション対策）
            if (raw.length > MAX_CELL_LEN) {
                throw new Error(`${r + 1}行${c + 1}列のデータが不正です`);
            }
            // 文字種チェック
            if (!VALID_CELL_RE.test(raw)) {
                throw new Error(`${r + 1}行${c + 1}列のデータが不正です: "${raw}"`);
            }

            if (raw === 'transparent') {
                // 透明セルはスキップ（消しゴム扱い）
                pxls.push({ c, r, color: undefined, mode: Mode.ERASE });
            } else {
                // "#RRGGBB" → rgba
                const rv = parseInt(raw.slice(1, 3), 16);
                const gv = parseInt(raw.slice(3, 5), 16);
                const bv = parseInt(raw.slice(5, 7), 16);
                pxls.push({ c, r, color: { r: rv, g: gv, b: bv, a: 1 }, mode: Mode.DRAW });
            }
        }
    }

    const grid: GridCountType = { rowsCount: lines.length, colsCount };
    const strokes: AllStrokesType = { strokes: [{ pxl: pxls as CurrentStrokeType }] };
    return { strokes, grid };
}

export default function CsvDialog({ open, onClose, onExport, onImport, onError }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ファイル種別チェック
        if (!file.name.toLowerCase().endsWith('.csv')) {
            onError('CSVファイルを選択してください');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = ev.target?.result as string;
                const { strokes, grid } = parseCsv(text);
                onImport(strokes, grid);
                onClose();
            } catch (err) {
                onError(err instanceof Error ? err.message : '読み込みエラーが発生しました');
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file, 'utf-8');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>CSV</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => { onExport(); onClose(); }}
                        fullWidth
                    >
                        <Box sx={{ textAlign: 'left', width: '100%' }}>
                            <Typography variant="body1">CSV として書き出す</Typography>
                            <Typography variant="caption" color="text.secondary">
                                現在のキャンバスをCSVファイルに保存します
                            </Typography>
                        </Box>
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FileUploadIcon />}
                        onClick={handleImportClick}
                        fullWidth
                    >
                        <Box sx={{ textAlign: 'left', width: '100%' }}>
                            <Typography variant="body1">CSV から読み込む</Typography>
                            <Typography variant="caption" color="text.secondary">
                                CSVファイルからピクセルアートを復元します（最大{MAX_ROWS}×{MAX_COLS}）
                            </Typography>
                        </Box>
                    </Button>
                </Box>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
            </DialogActions>
        </Dialog>
    );
}
