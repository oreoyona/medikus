import { QuestionBase } from "./questions-base";

export class TextboxQuestion extends QuestionBase<string> {
  override controlType = 'textbox';
}