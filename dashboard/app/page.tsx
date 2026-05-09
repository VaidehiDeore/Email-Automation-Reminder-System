"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Mail,
  Play,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

type Contact = {
  name: string;
  email: string;
  company: string;
  role: string;
  event: string;
};

type Reminder = {
  reminder_id: number;
  title: string;
  subject: string;
  scheduled_date: string;
  scheduled_time: string;
  template_name: string;
};

type Report = {
  recipient_name: string;
  email: string;
  company: string;
  role: string;
  event: string;
  reminder_title: string;
  subject: string;
  status: string;
  processed_at: string;
};

type DashboardData = {
  summary: {
    totalEmails: number;
    successful: number;
    pending: number;
    failed: number;
  };
  contacts: Contact[];
  reminders: Reminder[];
  reports: Report[];
};

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const [contactForm, setContactForm] = useState<Contact>({
    name: "",
    email: "",
    company: "",
    role: "",
    event: "",
  });

  const [reminderForm, setReminderForm] = useState({
    title: "",
    subject: "",
    scheduled_date: "",
    scheduled_time: "",
    template_name: "reminder_template.txt",
  });

  async function fetchDashboard() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/dashboard`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      alert("Backend API is not running. Start: uvicorn api:app --reload");
    } finally {
      setLoading(false);
    }
  }

  async function runAutomation() {
    try {
      setRunning(true);
      await fetch(`${API_URL}/api/run-automation`, { method: "POST" });
      await fetchDashboard();
      alert("Automation completed successfully!");
    } catch (error) {
      alert("Could not run automation. Check backend terminal.");
    } finally {
      setRunning(false);
    }
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault();

    await fetch(`${API_URL}/api/add-contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactForm),
    });

    setContactForm({
      name: "",
      email: "",
      company: "",
      role: "",
      event: "",
    });

    setShowContactModal(false);
    await fetchDashboard();
    alert("Contact added successfully!");
  }

  async function addReminder(e: React.FormEvent) {
    e.preventDefault();

    await fetch(`${API_URL}/api/add-reminder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reminderForm),
    });

    setReminderForm({
      title: "",
      subject: "",
      scheduled_date: "",
      scheduled_time: "",
      template_name: "reminder_template.txt",
    });

    setShowReminderModal(false);
    await fetchDashboard();
    alert("Reminder added successfully!");
  }

  function downloadReport() {
    window.open(`${API_URL}/api/download-report`, "_blank");
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const filteredReminders = useMemo(() => {
    if (!data) return [];
    return data.reminders.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const barData = useMemo(() => {
    if (!data) return [];

    const grouped: Record<string, number> = {};

    data.reports.forEach((item) => {
      const date = item.processed_at?.split(" ")[0] || "Unknown";
      grouped[date] = (grouped[date] || 0) + 1;
    });

    if (Object.keys(grouped).length === 0) {
      return [{ day: "No Data", emails: 0 }];
    }

    return Object.entries(grouped).map(([day, emails]) => ({
      day,
      emails,
    }));
  }, [data]);

  const pieData = useMemo(() => {
    if (!data) return [];

    return [
      { name: "Successful", value: data.summary.successful },
      { name: "Pending", value: data.summary.pending },
      { name: "Failed", value: data.summary.failed },
    ];
  }, [data]);

  if (loading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef0ef]">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-8 py-5 shadow-xl">
          <Loader2 className="animate-spin text-[#0b7a4b]" />
          <span className="font-semibold">Loading live dashboard...</span>
        </div>
      </main>
    );
  }

  const successPercent =
    data.summary.totalEmails > 0
      ? Math.round((data.summary.successful / data.summary.totalEmails) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[#eef0ef] p-6 text-[#101513]">
      <div className="mx-auto grid max-w-7xl grid-cols-[230px_1fr] gap-6 rounded-[2rem] bg-white/80 p-4 shadow-2xl">
        <aside className="flex flex-col justify-between rounded-[1.5rem] bg-[#f8faf9] p-5">
          <div>
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b7a4b] text-white">
                <Mail size={22} />
              </div>
              <h1 className="text-xl font-bold">AutoMail</h1>
            </div>

            <p className="mb-4 text-xs font-bold uppercase text-gray-400">
              Live Project
            </p>

            <div className="rounded-xl bg-[#0b7a4b] px-4 py-3 text-sm font-semibold text-white shadow-lg">
              Dashboard
            </div>

            <div className="mt-8 space-y-4 text-sm text-gray-500">
              <div className="flex items-center gap-3">
                <Users size={17} /> Contacts: {data.contacts.length}
              </div>
              <div className="flex items-center gap-3">
                <Clock size={17} /> Reminders: {data.reminders.length}
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={17} /> Reports: {data.reports.length}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#062d1f] p-4 text-white">
            <p className="text-sm opacity-75">Dry Run Mode</p>
            <h3 className="mt-2 text-xl font-bold">Safe Testing Enabled</h3>
            <button
              onClick={runAutomation}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#0b7a4b] py-3 text-sm font-semibold"
            >
              {running ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Play size={16} />
              )}
              Run Now
            </button>
          </div>
        </aside>

        <section className="space-y-5">
          <header className="flex items-center justify-between rounded-[1.5rem] bg-[#f8faf9] p-4">
            <div className="flex w-[420px] items-center gap-3 rounded-full bg-white px-4 py-3 shadow-sm">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reminder..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3c7b7] font-bold">
                V
              </div>
              <div>
                <p className="text-sm font-semibold">Vaidehi</p>
                <p className="text-xs text-gray-400">admin@automail.com</p>
              </div>
            </div>
          </header>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold">Dashboard</h2>
              <p className="mt-1 text-gray-500">
                Live email automation analytics from your Python backend.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-sm"
              >
                <Plus size={18} /> Add Contact
              </button>

              <button
                onClick={() => setShowReminderModal(true)}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-sm"
              >
                <Plus size={18} /> Add Reminder
              </button>

              <button
                onClick={runAutomation}
                className="flex items-center gap-2 rounded-full bg-[#0b7a4b] px-6 py-3 text-white shadow-lg"
              >
                {running ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Play size={18} />
                )}
                Run
              </button>

              <button
                onClick={fetchDashboard}
                className="flex items-center gap-2 rounded-full border border-gray-300 px-5 py-3"
              >
                <RefreshCw size={18} /> Refresh
              </button>

              <button
                onClick={downloadReport}
                className="flex items-center gap-2 rounded-full border border-gray-300 px-5 py-3"
              >
                <Download size={18} /> Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              ["Total Emails", data.summary.totalEmails, "From latest report"],
              ["Successful", data.summary.successful, "Sent / dry-run success"],
              ["Pending", data.summary.pending, "Reminder records"],
              ["Failed", data.summary.failed, "Failed attempts"],
            ].map((card, index) => (
              <div
                key={card[0]}
                className={`rounded-3xl p-5 shadow-sm transition hover:-translate-y-1 ${
                  index === 0
                    ? "bg-gradient-to-br from-[#064b32] to-[#0b7a4b] text-white"
                    : "bg-[#f8faf9]"
                }`}
              >
                <p className="text-sm opacity-80">{card[0]}</p>
                <h3 className="mt-4 text-4xl font-bold">{card[1]}</h3>
                <p className="mt-3 text-xs opacity-70">{card[2]}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1.25fr_0.75fr_0.8fr] gap-4">
            <div className="rounded-3xl bg-[#f8faf9] p-5">
              <h3 className="mb-4 text-lg font-semibold">Email Analytics</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <Tooltip />
                    <Bar
                      dataKey="emails"
                      radius={[20, 20, 20, 20]}
                      fill="#0b7a4b"
                      barSize={38}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl bg-[#f8faf9] p-5">
              <h3 className="text-lg font-semibold">Next Reminder</h3>
              {data.reminders[0] ? (
                <>
                  <p className="mt-6 text-2xl font-bold text-[#064b32]">
                    {data.reminders[0].title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {data.reminders[0].scheduled_date} at{" "}
                    {data.reminders[0].scheduled_time}
                  </p>
                </>
              ) : (
                <p className="mt-6 text-gray-500">No reminders found.</p>
              )}

              <button
                onClick={runAutomation}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#0b7a4b] py-3 text-white"
              >
                {running ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Play size={17} />
                )}
                Run Scheduler
              </button>
            </div>

            <div className="rounded-3xl bg-[#f8faf9] p-5">
              <h3 className="mb-4 text-lg font-semibold">Reminders</h3>

              <div className="space-y-4">
                {filteredReminders.map((item) => (
                  <div key={item.reminder_id} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 text-[#0b7a4b]" size={18} />
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-400">
                        {item.scheduled_date} • {item.scheduled_time}
                      </p>
                    </div>
                  </div>
                ))}

                {filteredReminders.length === 0 && (
                  <p className="text-sm text-gray-400">No matching reminders.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_0.8fr_0.75fr] gap-4">
            <div className="rounded-3xl bg-[#f8faf9] p-5">
              <h3 className="mb-4 text-lg font-semibold">Contact Activity</h3>

              <div className="space-y-4">
                {data.contacts.slice(0, 6).map((person) => (
                  <div key={person.email} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{person.name}</p>
                      <p className="text-xs text-gray-400">
                        {person.role} • {person.company}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-[#0b7a4b]">
                      {person.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#f8faf9] p-5">
              <h3 className="text-lg font-semibold">Delivery Progress</h3>

              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={["#0b7a4b", "#9ccbb4", "#d7d7d7"][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <p className="text-center text-3xl font-bold">{successPercent}%</p>
              <p className="text-center text-sm text-gray-400">Success Rate</p>
            </div>

            <div className="rounded-3xl bg-[#062d1f] p-5 text-white">
              <p className="text-sm opacity-70">Backend Status</p>
              <h3 className="mt-6 text-3xl font-bold">Live API</h3>
              <p className="mt-2 text-sm opacity-70">
                FastAPI connected at port 8000
              </p>

              <button
                onClick={runAutomation}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0b7a4b]"
              >
                {running ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Play size={17} />
                )}
                Run Automation
              </button>

              <button
                onClick={downloadReport}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0b7a4b] px-5 py-3 text-sm"
              >
                <Download size={17} /> Download Report
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-[#f8faf9] p-5">
            <h3 className="mb-4 text-lg font-semibold">Latest Email Report</h3>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-500">
                  <tr>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Reminder</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Processed At</th>
                  </tr>
                </thead>
                <tbody>
                  {data.reports.slice(0, 6).map((row, index) => (
                    <tr key={`${row.email}-${index}`} className="border-t border-gray-100">
                      <td className="p-3 font-medium">{row.recipient_name}</td>
                      <td className="p-3 text-gray-500">{row.email}</td>
                      <td className="p-3">{row.reminder_title}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-[#0b7a4b]">
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{row.processed_at}</td>
                    </tr>
                  ))}

                  {data.reports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-5 text-center text-gray-400">
                        No report found yet. Click Run Automation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {showContactModal && (
        <Modal title="Add New Contact" onClose={() => setShowContactModal(false)}>
          <form onSubmit={addContact} className="space-y-4">
            {(["name", "email", "company", "role", "event"] as const).map((field) => (
              <input
                key={field}
                required
                placeholder={field.toUpperCase()}
                value={contactForm[field]}
                onChange={(e) =>
                  setContactForm({ ...contactForm, [field]: e.target.value })
                }
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#0b7a4b]"
              />
            ))}

            <button className="w-full rounded-full bg-[#0b7a4b] py-3 font-semibold text-white">
              Save Contact
            </button>
          </form>
        </Modal>
      )}

      {showReminderModal && (
        <Modal title="Add New Reminder" onClose={() => setShowReminderModal(false)}>
          <form onSubmit={addReminder} className="space-y-4">
            <input
              required
              placeholder="Reminder Title"
              value={reminderForm.title}
              onChange={(e) =>
                setReminderForm({ ...reminderForm, title: e.target.value })
              }
              className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#0b7a4b]"
            />

            <input
              required
              placeholder="Email Subject"
              value={reminderForm.subject}
              onChange={(e) =>
                setReminderForm({ ...reminderForm, subject: e.target.value })
              }
              className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#0b7a4b]"
            />

            <input
              required
              type="date"
              value={reminderForm.scheduled_date}
              onChange={(e) =>
                setReminderForm({
                  ...reminderForm,
                  scheduled_date: e.target.value,
                })
              }
              className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#0b7a4b]"
            />

            <input
              required
              type="time"
              value={reminderForm.scheduled_time}
              onChange={(e) =>
                setReminderForm({
                  ...reminderForm,
                  scheduled_time: e.target.value,
                })
              }
              className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#0b7a4b]"
            />

            <button className="w-full rounded-full bg-[#0b7a4b] py-3 font-semibold text-white">
              Save Reminder
            </button>
          </form>
        </Modal>
      )}
    </main>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-2">
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}