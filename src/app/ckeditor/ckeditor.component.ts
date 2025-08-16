import { ChangeDetectorRef, Component, ViewEncapsulation, type AfterViewInit, ElementRef, ViewChild, forwardRef, inject, OnDestroy } from '@angular/core';

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
import { ConfigService } from '../config.service';

const LICENSE_KEY = 'GPL'
@Component({
    selector: 'app-editor',
    standalone: true, // Assuming this is standalone based on the imports array
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
export class CkeditorComponent implements AfterViewInit, OnDestroy{
    // We can remove @Input() innerValue and rely on the value passed through ControlValueAccessor
    
    private editorInstance: DecoupledEditor | null = null;
    private _value: string = "";
    configService = inject(ConfigService);

    // ControlValueAccessor methods
    writeValue(value: any): void {
        this._value = value || "";
        // Set the editor's data if the instance is ready.
        // If it's not ready, the data will be set in the onReady method.
        if (this.editorInstance) {
            this.editorInstance.setData(this._value);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    onChange: any = () => {};
    onTouched: any = () => {};

    onEditorChange({ editor }: ChangeEvent): void {
      const data = editor.getData();
      this._value = data; // Update the internal value
      this.onChange(this._value); // Notify Angular of the change
      this.onTouched(); // Mark as touched
    }
    
    @ViewChild('editorToolbarElement') private editorToolbar!: ElementRef<HTMLDivElement>;
    @ViewChild('editorMenuBarElement') private editorMenuBar!: ElementRef<HTMLDivElement>;

    constructor(private changeDetector: ChangeDetectorRef) {}
    ngOnDestroy(): void {
        this.configService.editorLoaded.set(false);
    }

    public isLayoutReady = false;
    public Editor = DecoupledEditor;
    public config: EditorConfig = {};
    
    public ngAfterViewInit(): void {
        this.config = {
            toolbar: {
                items: [
                    'heading', '|', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
                    'bold', 'italic', 'underline', '|', 'link', 'insertTable', '|', 'alignment', '|',
                    'outdent', 'indent'
                ],
                shouldNotGroupWhenFull: false
            },
            plugins: [
                Alignment, AutoLink, Autosave, BalloonToolbar, Bold, Code, Essentials,
                FontBackgroundColor, FontColor, FontFamily, FontSize, Heading, HorizontalLine,
                ImageEditing, ImageUtils, Indent, IndentBlock, Italic, Link, Paragraph,
                RemoveFormat, Strikethrough, Subscript, Superscript, Table, TableCaption,
                TableCellProperties, TableColumnResize, TableProperties, TableToolbar, Underline
            ],
            balloonToolbar: ['bold', 'italic', '|', 'link'],
            fontFamily: { supportAllValues: true },
            fontSize: {
                options: [10, 12, 14, 'default', 18, 20, 22],
                supportAllValues: true
            },
            heading: {
                options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                    { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                    { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                    { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
                    { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
                ]
            },
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
            menuBar: { isVisible: true },
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
        //notify the config service that the ckeditor is ready

        this.configService.editorLoaded.set(true);

        this.editorInstance = editor;
        
        // This is crucial: set the initial value after the editor is ready
        this.editorInstance.setData(this._value);

        Array.from(this.editorToolbar.nativeElement.children).forEach(child => child.remove());
        Array.from(this.editorMenuBar.nativeElement.children).forEach(child => child.remove());

        this.editorToolbar.nativeElement.appendChild(editor.ui.view.toolbar.element!);
        this.editorMenuBar.nativeElement.appendChild(editor.ui.view.menuBarView.element!);
    }
}