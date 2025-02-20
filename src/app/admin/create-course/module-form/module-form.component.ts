import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QuestionsFormComponent } from "../questions-form/questions-form.component";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-module-form',
  templateUrl: './module-form.component.html',
  styleUrls: ['./module-form.component.scss'],
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, QuestionsFormComponent, MatExpansionModule, MatSelectModule, NgIf]
})
export class ModuleFormComponent {
  @Input() module!: any;
  @Input() formParent!:FormGroup;
  @Input() options!: string[];
  @Output() contentTypeChanged = new EventEmitter<FormGroup>(); // Emit the event


  get contentFormArray(): FormArray {
    return this.module.get('content') as FormArray;
  }
  onContentTypeChange() {
    this.contentTypeChanged.emit(this.module); // Emit the event with the module
  }

}