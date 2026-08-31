import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-data-tome',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './data-tome.component.html',
    styleUrls: ['./data-tome.component.scss']
})
export class DataTomeComponent {
    @Input() item: any;
    @Output() selectItem = new EventEmitter<any>();

    onSelect(event: MouseEvent) {
        this.selectItem.emit({ item: this.item, event });
    }
}
