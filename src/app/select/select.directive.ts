import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer,
} from '@angular/core';

import { HandlePropChanges } from '../shared/handle-prop-changes';

@Directive({
  selector: 'select[mzSelect], select[mz-select]',
})
export class MzSelectDirective extends HandlePropChanges implements AfterViewInit, OnInit, OnDestroy {
  // native properties
  @Input() disabled: boolean;
  @Input() placeholder: string;

  // directive properties
  @Input() label: string;
  @Input() filledIn: boolean;

  // push back selected value to ngModelChange
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();

  labelElement: JQuery;
  selectElement: JQuery;
  selectContainerElement: JQuery;
  checkboxElements: JQuery;

  constructor(private elementRef: ElementRef, private renderer: Renderer, private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.initHandlers();
    this.initElements();
    this.handleProperties();
  }

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(this.selectElement, 'material_select');
    this.ngModelChange.emit(this.selectElement.val());
    this.selectElement.on('change', ($event: any) => this.ngModelChange.emit($event.target.value));

    // Need to be done after view init or else the multi-select checkbox are not yet in the DOM
    this.initFilledIn();
  }

  ngOnDestroy() {
    this.renderer.invokeElementMethod(this.selectElement, 'material_select', ['destroy']);
    this.selectElement.off();
  }

  initHandlers() {
    this.handlers = {
      disabled: () => this.handleDisabled(),
      label: () => this.handleLabel(),
      placeholder: () => this.handlePlaceholder(),
    };
  }

  initElements() {
    this.selectElement = $(this.elementRef.nativeElement);
    this.selectContainerElement = $(this.elementRef.nativeElement).parent('.input-field');
    this.labelElement = this.createLabelElement();
  }

  initFilledIn() {
    this.checkboxElements = this.selectContainerElement.find(':checkbox');
    this.handlers['filledIn'] = () => this.handleFilledIn();
    this.handleFilledIn();
  }

  createLabelElement() {
    const labelElement = document.createElement('label');

    this.renderer.invokeElementMethod(this.selectContainerElement, 'append', [labelElement]);

    return $(labelElement);
  }

  handleProperties() {
    if (this.selectContainerElement.length === 0) {
      console.error('Select with mz-select directive must be place inside a [mz-select-container] tag', this.selectElement);
      return;
    }

    super.executePropHandlers();

    this.selectFirstItem();
  }

  selectFirstItem() {
    const firstItem = this.selectElement.children().first();

    if (firstItem.length > 0) {
      firstItem[0].setAttribute('selected', 'true');
    }
  }

  handleDisabled() {
    this.renderer.setElementProperty(this.selectElement[0], 'disabled', !!this.disabled);
    this.renderer.invokeElementMethod(this.selectElement, 'material_select');
  }

  handleLabel() {
    if (this.label != null) {
      this.renderer.invokeElementMethod(this.labelElement, 'text', [this.label]);
    }
  }

  handleFilledIn() {
    if (this.checkboxElements.length > 0) {
      this.checkboxElements.toArray().forEach(checkboxElement => {
        this.renderer.setElementClass(checkboxElement, 'filled-in', !!this.filledIn);
      });
    }
  }

  handlePlaceholder() {
    const placeholderElement = this.selectElement.children(':disabled').first();

    // if placeholder element exists
    if (placeholderElement.length > 0) {

      if (this.placeholder) {
        // update existing placeholder element
        this.renderer.invokeElementMethod(placeholderElement, 'text', [this.placeholder]);
      } else {
        // remove existing placeholder element
        this.renderer.invokeElementMethod(placeholderElement, 'remove');

        // Force trigger change event since it's not triggered when value change programmatically
        this.renderer.invokeElementMethod(this.selectElement, 'change');
        // Required if we don't want exception "Expression has changed after it was checked." https://github.com/angular/angular/issues/6005
        this.changeDetectorRef.detectChanges();
      }
    } else {

      if (this.placeholder) {
        // add placeholder element
        const placeholderText = document.createTextNode(this.placeholder);
        const placeholderOption = document.createElement('option');
        placeholderOption.disabled = true;
        placeholderOption.appendChild(placeholderText);

        this.renderer.invokeElementMethod(this.selectElement.children().first(), 'before', [placeholderOption]);
      }
    }

    this.renderer.invokeElementMethod(this.selectElement, 'material_select');
  }
}
