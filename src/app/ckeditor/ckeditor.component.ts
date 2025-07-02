import { ChangeDetectorRef, Component,ViewEncapsulation, type AfterViewInit, ElementRef, ViewChild, output, Output, EventEmitter, forwardRef, Input } from '@angular/core';

import { ChangeEvent, CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
	type EditorConfig,
	DecoupledEditor,
	Alignment,
	AutoLink,
	Autosave,
	BalloonToolbar,
	Bold,
	Code,
	Essentials,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	Heading,
	HorizontalLine,
	ImageEditing,
	ImageUtils,
	Indent,
	IndentBlock,
	Italic,
	Link,
	Paragraph,
	RemoveFormat,
	Strikethrough,
	Subscript,
	Superscript,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	Underline
} from 'ckeditor5';

import translations from 'ckeditor5/translations/fr.js';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

const LICENSE_KEY = 'GPL'
@Component({
  selector: 'app-editor',
  imports: [CKEditorModule],
  templateUrl: './ckeditor.component.html',
  styleUrl: './ckeditor.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [ {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CkeditorComponent),
    multi: true
}]

})
export class CkeditorComponent implements AfterViewInit{
 @Input() innerValue = ""

    // ControlValueAccessor methods
    writeValue(value: any): void {
        this.innerValue = value || ""
        // You might need to set the editor content here
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    onChange: any = () => {};
    onTouched: any = () => {};

    onEditorChange(event: any) {
      const data = event.editor.getData();
      
      this.innerValue = data; // Update the inner value
      this.onChange(this.innerValue); // Notify Angular of the change
      this.onTouched(); // Mark as touched
    }

   

  @ViewChild('editorToolbarElement') private editorToolbar!: ElementRef<HTMLDivElement>;
	@ViewChild('editorMenuBarElement') private editorMenuBar!: ElementRef<HTMLDivElement>;

	constructor(private changeDetector: ChangeDetectorRef) {}

	public isLayoutReady = false;
	public Editor = DecoupledEditor;
	public config: EditorConfig = {}; // CKEditor needs the DOM tree before calculating the configuration.
	public ngAfterViewInit(): void {
		this.config = {
			toolbar: {
				items: [
					'heading',
					'|',
					'fontSize',
					'fontFamily',
					'fontColor',
					'fontBackgroundColor',
					'|',
					'bold',
					'italic',
					'underline',
					'|',
					'link',
					'insertTable',
					'|',
					'alignment',
					'|',
					'outdent',
					'indent'
				],
				shouldNotGroupWhenFull: false
			},
			plugins: [
				Alignment,
				AutoLink,
				Autosave,
				BalloonToolbar,
				Bold,
				Code,
				Essentials,
				FontBackgroundColor,
				FontColor,
				FontFamily,
				FontSize,
				Heading,
				HorizontalLine,
				ImageEditing,
				ImageUtils,
				Indent,
				IndentBlock,
				Italic,
				Link,
				Paragraph,
				RemoveFormat,
				Strikethrough,
				Subscript,
				Superscript,
				Table,
				TableCaption,
				TableCellProperties,
				TableColumnResize,
				TableProperties,
				TableToolbar,
				Underline
			],
			balloonToolbar: ['bold', 'italic', '|', 'link'],
			fontFamily: {
				supportAllValues: true
			},
			fontSize: {
				options: [10, 12, 14, 'default', 18, 20, 22],
				supportAllValues: true
			},
			heading: {
				options: [
					{
						model: 'paragraph',
						title: 'Paragraph',
						class: 'ck-heading_paragraph'
					},
					{
						model: 'heading1',
						view: 'h1',
						title: 'Heading 1',
						class: 'ck-heading_heading1'
					},
					{
						model: 'heading2',
						view: 'h2',
						title: 'Heading 2',
						class: 'ck-heading_heading2'
					},
					{
						model: 'heading3',
						view: 'h3',
						title: 'Heading 3',
						class: 'ck-heading_heading3'
					},
					{
						model: 'heading4',
						view: 'h4',
						title: 'Heading 4',
						class: 'ck-heading_heading4'
					},
					{
						model: 'heading5',
						view: 'h5',
						title: 'Heading 5',
						class: 'ck-heading_heading5'
					},
					{
						model: 'heading6',
						view: 'h6',
						title: 'Heading 6',
						class: 'ck-heading_heading6'
					}
				]
			},
			initialData:
				'<h2>Congratulations on setting up CKEditor 5! 🎉</h2>\n<p>\n\tYou\'ve successfully created a CKEditor 5 project. This powerful text editor\n\twill enhance your application, enabling rich text editing capabilities that\n\tare customizable and easy to use.\n</p>\n<h3>What\'s next?</h3>\n<ol>\n\t<li>\n\t\t<strong>Integrate into your app</strong>: time to bring the editing into\n\t\tyour application. Take the code you created and add to your application.\n\t</li>\n\t<li>\n\t\t<strong>Explore features:</strong> Experiment with different plugins and\n\t\ttoolbar options to discover what works best for your needs.\n\t</li>\n\t<li>\n\t\t<strong>Customize your editor:</strong> Tailor the editor\'s\n\t\tconfiguration to match your application\'s style and requirements. Or\n\t\teven write your plugin!\n\t</li>\n</ol>\n<p>\n\tKeep experimenting, and don\'t hesitate to push the boundaries of what you\n\tcan achieve with CKEditor 5. Your feedback is invaluable to us as we strive\n\tto improve and evolve. Happy editing!\n</p>\n<h3>Helpful resources</h3>\n<ul>\n\t<li>📝 <a href="https://portal.ckeditor.com/checkout?plan=free">Trial sign up</a>,</li>\n\t<li>📕 <a href="https://ckeditor.com/docs/ckeditor5/latest/installation/index.html">Documentation</a>,</li>\n\t<li>⭐️ <a href="https://github.com/ckeditor/ckeditor5">GitHub</a> (star us if you can!),</li>\n\t<li>🏠 <a href="https://ckeditor.com">CKEditor Homepage</a>,</li>\n\t<li>🧑‍💻 <a href="https://ckeditor.com/ckeditor-5/demo/">CKEditor 5 Demos</a>,</li>\n</ul>\n<h3>Need help?</h3>\n<p>\n\tSee this text, but the editor is not starting up? Check the browser\'s\n\tconsole for clues and guidance. It may be related to an incorrect license\n\tkey if you use premium features or another feature-related requirement. If\n\tyou cannot make it work, file a GitHub issue, and we will help as soon as\n\tpossible!\n</p>\n',
			language: 'fr',
			licenseKey: LICENSE_KEY,
			link: {
				addTargetToExternalLinks: true,
				defaultProtocol: 'https://',
				decorators: {
					toggleDownloadable: {
						mode: 'manual',
						label: 'Downloadable',
						attributes: {
							download: 'file'
						}
					}
				}
			},
			menuBar: {
				isVisible: true
			},
			placeholder: 'Type or paste your content here!',
			table: {
				contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
			},
			translations: [translations]
		};

		this.isLayoutReady = true;
		this.changeDetector.detectChanges();
	}

	public onReady(editor: DecoupledEditor): void {

    editor.setData(this.innerValue)

    

		Array.from(this.editorToolbar.nativeElement.children).forEach(child => child.remove());
		Array.from(this.editorMenuBar.nativeElement.children).forEach(child => child.remove());

		this.editorToolbar.nativeElement.appendChild(editor.ui.view.toolbar.element!);
		this.editorMenuBar.nativeElement.appendChild(editor.ui.view.menuBarView.element!);

   
	}

}
