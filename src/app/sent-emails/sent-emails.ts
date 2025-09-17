import { Component, OnInit, Inject } from '@angular/core';
import { DatePipe, NgIf, NgFor, UpperCasePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SentEmailService, SentEmail } from '../services/sent-email';

type SortKey = 'date_desc' | 'date_asc' | 'candidate_asc' | 'position_asc';

@Component({
  selector: 'app-sent-emails',
  templateUrl: './sent-emails.html',
  styleUrls: ['./sent-emails.scss'],
  standalone: true,
  imports: [DatePipe, NgIf, NgFor, UpperCasePipe, NgClass, FormsModule],
})
export class SentEmailsComponent implements OnInit {
  sentEmails: SentEmail[] = [];
  displayEmails: SentEmail[] = [];
  loading = true;

  searchTerm = '';
  sortKey: SortKey = 'date_desc';

  constructor(@Inject(SentEmailService) private sentEmailService: SentEmailService) {}

  get hasItems(): boolean {
    return (this.sentEmails?.length || 0) > 0;
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.sentEmailService.loadFromServer();
    } catch {
      // ignore; fall back to local cache
    } finally {
      this.sentEmails = this.sentEmailService.getEmails() || [];
      this.applyFiltersAndSort();
      this.loading = false;
    }
  }

  // Apply search + sort to produce displayEmails
  applyFiltersAndSort(): void {
    const term = (this.searchTerm || '').trim().toLowerCase();

    let list = [...(this.sentEmails || [])];

    if (term) {
      list = list.filter((e) => {
        const safe = (v?: string) => (v || '').toLowerCase();
        return (
          safe(e.candidateName).includes(term) ||
          safe(e.position).includes(term) ||
          safe(e.candidateEmail).includes(term) ||
          safe(e.recipientEmail).includes(term) ||
          safe(e.subject).includes(term) ||
          safe(e.message).includes(term)
        );
      });
    }

    const getTime = (d?: Date | string | number) => (d ? new Date(d).getTime() : 0);
    list.sort((a, b) => {
      switch (this.sortKey) {
        case 'date_asc':
          return getTime(a.date) - getTime(b.date);
        case 'candidate_asc':
          return (a.candidateName || '').localeCompare(b.candidateName || '', undefined, { sensitivity: 'base' });
        case 'position_asc':
          return (a.position || '').localeCompare(b.position || '', undefined, { sensitivity: 'base' });
        case 'date_desc':
        default:
          return getTime(b.date) - getTime(a.date);
      }
    });

    this.displayEmails = list;
  }

  onSearch(value: string): void {
    this.searchTerm = value || '';
    this.applyFiltersAndSort();
  }

  loadEmails(): void {
    this.sentEmails = this.sentEmailService.getEmails() || [];
    this.applyFiltersAndSort();
  }

  async confirmClearAll(): Promise<void> {
    if (!this.hasItems) return;
    const res = await Swal.fire({
      title: 'Clear all applied jobs?',
      text: 'This will remove all records from this list.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear all',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });
    if (res.isConfirmed) {
      this.clearAll();
      await Swal.fire({ icon: 'success', title: 'Cleared', timer: 1000, showConfirmButton: false });
    }
  }

  clearAll(): void {
    this.sentEmailService.clearEmails();
    this.loadEmails();
  }

  exportAsCSV(): void {
    if (!this.hasItems) {
      Swal.fire({ icon: 'info', title: 'Nothing to export', timer: 1200, showConfirmButton: false });
      return;
    }

    const rows = (this.displayEmails.length ? this.displayEmails : this.sentEmails).map((email) => ({
      Date: email.date ? new Date(email.date).toISOString() : '',
      CandidateName: email.candidateName || '',
      CandidateEmail: email.candidateEmail || '',
      Recipient: email.recipientEmail || '',
      ResumeId: email.resumeId || '',
      Position: email.position || '',
      Subject: email.subject || '',
      Message: email.message || '',
    }));

    const headers = Object.keys(rows[0]);
    const esc = (v: unknown) => {
      const s = v == null ? '' : String(v);
      // CSV escaping: wrap in quotes and escape internal quotes
      return `"${s.replace(/"/g, '""')}"`;
    };

    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc((r as any)[h])).join(','))].join('\n');

    // Add BOM for Excel compatibility
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `sent_emails_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  trackByItem(index: number, item: SentEmail): string {
    // Prefer stable unique identity: resumeId, else composite fallback
    const key =
      (item as any).id ||
      item.resumeId ||
      `${new Date(item.date || 0).getTime()}-${item.candidateEmail || ''}-${item.recipientEmail || ''}-${index}`;
    return String(key);
  }

  // Expose encoding helper for template binding (Angular template type-checker needs class member)
  encodeURIComponent(value: string): string {
    try {
      return encodeURIComponent(value || '');
    } catch {
      return '';
    }
  }

  viewDetails(email: SentEmail): void {
    const esc = (s: any) => {
      if (s === undefined || s === null) return '';
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    const html = `
      <div style="display:flex;gap:14px;align-items:flex-start;text-align:left">
        <div style="flex:0 0 36%;min-width:220px">
          <div style="font-weight:700;margin-bottom:6px">${esc(email.position) || 'N/A'}</div>
          <div style="color:#374151;margin-bottom:6px">
            ${esc(email.candidateName)} &nbsp; &lt;<a href="mailto:${esc(email.candidateEmail)}">${esc(email.candidateEmail)}</a>&gt;
          </div>
          <div style="color:#6b7280;margin-bottom:6px"><strong>To:</strong> ${esc(email.recipientEmail)}</div>
          <div style="color:#6b7280;margin-bottom:6px"><strong>Subject:</strong> ${esc(email.subject)}</div>
          <div style="margin-top:8px;color:#6b7280;font-size:0.9rem">Resume ID: ${esc(email.resumeId) || 'N/A'}</div>
          <div style="margin-top:8px;color:#6b7280;font-size:0.9rem">Date: ${email.date ? new Date(email.date).toLocaleString() : 'N/A'}</div>
        </div>
        <div style="flex:1;max-height:360px;overflow:auto;padding:10px;border-radius:8px;background:#fff;border:1px solid #eef2f6">
          <pre style="white-space:pre-wrap;word-break:break-word;margin:0;font-family:inherit;color:#0f1724">${esc(email.message) || '<em>No message provided</em>'}</pre>
        </div>
      </div>
    `;

    const copyToClipboard = async (text: string) => {
      try {
        if (navigator && (navigator as any).clipboard?.writeText) {
          await (navigator as any).clipboard.writeText(text || '');
          return true;
        }
      } catch {}
      try {
        const ta = document.createElement('textarea');
        ta.value = text || '';
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch {
        return false;
      }
    };

    Swal.fire({
      title: 'Applied Job Details',
      html,
      width: 820,
      showCloseButton: true,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Download Resume',
      denyButtonText: 'Copy Message',
      cancelButtonText: 'Close',
      preConfirm: () => {
        if (email.resumeId) {
          const url = `${(window as any).location.origin}/resumes/${email.resumeId}/download`;
          window.open(url, '_blank');
        } else {
          const fallback = `${(window as any).location.origin}/resumes`;
          window.open(fallback, '_blank');
        }
      },
      preDeny: async () => {
        const ok = await copyToClipboard(email.message || '');
        return ok;
      },
    }).then((res) => {
      if (res.isDenied) {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Message copied to clipboard',
          showConfirmButton: false,
          timer: 1200,
        });
      }
    });
  }
}