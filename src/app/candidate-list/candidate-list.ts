
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CandidateService } from '../services/candidate';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { L } from '@angular/cdk/keycodes';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.html',
  styleUrls: ['./candidate-list.scss'],
  standalone: true, // ✅ Required if you're using standalone components
  imports: [CommonModule,FormsModule,NgxPaginationModule]
})


export class CandidateList implements OnInit {
 
dropdownOpen = false;

toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}

// // Optional: close dropdown when clicking outside (better UX)
// @HostListener('document:click', ['$event'])
// onClickOutside(event: MouseEvent) {
//   const target = event.target as HTMLElement;
//   const clickedInside = target.closest('.column-toggle-dropdown');
//   if (!clickedInside) {
//     this.dropdownOpen = false;
//   }
// }


users: any[] = [];
  filteredUsers: any[] = [];
  searchText: string = '';
  currentPage: number = 1; 
  allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'primaryPhone', label: 'Primary Phone' },
    { key: 'secondaryPhone', label: 'Secondary Phone' },
    { key: 'primaryAddress', label: 'Primary Address' },
    { key: 'secondaryAddress', label: 'Secondary Address' },
    { key: 'yearsOfExperience', label: 'Years of Experience' },
    { key: 'clientName1', label: 'Client Name 1' },
    { key: 'clientName2', label: 'Client Name 2' },
    { key: 'clientName3', label: 'Client Name 3' },
    { key: 'techStack', label: 'Tech Stack' },
    { key: 'role', label: 'Role' },
    { key: 'resumes', label: 'Resumes' }
  ];

visibleColumns: { [key: string]: boolean } = {};
toggleSelectAll(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  this.filteredUsers.forEach(user => user.selected = checked);
}

  constructor(private userService: CandidateService, private router: Router) {
    this.allColumns.forEach(col => this.visibleColumns[col.key] = true);
  }

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.userService.getCandidates().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error fetching users', err);
      }
    });
  }

    applyFilter(): void {
    const lowerSearch = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      Object.values(user).some(val =>
        typeof val === 'string' && val.toLowerCase().includes(lowerSearch)
      )
    );
  }

  viewDetails(id: number) {
  console.log("Navigating to candidate details with ID =", id);
  this.router.navigate(['/candidates', id]).then(success => {
    if (success) {
      console.log('Navigation successful!');
    } else {
      console.log('Navigation failed!');
    }
  });
}

  // Export visible candidates to CSV (Excel-readable)
  exportToCsv(filename = 'candidates.csv') {
    const rows: string[] = [];
    // header using visible columns
    const headers = this.allColumns
      .filter(c => this.visibleColumns[c.key])
      .map(c => `"${c.label.replace(/"/g, '""')}"`);
    // ensure resumes column is included if visible
    rows.push(headers.join(','));

    for (const u of this.filteredUsers) {
      const cols: string[] = [];
      for (const col of this.allColumns.filter(c => this.visibleColumns[c.key])) {
        let v: any = u[col.key];
        if (col.key === 'resumes') {
          // build a semicolon-separated list of resume download urls (if available)
          const rlist = Array.isArray(u.resumes) ? u.resumes : [];
          const urls = rlist.map((r: any) => {
            // prefer downloadUrl if provided, else construct from API base and id
            if (r.downloadUrl) return r.downloadUrl;
            if (r.id) return `${(window as any).location.origin}/resumes/${r.id}/download`;
            return r.fileName || '';
          });
          v = urls.join('; ');
        }
        if (v === undefined || v === null) v = '';
        // escape quotes
        const cell = String(v).replace(/"/g, '""');
        cols.push(`"${cell}"`);
      }
      rows.push(cols.join(','));
    }

    const csv = rows.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }



}




