import { Component, OnInit, Input, EventEmitter, Output, inject } from "@angular/core";
import { QuestionsObject } from "../../common/services/courses-helpers.service";
import { QuestionWithChoices } from "../../admin/course.service";
import { MatCardModule } from "@angular/material/card";

import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule, NgForm } from "@angular/forms";
import { MatRadioModule } from "@angular/material/radio"
import { HelpersService } from "../../common/services/helpers.service";


@Component({
    templateUrl: "./questions.component.html",
    styleUrl: "./questions.component.scss",
    selector: "app-questions",
    standalone: true,
    imports: [
        MatCardModule,
        MatSelectModule,
        MatButtonModule,
        FormsModule,
        MatRadioModule
    ]

})
export class QuestionsComponent implements OnInit {
    @Input() isPartCompleted: boolean = false;
    @Input() questionsObject!: QuestionsObject[]
    @Output() allCorrect = new EventEmitter<void>();

    questionsWithChoices: QuestionWithChoices[] = [];
    submissionError: string | null = null;
    success = false


    hs = inject(HelpersService)


    ngOnInit(): void {

        if (this.questionsObject.length > 0) {
            this.questionsWithChoices = this.questionsObject.map((q, index) => {
                const otherAnswers = this.questionsObject
                    .filter((_, i) => i !== index) // Exclude the current question's answer
                    .map(q => q.answer);

                // Generate choices, ensuring the correct answer is included
                const choices = [q.answer, ...this.generateWrongAnswers(otherAnswers, 3)];
                this.shuffleArray(choices); // Randomize the order

                return {
                    question: q.question,
                    choices: choices,
                    correctAnswer: q.answer,
                    userAnswer: null,
                };
            });
        }

    }


    /**
       * Generates an array of wrong answers, making sure they are distinct
       * from the correct answer and other wrong answers.
       * @param otherAnswers - Array of answers from other questions.
       * @param count - Number of wrong answers to generate.
       * @returns An array of unique wrong answers.
       */
    private generateWrongAnswers(otherAnswers: string[], count: number): string[] {
        const wrongAnswers: string[] = [];
        const maxRetries = 100; // To prevent infinite loops in unlikely scenarios
        let retries = 0;

        while (wrongAnswers.length < count && retries < maxRetries) {
            const randomAnswer = otherAnswers[Math.floor(Math.random() * otherAnswers.length)];
            if (!wrongAnswers.includes(randomAnswer)) {
                wrongAnswers.push(randomAnswer);
            }
            retries++;
        }
        // If unique wrong answers cannot be generated, pad the array.
        if (wrongAnswers.length < count) {
            const prefix = "Wrong Answer ";
            for (let i = wrongAnswers.length; i < count; i++) {
                wrongAnswers.push(prefix + i);
            }
        }
        return wrongAnswers;
    }

    shuffleArray(array: string[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    onSubmit(form: NgForm): void {
        if (form.invalid) {

            this.submissionError = "Vous devez répondre à toutes les questions ";
            this.hs.goToTop()
            this.success = false;
            return;
        }
        this.submissionError = null;
        let allCorrect = true;
        for (const question of this.questionsWithChoices) {
            if (question.userAnswer !== question.correctAnswer) {
                allCorrect = false;
                this.success = false;
                break;
            }
        }

        if (allCorrect) {
            this.success = true
            this.allCorrect.emit();
        }
        else {
            this.success = false
            this.hs.goToTop()
            this.submissionError = "Certaines de vos réponses sont incorrectes"
        }
    }
}