import { Component } from '@angular/core';
import { HeaderComponent } from "../common/header/header.component";
import { MatButtonModule } from '@angular/material/button';
import { FooterComponent } from "../common/footer/footer.component";

@Component({
  selector: 'app-single-cours',
  imports: [HeaderComponent, MatButtonModule, FooterComponent],
  templateUrl: './single-cours.component.html',
  styleUrl: './single-cours.component.scss'
})
export class SingleCoursComponent {
  coursTitle = "Course Title"
  CourseDateAndLocation = `Thursday, February 6, 2025, 12:00 PM - 1:00 PM, A Live Webinar`
  courseCompleteDescription = `The Office of Faculty Development and Diversity is hosting a faculty webinar with the Health Equity Action Leadership (HEAL) Network and the Stanford Center for Continuing Medical Education (CME) to highlight Health Disparities. Join us to increase awareness about the Supreme Court 2023 Affirmative Action Ruling: What Does It Mean for Health Equity and Public Health?

Our speaker, Michelle A. Williams, ScD is a renowned epidemiologist, an award-wining educator, and a widely recognized academic leader. `
  courseRegistrationDetails = "Registration is free. The Zoom link for the webinar will be sent to you via email upon registration. Be sure to use an email address you check frequently. "
  courseTargetAudience = `Specialties - Non-clinical
Professions - Fellow/Resident, Non-Physician, Physician, Student`;
  courseObjectives = ['Examine the interplay between health equity and Public Health as it relates to the Supreme Court 2023 ruling.', `Explore why some researchers have chosen to focus their careers in this space.
`, `Identify strategies to mitigate potential negative impacts of the Supreme Court's 2023 ruling on health equity within healthcare systems.
`];

    courseQuestion = [
      {
        name: "Alyssa Elley",
        Title: "Education Events Specialist",
        Email: "aelsey@stanford.edu"
      }
    ]
}
