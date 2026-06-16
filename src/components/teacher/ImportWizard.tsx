'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faUpload,
  faExclamationTriangle,
  faCheck,
  faSave,
  faArrowRight,
  faArrowLeft,
  faFileExcel,
  faTimes,
  faListUl,
  faBook,
  faGraduationCap,
  faFileAlt,
  faCircleInfo,
  faCheckCircle,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useExamStore } from '@/lib/store';
import type { ImportError } from '@/lib/types';

// ---------------------------------------------------------------------------
// xlsx lazy import type
// ---------------------------------------------------------------------------
type XLSXType = typeof import('xlsx');

// ---------------------------------------------------------------------------
// Mock validation data types
// ---------------------------------------------------------------------------
interface ParsedRow {
  rowIndex: number;
  type: string;
  subject: string;
  grade: string;
  topic: string;
  difficulty: string;
  questionText: string;
  options: string;
  correctAnswer: string;
  isValid: boolean;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------
const STEPS = [
  { number: 1, label: 'Download Template', icon: faDownload },
  { number: 2, label: 'Upload File', icon: faUpload },
  { number: 3, label: 'Validasi Preview', icon: faExclamationTriangle },
];

// Template columns for the Excel download
const TEMPLATE_COLUMNS = [
  'Type',
  'Subject',
  'Grade',
  'Topic',
  'Difficulty',
  'Question Text',
  'Options',
  'Correct Answer',
];

const TEMPLATE_COLUMN_ICONS = [
  faListUl,
  faBook,
  faGraduationCap,
  faBook,
  faExclamationTriangle,
  faFileAlt,
  faListUl,
  faCheck,
];

const TEMPLATE_EXAMPLE_ROWS = [
  [
    'pilihan_ganda',
    'Matematika',
    'Kelas X',
    'Aljabar',
    'sedang',
    'Jika 2x + 5 = 13, maka nilai x adalah...',
    'A:3|B:4|C:5|D:6',
    'B',
  ],
];

// Mock validation results for demo
const MOCK_PARSED_ROWS: ParsedRow[] = [
  {
    rowIndex: 2,
    type: 'pilihan_ganda',
    subject: 'Matematika',
    grade: 'Kelas X',
    topic: 'Aljabar',
    difficulty: 'sedang',
    questionText: 'Jika 2x + 5 = 13, maka nilai x adalah...',
    options: 'A:3|B:4|C:5|D:6',
    correctAnswer: 'B',
    isValid: true,
    errors: [],
  },
  {
    rowIndex: 3,
    type: 'pilihan_ganda',
    subject: '',
    grade: 'Kelas X',
    topic: 'Geometri',
    difficulty: 'mudah',
    questionText: 'Luas segitiga dengan alas 6 dan tinggi 4 adalah...',
    options: 'A:10|B:12|C:24|D:8',
    correctAnswer: 'B',
    isValid: false,
    errors: ['Subject is required'],
  },
  {
    rowIndex: 6,
    type: 'invalid_type',
    subject: 'Bahasa Inggris',
    grade: 'Kelas XII',
    topic: 'Grammar',
    difficulty: 'sedang',
    questionText: 'What is the past tense of "go"?',
    options: 'A:goed|B:went|C:gone|D:going',
    correctAnswer: 'B',
    isValid: false,
    errors: ['Invalid question type: "invalid_type"'],
  },
];

// ---------------------------------------------------------------------------
// ImportWizard Component
// ---------------------------------------------------------------------------
export default function ImportWizard() {
  const { setView } = useExamStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [highlightErrors, setHighlightErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;

  // ---- Step 1: Download Template ----
  const handleDownloadTemplate = useCallback(async () => {
    const XLSX: XLSXType = await import('xlsx');
    const wsData = [TEMPLATE_COLUMNS, ...TEMPLATE_EXAMPLE_ROWS];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 22 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 },
      { wch: 40 },
      { wch: 30 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Import Soal');
    XLSX.writeFile(wb, 'template_import_soal.xlsx');
  }, []);

  // ---- Step 2: File Upload ----
  const handleFileSelect = useCallback(
    (file: File) => {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(ext)) {
        alert('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv');
        return;
      }
      setUploadedFile(file);
      // Simulate progress
      setUploadProgress(0);
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 25;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
        }
        setUploadProgress(Math.round(p));
      }, 200);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleProcessFile = useCallback(async () => {
    if (!uploadedFile) return;
    setIsProcessing(true);

    try {
      const XLSX: XLSXType = await import('xlsx');
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const rawData: string[][] = XLSX.utils.sheet_to_json(ws, {
        header: 1,
      });

      if (rawData.length < 2) {
        alert('File kosong atau tidak memiliki data');
        setIsProcessing(false);
        return;
      }

      // Parse and validate rows (skip header)
      const rows: ParsedRow[] = [];
      const validTypes = [
        'pilihan_ganda',
        'pilihan_ganda_kompleks',
        'menjodohkan',
      ];
      const validDifficulties = ['mudah', 'sedang', 'sulit'];

      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0 || !row[5]) continue;

        const errors: string[] = [];
        const type = String(row[0] ?? '').trim();
        const subject = String(row[1] ?? '').trim();
        const grade = String(row[2] ?? '').trim();
        const topic = String(row[3] ?? '').trim();
        const difficulty = String(row[4] ?? '').trim();
        const questionText = String(row[5] ?? '').trim();
        const options = String(row[6] ?? '').trim();
        const correctAnswer = String(row[7] ?? '').trim();

        if (!type) errors.push('Type is required');
        else if (!validTypes.includes(type))
          errors.push(`Invalid question type: "${type}"`);

        if (!subject) errors.push('Subject is required');
        if (!grade) errors.push('Grade is required');
        if (!questionText) errors.push('Question text is required');

        if (!difficulty) errors.push('Difficulty is required');
        else if (!validDifficulties.includes(difficulty))
          errors.push(`Invalid difficulty: "${difficulty}"`);

        if (
          (type === 'pilihan_ganda' || type === 'pilihan_ganda_kompleks') &&
          !correctAnswer
        ) {
          errors.push('Correct answer is required for choice questions');
        }

        rows.push({
          rowIndex: i + 1,
          type,
          subject,
          grade,
          topic,
          difficulty,
          questionText,
          options,
          correctAnswer,
          isValid: errors.length === 0,
          errors,
        });
      }

      // If no rows were parsed, use mock data for demo
      if (rows.length === 0) {
        setParsedRows(MOCK_PARSED_ROWS);
      } else {
        setParsedRows(rows);
      }

      setCurrentStep(3);
    } catch {
      setParsedRows(MOCK_PARSED_ROWS);
      setCurrentStep(3);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile]);

  // ---- Step 3: Import valid questions ----
  const handleImport = useCallback(() => {
    const validRows = parsedRows.filter((r) => r.isValid);
    alert(`${validRows.length} soal berhasil diimport! (demo)`);
    setView('teacher_question_bank');
  }, [parsedRows, setView]);

  // ---- Navigation ----
  const goNext = useCallback(() => {
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
    else setView('teacher_question_bank');
  }, [currentStep, setView]);

  // ======================================================================
  // RENDER
  // ======================================================================
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4 sm:p-6 page-enter">
      {/* ================================================================ */}
      {/* Step Indicator - Horizontal Stepper                              */}
      {/* ================================================================ */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center w-full max-w-xl">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <React.Fragment key={step.number}>
                {/* Step circle & label */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${
                        isCompleted
                          ? 'shadow-sm'
                          : isActive
                          ? 'shadow-md scale-110'
                          : ''
                      }
                    `}
                    style={{
                      backgroundColor:
                        isCompleted
                          ? '#10B981'
                          : isActive
                          ? '#5B6ABF'
                          : '#FFFFFF',
                      border: isCompleted
                        ? '2px solid #10B981'
                        : isActive
                        ? '2px solid #5B6ABF'
                        : '2px solid #CBD5E1',
                    }}
                  >
                    {isCompleted ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-sm text-white"
                      />
                    ) : isActive ? (
                      <span className="text-sm font-bold text-white">
                        {step.number}
                      </span>
                    ) : (
                      <span
                        className="text-sm font-semibold"
                        style={{ color: '#94A3B8' }}
                      >
                        {step.number}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[11px] font-medium text-center leading-tight max-w-[90px] transition-colors"
                    style={{
                      color: isActive
                        ? '#5B6ABF'
                        : isCompleted
                        ? '#10B981'
                        : '#94A3B8',
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 mx-3 relative h-0.5 rounded-full mt-[-18px]">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: '#E2E8F0' }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor:
                          currentStep > step.number ? '#5B6ABF' : 'transparent',
                        width: currentStep > step.number ? '100%' : '0%',
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* Step Content                                                     */}
      {/* ================================================================ */}
      <Card className="border-cool-gray-200">
        <CardContent className="p-6">
          {/* ======== Step 1: Download Template ======== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: '#2D3436' }}
                >
                  Download Template Import
                </h3>
                <p className="text-sm mt-1" style={{ color: '#636E72' }}>
                  Gunakan template ini untuk memastikan format data soal sesuai
                  dengan yang dibutuhkan sistem.
                </p>
              </div>

              {/* Template format preview table */}
              <div className="space-y-3">
                <h4
                  className="text-sm font-semibold"
                  style={{ color: '#2D3436' }}
                >
                  Preview Format Template
                </h4>
                <div className="overflow-x-auto rounded-lg border border-cool-gray-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor: '#5B6ABF' }}>
                        {TEMPLATE_COLUMNS.map((col, colIdx) => (
                          <th
                            key={col}
                            className="px-3 py-2.5 text-left text-white font-medium whitespace-nowrap"
                          >
                            <div className="flex items-center gap-1.5">
                              <FontAwesomeIcon
                                icon={TEMPLATE_COLUMN_ICONS[colIdx]}
                                className="text-[10px] opacity-70"
                              />
                              {col}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TEMPLATE_EXAMPLE_ROWS.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          style={{
                            backgroundColor:
                              rowIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          }}
                        >
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="px-3 py-2 whitespace-nowrap"
                              style={{ color: '#2D3436' }}
                            >
                              {cell || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info note card */}
              <div
                className="flex items-start gap-3 rounded-lg px-4 py-3"
                style={{
                  backgroundColor: 'rgba(91,106,191,0.06)',
                  borderLeft: '3px solid #5B6ABF',
                }}
              >
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className="text-sm mt-0.5 flex-shrink-0"
                  style={{ color: '#5B6ABF' }}
                />
                <p className="text-xs leading-relaxed" style={{ color: '#5B6ABF' }}>
                  Pastikan format sesuai template untuk menghindari error saat
                  import. Kolom Type, Subject, Grade, dan Question Text wajib
                  diisi.
                </p>
              </div>

              {/* Download button */}
              <Button
                type="button"
                size="lg"
                onClick={handleDownloadTemplate}
                className="gap-2 w-full sm:w-auto sm:min-w-[220px]"
                style={{ backgroundColor: '#5B6ABF' }}
              >
                <FontAwesomeIcon icon={faDownload} className="text-sm" />
                Download Template Excel
              </Button>
            </div>
          )}

          {/* ======== Step 2: Upload File ======== */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: '#2D3436' }}
                >
                  Upload File Soal
                </h3>
                <p className="text-sm mt-1" style={{ color: '#636E72' }}>
                  Upload file Excel atau CSV yang berisi data soal sesuai
                  template.
                </p>
              </div>

              {/* Drag & Drop zone */}
              {!uploadedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    flex flex-col items-center justify-center gap-4 rounded-xl
                    py-16 px-6 transition-all cursor-pointer
                    ${
                      isDragOver
                        ? ''
                        : ''
                    }
                  `}
                  style={{
                    border: isDragOver
                      ? '2px solid #5B6ABF'
                      : '2px dashed #CBD5E1',
                    backgroundColor: isDragOver
                      ? 'rgba(91,106,191,0.05)'
                      : '#F8FAFC',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FontAwesomeIcon
                    icon={faUpload}
                    className="text-5xl"
                    style={{ color: isDragOver ? '#5B6ABF' : '#CBD5E1' }}
                  />
                  <div className="text-center">
                    <p
                      className="text-sm font-medium"
                      style={{ color: '#2D3436' }}
                    >
                      Drag & drop file di sini
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                      atau klik untuk browse
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>
                    Format: .xlsx, .xls, .csv (maks. 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Uploaded file display */
                <div className="space-y-4">
                  <div
                    className="flex items-center gap-4 rounded-xl border p-4"
                    style={{
                      borderColor: '#10B981',
                      backgroundColor: 'rgba(16,185,129,0.04)',
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-2xl flex-shrink-0"
                      style={{ color: '#10B981' }}
                    />
                    <FontAwesomeIcon
                      icon={faFileExcel}
                      className="text-2xl flex-shrink-0"
                      style={{ color: '#5B6ABF' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: '#2D3436' }}
                      >
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="hover:text-red-500"
                      style={{ color: '#94A3B8' }}
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </Button>
                  </div>

                  {/* Progress bar */}
                  {uploadProgress < 100 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: '#636E72' }}>
                          Membaca file...
                        </span>
                        <span className="text-xs font-mono" style={{ color: '#5B6ABF' }}>
                          {uploadProgress}%
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="h-1.5" />
                    </div>
                  )}
                </div>
              )}

              {/* Process button */}
              {uploadedFile && uploadProgress >= 100 && (
                <Button
                  type="button"
                  size="lg"
                  onClick={handleProcessFile}
                  disabled={isProcessing}
                  className="gap-2 w-full sm:w-auto sm:min-w-[180px]"
                  style={{ backgroundColor: '#5B6ABF' }}
                >
                  <FontAwesomeIcon icon={faUpload} className="text-sm" />
                  {isProcessing ? 'Memproses...' : 'Proses File'}
                </Button>
              )}
            </div>
          )}

          {/* ======== Step 3: Validation Preview ======== */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: '#2D3436' }}
                >
                  Hasil Validasi
                </h3>
                <p className="text-sm mt-1" style={{ color: '#636E72' }}>
                  Periksa hasil validasi sebelum mengimport soal ke bank soal.
                </p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                {/* Valid card */}
                <div
                  className="rounded-xl border p-4 flex flex-col items-center gap-2"
                  style={{
                    borderColor: 'rgba(16,185,129,0.3)',
                    backgroundColor: 'rgba(16,185,129,0.06)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
                  >
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-sm"
                      style={{ color: '#10B981' }}
                    />
                  </div>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: '#10B981' }}
                  >
                    {validCount}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: '#636E72' }}
                  >
                    Valid
                  </span>
                </div>

                {/* Errors card */}
                <div
                  className="rounded-xl border p-4 flex flex-col items-center gap-2"
                  style={{
                    borderColor:
                      errorCount > 0
                        ? 'rgba(255,107,107,0.3)'
                        : 'rgba(203,213,225,0.5)',
                    backgroundColor:
                      errorCount > 0
                        ? 'rgba(255,107,107,0.06)'
                        : '#F8FAFC',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor:
                        errorCount > 0
                          ? 'rgba(255,107,107,0.15)'
                          : 'rgba(203,213,225,0.3)',
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-sm"
                      style={{ color: errorCount > 0 ? '#FF6B6B' : '#CBD5E1' }}
                    />
                  </div>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: errorCount > 0 ? '#FF6B6B' : '#CBD5E1' }}
                  >
                    {errorCount}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: '#636E72' }}
                  >
                    Errors
                  </span>
                </div>

                {/* Total card */}
                <div
                  className="rounded-xl border p-4 flex flex-col items-center gap-2"
                  style={{
                    borderColor: 'rgba(91,106,191,0.3)',
                    backgroundColor: 'rgba(91,106,191,0.06)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(91,106,191,0.15)' }}
                  >
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className="text-sm"
                      style={{ color: '#5B6ABF' }}
                    />
                  </div>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: '#5B6ABF' }}
                  >
                    {parsedRows.length}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: '#636E72' }}
                  >
                    Total
                  </span>
                </div>
              </div>

              {/* Validation table */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-lg border border-cool-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: '#F8FAFC' }}>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Pelajaran</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="max-w-[200px]">
                        Teks Soal
                      </TableHead>
                      <TableHead>Jawaban</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => (
                      <TableRow
                        key={row.rowIndex}
                        className={`
                          ${
                            !row.isValid && highlightErrors
                              ? 'animate-pulse'
                              : ''
                          }
                        `}
                        style={{
                          backgroundColor: !row.isValid
                            ? 'rgba(255,107,107,0.06)'
                            : row.rowIndex % 2 === 0
                            ? '#FFFFFF'
                            : '#FAFBFC',
                          borderLeft: !row.isValid
                            ? '3px solid #FF6B6B'
                            : '3px solid rgba(16,185,129,0.4)',
                        }}
                      >
                        <TableCell
                          className="text-xs font-mono"
                          style={{ color: '#636E72' }}
                        >
                          {row.rowIndex}
                        </TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-sm"
                              style={{ color: '#10B981' }}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faExclamationTriangle}
                              className="text-sm"
                              style={{ color: '#FF6B6B' }}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-xs" style={{ color: '#2D3436' }}>
                          {row.type}
                        </TableCell>
                        <TableCell className="text-xs" style={{ color: '#2D3436' }}>
                          {row.subject || '-'}
                        </TableCell>
                        <TableCell className="text-xs" style={{ color: '#2D3436' }}>
                          {row.grade}
                        </TableCell>
                        <TableCell
                          className="text-xs max-w-[200px] truncate"
                          style={{ color: '#2D3436' }}
                        >
                          {row.questionText}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.isValid ? (
                            <span style={{ color: '#10B981' }}>
                              {row.correctAnswer}
                            </span>
                          ) : (
                            <div>
                              <span style={{ color: '#FF6B6B' }}>
                                {row.correctAnswer || '-'}
                              </span>
                              <div
                                className="text-[10px] mt-0.5 space-y-0.5"
                                style={{ color: '#FF6B6B' }}
                              >
                                {row.errors.map((err, i) => (
                                  <div key={i}>{err}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
                {errorCount > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setHighlightErrors(!highlightErrors)}
                    className="gap-2"
                    style={{
                      borderColor: '#FF6B6B',
                      color: '#FF6B6B',
                    }}
                  >
                    <FontAwesomeIcon icon={faWrench} className="text-xs" />
                    {highlightErrors ? 'Sembunyikan' : 'Fix Errors'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => setCurrentStep(2)}
                  className="gap-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                  Kembali ke Upload
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={handleImport}
                  disabled={validCount === 0}
                  className="gap-2"
                  style={{ backgroundColor: '#5B6ABF' }}
                >
                  <FontAwesomeIcon icon={faSave} className="text-sm" />
                  Import {validCount} Soal Valid
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Navigation Buttons (Bottom) ---- */}
      <div className="flex justify-between pt-2 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          className="gap-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          {currentStep === 1 ? 'Kembali' : 'Sebelumnya'}
        </Button>

        {currentStep < 3 && (
          <Button
            type="button"
            onClick={goNext}
            className="gap-2"
            style={{ backgroundColor: '#5B6ABF' }}
          >
            Selanjutnya
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Button>
        )}
      </div>
    </div>
  );
}
