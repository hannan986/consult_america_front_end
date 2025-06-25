import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateService } from '../services/candidate';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidate-detail',
  templateUrl: './candidate-details.html',
  styleUrls: ['./candidate-details.scss'],
  standalone: true, // ✅ Required if you're using standalone components
  imports: [CommonModule]
})
export class CandidateDetails implements OnInit {
 
  candidate: any;
  resumes: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private candidateService: CandidateService
  ) {}


  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

     

  this.candidateService.getCandidate(id).subscribe((res) => {
    this.candidate = res.body;
    if (this.candidate?.email) {
      this.candidateService.getResumesByEmail(this.candidate.email).subscribe((resumes) => {
        this.resumes = resumes;
      });
    }
  });
  }

  loadResumesByEmail(email: string): void {
    this.candidateService.getResumesByEmail(email).subscribe(data => {
      console.log(data);
      this.resumes = data;
    });
  }
}