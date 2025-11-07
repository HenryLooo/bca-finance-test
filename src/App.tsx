import { useState, type ChangeEvent } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  DollarSign,
  Upload,
  Download,
  Send,
} from "lucide-react";

export default function CreditApplicationSystem() {
  const [activeTab, setActiveTab] = useState("submit");
  const [applications, setApplications] = useState<
    Array<{
      id: string;
      customerName: string;
      nik: string;
      phone: string;
      vehicle: string;
      loanAmount: number;
      dp: number;
      tenor: number;
      monthlyPayment: number;
      status: "pending" | "approved" | "rejected";
      submittedAt: string;
      approvedAt?: string;
      documents: string[];
    }>
  >([
    {
      id: "APP001",
      customerName: "Budi Santoso",
      nik: "3201012345678901",
      phone: "081234567890",
      vehicle: "Toyota Avanza 1.3 G MT",
      loanAmount: 150000000,
      dp: 30000000,
      tenor: 36,
      monthlyPayment: 4200000,
      status: "pending",
      submittedAt: "2025-11-07 10:30",
      documents: ["KTP", "SIM", "Slip Gaji"],
    },
    {
      id: "APP002",
      customerName: "Siti Rahayu",
      nik: "3201015678901234",
      phone: "081298765432",
      vehicle: "Honda CR-V 1.5 Turbo",
      loanAmount: 350000000,
      dp: 100000000,
      tenor: 48,
      monthlyPayment: 6500000,
      status: "approved",
      submittedAt: "2025-11-06 14:20",
      approvedAt: "2025-11-07 09:15",
      documents: ["KTP", "SIM", "Slip Gaji", "NPWP"],
    },
  ]);

  const [formData, setFormData] = useState({
    customerName: "",
    nik: "",
    phone: "",
    email: "",
    address: "",
    maritalStatus: "single",
    vehicle: "",
    loanAmount: "",
    dp: "",
    tenor: 36,
    monthlyPayment: 0,
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto calculate monthly payment
    if (name === "loanAmount" || name === "dp" || name === "tenor") {
      const loan =
        name === "loanAmount"
          ? parseFloat(value)
          : parseFloat(formData.loanAmount);
      const downPayment =
        name === "dp" ? parseFloat(value) : parseFloat(formData.dp);
      const months = name === "tenor" ? parseInt(value) : formData.tenor;

      if (loan && downPayment && months) {
        const principal = loan - downPayment;
        const interest = 0.08; // 8% per tahun
        const monthlyRate = interest / 12;
        const payment =
          (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

        setFormData((prev) => ({
          ...prev,
          monthlyPayment: Math.round(payment),
        }));
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files.map((f) => f.name)]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newApplication = {
      id: `APP${String(applications.length + 1).padStart(3, "0")}`,
      customerName: formData.customerName,
      nik: formData.nik,
      phone: formData.phone,
      vehicle: formData.vehicle,
      loanAmount: parseFloat(formData.loanAmount),
      dp: parseFloat(formData.dp),
      tenor: formData.tenor,
      monthlyPayment: formData.monthlyPayment,
      status: "pending",
      submittedAt: new Date().toLocaleString("id-ID"),
      documents: uploadedFiles,
    };

    setApplications((prev) => [newApplication, ...prev]);

    // Reset form
    setFormData({
      customerName: "",
      nik: "",
      phone: "",
      email: "",
      address: "",
      maritalStatus: "single",
      vehicle: "",
      loanAmount: "",
      dp: "",
      tenor: 36,
      monthlyPayment: 0,
    });
    setUploadedFiles([]);

    alert("✅ Pengajuan berhasil disubmit!\nID: " + newApplication.id);
    setActiveTab("approval");
  };

  const handleApproval = (id, action) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: action,
              approvedAt:
                action === "approved"
                  ? new Date().toLocaleString("id-ID")
                  : undefined,
            }
          : app
      )
    );

    alert(
      action === "approved"
        ? "✅ Pengajuan disetujui! Dokumen kontrak akan digenerate."
        : "❌ Pengajuan ditolak."
    );
  };

  const handleGenerateContract = (app) => {
    const contractContent = `
PERJANJIAN KREDIT KENDARAAN
Nomor: ${app.id}/BCAF/2025

PARA PIHAK:
1. PT BCA Finance (PEMBERI KREDIT)
2. ${app.customerName} - NIK: ${app.nik} (PENERIMA KREDIT)

OBJEK KREDIT: ${app.vehicle}

RINCIAN PEMBIAYAAN:
- Harga Kendaraan: Rp ${app.loanAmount.toLocaleString("id-ID")}
- Uang Muka (DP): Rp ${app.dp.toLocaleString("id-ID")}
- Jumlah Pembiayaan: Rp ${(app.loanAmount - app.dp).toLocaleString("id-ID")}
- Tenor: ${app.tenor} bulan
- Angsuran per Bulan: Rp ${app.monthlyPayment.toLocaleString("id-ID")}

Tanggal: ${new Date().toLocaleDateString("id-ID")}

[Tanda Tangan Digital]
Pihak Pertama          Pihak Kedua
`;

    // Simulate download
    const blob = new Blob([contractContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Kontrak_${app.id}_${app.customerName.replace(
      /\s/g,
      "_"
    )}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert(
      "📄 Dokumen kontrak berhasil di-generate!\n\nSelanjutnya akan dikirim ke customer untuk tanda tangan digital."
    );
  };

  const StatusBadge = ({
    status,
  }: {
    status: "pending" | "approved" | "rejected";
  }) => {
    const config = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Menunggu Approval",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Disetujui",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Ditolak",
      },
    };

    const { color, icon: Icon, text } = config[status];

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${color} flex items-center gap-1`}
      >
        <Icon className="w-4 h-4" />
        {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Sistem Kredit Kendaraan</h1>
          </div>
          <p className="text-blue-100">
            BCA Finance - Digital Credit Application System
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-6 px-6">
        <div className="flex gap-2 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab("submit")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "submit"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            📝 Submit Pengajuan
          </button>
          <button
            onClick={() => setActiveTab("approval")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "approval"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            ✅ Approval Pengajuan
          </button>
          <button
            onClick={() => setActiveTab("document")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "document"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            📄 Generate Dokumen
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Tab 1: Submit Pengajuan */}
        {activeTab === "submit" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              Form Pengajuan Kredit Kendaraan
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Data Konsumen */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Data Konsumen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIK (KTP) *
                    </label>
                    <input
                      type="text"
                      name="nik"
                      value={formData.nik}
                      onChange={handleInputChange}
                      required
                      maxLength={16}
                      pattern="[0-9]{16}"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="16 digit NIK"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor HP *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Lengkap
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Perkawinan
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="single">Belum Menikah</option>
                      <option value="married">Menikah</option>
                      <option value="divorced">Cerai</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Kendaraan */}
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-green-600" />
                  Data Kendaraan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Kendaraan *
                    </label>
                    <select
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Pilih Kendaraan --</option>
                      <option value="Toyota Avanza 1.3 G MT">
                        Toyota Avanza 1.3 G MT - Rp 250.000.000
                      </option>
                      <option value="Honda CR-V 1.5 Turbo">
                        Honda CR-V 1.5 Turbo - Rp 450.000.000
                      </option>
                      <option value="Mitsubishi Xpander Ultimate">
                        Mitsubishi Xpander Ultimate - Rp 280.000.000
                      </option>
                      <option value="Suzuki Ertiga GX MT">
                        Suzuki Ertiga GX MT - Rp 230.000.000
                      </option>
                      <option value="Daihatsu Terios R MT">
                        Daihatsu Terios R MT - Rp 260.000.000
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Pembiayaan */}
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Data Pembiayaan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Kendaraan (Rp) *
                    </label>
                    <input
                      type="number"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="250000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Uang Muka / DP (Rp) *
                    </label>
                    <input
                      type="number"
                      name="dp"
                      value={formData.dp}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenor (Bulan) *
                    </label>
                    <select
                      name="tenor"
                      value={formData.tenor}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="12">12 Bulan</option>
                      <option value="24">24 Bulan</option>
                      <option value="36">36 Bulan</option>
                      <option value="48">48 Bulan</option>
                      <option value="60">60 Bulan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimasi Angsuran / Bulan
                    </label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                      Rp{" "}
                      {formData.monthlyPayment
                        ? formData.monthlyPayment.toLocaleString("id-ID")
                        : "0"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Dokumen */}
              <div className="border-l-4 border-orange-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-orange-600" />
                  Upload Dokumen Persyaratan
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Dokumen yang diperlukan:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-500">
                      <li>KTP (scan/foto)</li>
                      <li>SIM (scan/foto)</li>
                      <li>Slip Gaji / Bukti Penghasilan</li>
                      <li>NPWP (jika ada)</li>
                      <li>Rekening Koran 3 bulan terakhir</li>
                    </ul>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="font-medium text-green-800 mb-2">
                        File yang diupload:
                      </p>
                      <ul className="space-y-1">
                        {uploadedFiles.map((file, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-green-700 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      customerName: "",
                      nik: "",
                      phone: "",
                      email: "",
                      address: "",
                      maritalStatus: "single",
                      vehicle: "",
                      loanAmount: "",
                      dp: "",
                      tenor: 36,
                      monthlyPayment: 0,
                    });
                    setUploadedFiles([]);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Pengajuan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Approval Pengajuan */}
        {activeTab === "approval" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Dashboard Approval Pengajuan
            </h2>

            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {app.customerName}
                        </h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-sm text-gray-600">
                        ID: {app.id} | Diajukan: {app.submittedAt}
                      </p>
                      {app.approvedAt && (
                        <p className="text-sm text-green-600">
                          ✓ Disetujui: {app.approvedAt}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">NIK</p>
                      <p className="font-semibold text-gray-800">{app.nik}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Telepon</p>
                      <p className="font-semibold text-gray-800">{app.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-500 mb-1">Kendaraan</p>
                      <p className="font-semibold text-gray-800">
                        {app.vehicle}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-blue-600 mb-1">
                        Harga Kendaraan
                      </p>
                      <p className="font-bold text-blue-800">
                        Rp {app.loanAmount.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-green-600 mb-1">DP</p>
                      <p className="font-bold text-green-800">
                        Rp {app.dp.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-purple-600 mb-1">
                        Angsuran / Bulan ({app.tenor} bulan)
                      </p>
                      <p className="font-bold text-purple-800">
                        Rp {app.monthlyPayment.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Dokumen:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {app.documents.map((doc, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          📎 {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {app.status === "pending" && (
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleApproval(app.id, "approved")}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Setujui
                      </button>
                      <button
                        onClick={() => handleApproval(app.id, "rejected")}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Tolak
                      </button>
                    </div>
                  )}

                  {app.status === "approved" && (
                    <div className="pt-4 border-t">
                      <button
                        onClick={() => handleGenerateContract(app)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Generate & Download Kontrak
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Belum ada pengajuan</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Generate Dokumen */}
        {activeTab === "document" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Generate & Kirim Dokumen Kontrak
            </h2>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Info:</strong> Halaman ini menampilkan semua pengajuan
                yang telah disetujui. Anda dapat men-generate dan mendownload
                dokumen kontrak untuk dikirim ke customer.
              </p>
            </div>

            <div className="space-y-4">
              {applications
                .filter((app) => app.status === "approved")
                .map((app) => (
                  <div
                    key={app.id}
                    className="border-2 border-green-200 bg-green-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {app.customerName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID Kontrak: {app.id}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          ✓ Disetujui: {app.approvedAt}
                        </p>
                      </div>
                      <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold">
                        APPROVED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2">
                          DATA CUSTOMER
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">NIK:</span>
                            <span className="font-medium text-gray-800">
                              {app.nik}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Telepon:</span>
                            <span className="font-medium text-gray-800">
                              {app.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2">
                          KENDARAAN
                        </h4>
                        <p className="text-sm font-semibold text-gray-800">
                          {app.vehicle}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2">
                          RINCIAN PEMBIAYAAN
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Harga:</span>
                            <span className="font-semibold">
                              Rp {app.loanAmount.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">DP:</span>
                            <span className="font-semibold text-green-600">
                              Rp {app.dp.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pembiayaan:</span>
                            <span className="font-semibold">
                              Rp{" "}
                              {(app.loanAmount - app.dp).toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2">
                          CICILAN
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tenor:</span>
                            <span className="font-medium">
                              {app.tenor} Bulan
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Per Bulan:</span>
                            <span className="font-bold text-lg text-purple-600">
                              Rp {app.monthlyPayment.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 bg-white p-3 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        DOKUMEN TERLAMPIR:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {app.documents.map((doc, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            📎 {doc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-green-300">
                      <button
                        onClick={() => handleGenerateContract(app)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Download className="w-5 h-5" />
                        Download Kontrak {app.id}
                      </button>
                    </div>
                  </div>
                ))}

              {applications.filter((app) => app.status === "approved")
                .length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <FileText className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <p className="text-xl font-semibold mb-2">
                    Belum Ada Pengajuan yang Disetujui
                  </p>
                  <p className="text-sm">
                    Dokumen kontrak akan muncul di sini setelah pengajuan
                    disetujui di tab Approval
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
