import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { IndianRupee, FileText, CheckSquare, Banknote, Activity, Receipt, Package, Download, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PaymentsTab from '../components/PaymentsTab';
import ExpensesTab from '../components/ExpensesTab';
import DocumentsTab from '../components/DocumentsTab';
import ProgressTab from '../components/ProgressTab';
import InvoicesTab from '../components/InvoicesTab';
import MaterialsTab from '../components/MaterialsTab';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    const res = await api.get(`/projects/${id}`);
    setProject(res.data);
  };

  if (!project) return <div>Loading...</div>;

  const generateLedgerPDF = async () => {
    const payRes = await api.get(`/payments/project/${project.id}`);
    const expRes = await api.get(`/expenses/project/${project.id}`);
    
    const payments = payRes.data || [];
    const expenses = expRes.data || [];
    
    const totalReceived = payments.reduce((sum, p) => sum + (p.amount_received || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const pendingBalance = project.value - totalReceived;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(`Client Ledger: ${project.name}`, 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Project ID: ${project.id} | Status: ${project.status}`, 14, 30);
      
      // Summary Box
      autoTable(doc, {
        startY: 35,
        head: [['Financial Summary', 'Amount']],
        body: [
          ['Total Project Value', `Rs. ${project.value.toLocaleString('en-IN')}`],
          ['Amount Received (Till Now)', `Rs. ${totalReceived.toLocaleString('en-IN')}`],
          ['Pending Balance (To Pay)', `Rs. ${pendingBalance.toLocaleString('en-IN')}`],
          ['Total Expenses (Internal)', `Rs. ${totalExpenses.toLocaleString('en-IN')}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
      });

      // Payments
      if (payments.length > 0) {
        let paymentBody = [];
        payments.forEach(p => {
          paymentBody.push([
            p.stage_name || 'N/A', 
            `Rs. ${p.expected_amount?.toLocaleString('en-IN') || 0}`, 
            `Rs. ${p.amount_received?.toLocaleString('en-IN') || 0}`, 
            p.status, 
            p.due_date || 'N/A'
          ]);
          
          if (p.history && p.history.length > 0) {
            p.history.forEach((h, index) => {
              paymentBody.push([
                `   ↳ Payment ${index + 1}`,
                '',
                `Rs. ${h.amount?.toLocaleString('en-IN') || 0}`,
                'Received',
                h.payment_date || 'N/A'
              ]);
            });
          }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Payment Stage', 'Expected', 'Received', 'Status', 'Date']],
          body: paymentBody,
          theme: 'striped',
          headStyles: { fillColor: [39, 174, 96] }
        });
      }

      // Expenses
      if (expenses.length > 0) {
        autoTable(doc, {
          startY: (doc.lastAutoTable ? doc.lastAutoTable.finalY : 35) + 15,
          head: [['Category', 'Amount', 'Date', 'Description']],
          body: expenses.map(e => [
            e.category || 'N/A', 
            `Rs. ${e.amount?.toLocaleString('en-IN') || 0}`, 
            e.date || 'N/A',
            e.description || 'N/A'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [192, 57, 43] },
          columnStyles: {
            3: { cellWidth: 60 } // Make description column wider
          }
        });
      }

      return doc;
  };

  const exportLedger = async () => {
    try {
      const doc = await generateLedgerPDF();
      doc.save(`Ledger_${project.id}.pdf`);
    } catch (err) {
      console.error("Failed to export ledger", err);
      alert("Failed to export ledger. Check console for details.");
    }
  };

  const viewLedger = async () => {
    try {
      const doc = await generateLedgerPDF();
      window.open(doc.output('bloburl'), '_blank');
    } catch (err) {
      console.error("Failed to view ledger", err);
      alert("Failed to view ledger. Check console for details.");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="page-title" style={{ marginBottom: '0.5rem' }}>{project.name}</h2>
        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <span>ID: {project.id}</span>
          <span>•</span>
          <span>Status: <strong style={{ color: project.status === 'Completed' ? 'var(--success)' : 'var(--accent-color)' }}>{project.status}</strong></span>
          <span>•</span>
          <span>Value: ₹{project.value.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview', icon: CheckSquare },
          { id: 'progress', label: 'Progress', icon: Activity },
          { id: 'materials', label: 'Materials', icon: Package },
          { id: 'payments', label: 'Payments', icon: IndianRupee },
          { id: 'expenses', label: 'Expenses', icon: Banknote },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'invoices', label: 'Invoices', icon: Receipt }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
              marginBottom: '-9px'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ minHeight: '400px' }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Project Details</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={viewLedger} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={16} /> View Ledger
                </button>
                <button className="btn btn-secondary" onClick={exportLedger} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={16} /> Export
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Client</p>
                <p style={{ fontWeight: 500 }}>{project.client_name || 'N/A'}</p>
                {project.client_phone && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{project.client_phone}</p>
                )}
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Location</p>
                <p style={{ fontWeight: 500 }}>{project.location || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Project Type</p>
                <span className="badge badge-info" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {project.project_type || 'Cement + Interiors'}
                </span>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Start Date</p>
                <p style={{ fontWeight: 500 }}>{project.start_date || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Expected Completion</p>
                <p style={{ fontWeight: 500 }}>{project.expected_completion || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Overall Progress</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1, backgroundColor: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${project.progress_percentage}%`, backgroundColor: 'var(--success)', height: '100%', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <span style={{ fontWeight: 500 }}>{project.progress_percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'progress' && (
          <ProgressTab 
            project={project} 
            onProgressUpdate={(addedPercentage) => {
              setProject({
                ...project, 
                progress_percentage: Math.min(100, project.progress_percentage + addedPercentage),
                status: project.progress_percentage + addedPercentage >= 100 ? 'Completed' : project.status
              })
            }} 
          />
        )}
        
        {activeTab === 'materials' && <MaterialsTab projectId={project.id} />}
        {activeTab === 'payments' && <PaymentsTab projectId={project.id} />}
        {activeTab === 'expenses' && <ExpensesTab projectId={project.id} />}
        {activeTab === 'documents' && <DocumentsTab projectId={project.id} />}
        {activeTab === 'invoices' && <InvoicesTab projectId={project.id} />}
      </div>
    </div>
  );
};

export default ProjectDetails;
