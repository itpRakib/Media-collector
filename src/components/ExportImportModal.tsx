import React, { useState } from 'react';
import { MediaItem, ExportFormat, ExportOptions, WatchStatus, MediaType } from '../types';
import {
  exportToJSON,
  exportToCSV,
  exportToMALXml,
  exportToAniListJSON,
  parseImportedJSON,
  parseImportedCSV,
  parseImportedMALXml,
  fetchMALUserList,
  downloadFile,
  filterItemsForExport,
} from '../utils/exportImport';
import { X, Download, Upload, Copy, Check, FileText, Database, AlertCircle, FileCode, Sparkles, UserCheck } from 'lucide-react';

interface ExportImportModalProps {
  items: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedItems: MediaItem[], overwrite: boolean) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  items,
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // Export State
  const [format, setFormat] = useState<ExportFormat>('json');
  const [filterByStatus, setFilterByStatus] = useState<WatchStatus | 'all'>('all');
  const [filterByType, setFilterByType] = useState<MediaType | 'all'>('all');
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeCustomTags, setIncludeCustomTags] = useState(true);
  const [copied, setCopied] = useState(false);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [malUsernameInput, setMalUsernameInput] = useState('');
  const [isSyncingMal, setIsSyncingMal] = useState(false);
  const [parsedPreviewItems, setParsedPreviewItems] = useState<MediaItem[]>([]);
  const [importError, setImportError] = useState('');
  const [overwriteMode, setOverwriteMode] = useState(false);

  const handleMalUserSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!malUsernameInput.trim()) return;

    setIsSyncingMal(true);
    setImportError('');
    setParsedPreviewItems([]);

    try {
      const itemsFetched = await fetchMALUserList(malUsernameInput);
      setParsedPreviewItems(itemsFetched);
    } catch (err: any) {
      setImportError(err.message || 'Failed to sync MyAnimeList account.');
    } finally {
      setIsSyncingMal(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError('');
    setParsedPreviewItems([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let parsed: MediaItem[] = [];

        if (file.name.endsWith('.csv')) {
          parsed = parseImportedCSV(text);
        } else if (file.name.endsWith('.xml') || text.includes('<myanimelist>')) {
          parsed = parseImportedMALXml(text);
        } else {
          // Defaults to JSON or AniList
          parsed = parseImportedJSON(text);
        }

        if (!parsed || parsed.length === 0) {
          throw new Error('No valid media entries found in file.');
        }

        setParsedPreviewItems(parsed);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse file. Please verify format.');
      }
    };

    reader.readAsText(file);
  };

  const exportOptions: ExportOptions = {
    format,
    includeNotes,
    includeCustomTags,
    filterByStatus,
    filterByType,
  };

  const filteredExportItems = filterItemsForExport(items, exportOptions);

  const generateExportContent = () => {
    switch (format) {
      case 'json':
        return exportToJSON(items, exportOptions);
      case 'csv':
        return exportToCSV(items, exportOptions);
      case 'mal_xml':
        return exportToMALXml(items, exportOptions);
      case 'anilist_json':
        return exportToAniListJSON(items, exportOptions);
      default:
        return exportToJSON(items, exportOptions);
    }
  };

  const handleDownload = () => {
    const content = generateExportContent();
    const dateStr = new Date().toISOString().split('T')[0];
    let fileName = `kuromedia-collection-${dateStr}.json`;
    let mimeType = 'application/json';

    if (format === 'csv') {
      fileName = `kuromedia-collection-${dateStr}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'mal_xml') {
      fileName = `myanimelist-export-${dateStr}.xml`;
      mimeType = 'text/xml';
    } else if (format === 'anilist_json') {
      fileName = `anilist-export-${dateStr}.json`;
      mimeType = 'application/json';
    }

    downloadFile(content, fileName, mimeType);
  };

  const handleCopyClipboard = () => {
    const content = generateExportContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmImport = () => {
    if (parsedPreviewItems.length === 0) return;
    onImportSuccess(parsedPreviewItems, overwriteMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 p-6 space-y-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Metadata Export & Import</h2>
              <p className="text-xs text-slate-400">Export your tracker data to JSON, CSV, MAL, or restore from backups</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'export'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Collection</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'import'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Restore / Import Backup</span>
          </button>
        </div>

        {/* Export Tab Content */}
        {activeTab === 'export' && (
          <div className="space-y-5 text-xs">
            {/* Format Selector Cards */}
            <div>
              <label className="block font-semibold text-slate-300 mb-2">Select Export Format:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    id: 'json',
                    label: 'Standard JSON',
                    sub: 'Full fidelity backup',
                    icon: <FileCode className="w-4 h-4 text-violet-400" />,
                  },
                  {
                    id: 'csv',
                    label: 'Spreadsheet CSV',
                    sub: 'Excel / Sheets compatible',
                    icon: <FileText className="w-4 h-4 text-emerald-400" />,
                  },
                  {
                    id: 'mal_xml',
                    label: 'MyAnimeList XML',
                    sub: 'MAL import compatible',
                    icon: <Database className="w-4 h-4 text-cyan-400" />,
                  },
                  {
                    id: 'anilist_json',
                    label: 'AniList JSON',
                    sub: 'AniList collection format',
                    icon: <FileCode className="w-4 h-4 text-pink-400" />,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as ExportFormat)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition ${
                      format === item.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {item.icon}
                      {format === item.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <span className="font-bold text-xs mt-1">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter & Customization Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Filter by Watch Status</label>
                <select
                  value={filterByStatus}
                  onChange={(e) => setFilterByStatus(e.target.value as any)}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700"
                >
                  <option value="all">All Statuses ({items.length})</option>
                  <option value="watching">Watching / Reading</option>
                  <option value="completed">Completed Only</option>
                  <option value="plan_to_watch">Plan to Watch</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Filter by Media Type</label>
                <select
                  value={filterByType}
                  onChange={(e) => setFilterByType(e.target.value as any)}
                  className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-700"
                >
                  <option value="all">All Media Types</option>
                  <option value="anime">Anime Only</option>
                  <option value="manga">Manga Only</option>
                  <option value="light_novel">Light Novels</option>
                  <option value="movie">Movies</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="includeNotes"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <label htmlFor="includeNotes" className="text-slate-300 cursor-pointer">
                  Include My Personal Reviews & Notes
                </label>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="includeTags"
                  checked={includeCustomTags}
                  onChange={(e) => setIncludeCustomTags(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <label htmlFor="includeTags" className="text-slate-300 cursor-pointer">
                  Include Custom Tags & Categorizations
                </label>
              </div>
            </div>

            {/* Export Summary Banner */}
            <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <span className="text-slate-300">
                Ready to export <strong className="text-indigo-300 font-bold">{filteredExportItems.length}</strong> items
              </span>
              <span className="text-[11px] text-slate-400 font-mono uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                .{format === 'csv' ? 'csv' : format === 'mal_xml' ? 'xml' : 'json'}
              </span>
            </div>

            {/* Export Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyClipboard}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        )}

        {/* Import Tab Content */}
        {activeTab === 'import' && (
          <div className="space-y-5 text-xs">
            {/* MAL Username Direct Sync Box */}
            <div className="p-4 rounded-2xl bg-[#14211d] border border-[#2e795a]/80 space-y-3">
              <div className="flex items-center gap-2 text-[#4ecc97] font-bold">
                <Database className="w-4 h-4" />
                <span>Option A: Import via MyAnimeList Username</span>
              </div>
              <p className="text-[#85d1b1]">
                Enter any public MyAnimeList username to instantly fetch and import their entire anime watch collection:
              </p>
              <form onSubmit={handleMalUserSync} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#85d1b1] font-mono">@</span>
                  <input
                    type="text"
                    value={malUsernameInput}
                    onChange={(e) => setMalUsernameInput(e.target.value)}
                    placeholder="Enter MAL Username (e.g. 'Xin', 'AnimeFan')"
                    className="w-full bg-[#0e1613] text-[#e5ebe9] placeholder-[#85d1b1]/50 rounded-xl pl-8 pr-3 py-2.5 border border-[#1e332d] focus:outline-none focus:border-[#4ecc97]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSyncingMal || !malUsernameInput.trim()}
                  className="px-4 py-2.5 bg-[#2e795a] hover:bg-[#4ecc97] text-[#0e1613] font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-40 shrink-0 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isSyncingMal ? 'animate-spin' : ''}`} />
                  <span>{isSyncingMal ? 'Fetching...' : 'Sync MAL List'}</span>
                </button>
              </form>
            </div>

            {/* File Upload Box */}
            <div className="space-y-2">
              <span className="text-[#e5ebe9] font-bold block">Option B: Upload Backup File (.json, .csv, MAL .xml)</span>
              <div className="border-2 border-dashed border-[#1e332d] hover:border-[#2e795a] bg-[#14211d]/60 rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer relative">
                <input
                  type="file"
                  accept=".json,.csv,.xml"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-7 h-7 text-[#4ecc97]" />
                <div className="text-[#e5ebe9] font-semibold text-xs">
                  {importFile ? importFile.name : 'Click or Drag backup file here'}
                </div>
                <div className="text-[10px] text-[#85d1b1]">Supports .json, .csv, and MyAnimeList .xml export files</div>
              </div>
            </div>

            {importError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{importError}</span>
              </div>
            )}

            {/* Parsed Preview List */}
            {parsedPreviewItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl">
                  <span className="font-semibold">
                    Successfully read {parsedPreviewItems.length} media items from file
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-bold">Valid Format</span>
                </div>

                {/* Overwrite or Merge selector */}
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="font-semibold text-slate-200 block">Import Mode:</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name="importMode"
                        checked={!overwriteMode}
                        onChange={() => setOverwriteMode(false)}
                        className="accent-indigo-500"
                      />
                      <span>Merge with existing ({items.length} current items)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name="importMode"
                        checked={overwriteMode}
                        onChange={() => setOverwriteMode(true)}
                        className="accent-rose-500"
                      />
                      <span className="text-rose-300 font-medium">Replace / Overwrite entire collection</span>
                    </label>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/60 p-2 space-y-1">
                  {parsedPreviewItems.slice(0, 10).map((preview, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 bg-slate-800/40 rounded">
                      <span className="font-medium text-slate-200 line-clamp-1">{preview.title}</span>
                      <span className="text-slate-400 uppercase text-[9px] px-1.5 py-0.2 bg-slate-700 rounded">
                        {preview.mediaType} • {preview.status}
                      </span>
                    </div>
                  ))}
                  {parsedPreviewItems.length > 10 && (
                    <div className="text-[10px] text-slate-400 text-center py-1 italic">
                      + {parsedPreviewItems.length - 10} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confirm Actions */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedPreviewItems.length === 0}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Import {parsedPreviewItems.length} Entries</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
