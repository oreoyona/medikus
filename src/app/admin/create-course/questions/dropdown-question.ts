import { QuestionBase } from "./questions-base";

export class DropdownQuestion extends QuestionBase<string> {
  override controlType = 'dropdown';
}