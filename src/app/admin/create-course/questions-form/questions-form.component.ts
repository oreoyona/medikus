import { Component, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-questions-form',
  templateUrl: './questions-form.component.html',
  styleUrls: ['./questions-form.component.scss'],
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule]
})
export class QuestionsFormComponent {
  @Input() module!: FormGroup;

  get questionsFormArray(): FormArray {
    return this.module.get('content') as FormArray;
  }

  addQuestion() {
    const questionFormGroup = this.module.get('content') as FormArray;
    questionFormGroup.push(this.createQuestionFormGroup());
  }

  createQuestionFormGroup(): FormGroup {
    return new FormGroup({
      question: new FormControl(''),
      response: new FormControl('')
    });
  }
}