import { Component, ViewChild, ElementRef, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../services/animation.service';
import { DataTomeComponent } from '../data-tome/data-tome.component';

@Component({
    selector: 'app-library-warp',
    standalone: true,
    imports: [CommonModule, DataTomeComponent],
    templateUrl: './library-warp.component.html',
    styleUrls: ['./library-warp.component.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LibraryWarpComponent implements OnInit, OnDestroy {
    @ViewChild('hudContainer') hud!: ElementRef;
    isCurating = false;
    searching = false;

    // Example Library Data
    shelfBatchA: any[] = [];
    shelfBatchB: any[] = [];

    constructor(private animService: AnimationService) { }

    ngOnInit() {
        // Suppress the global auto-injected launchpad so we don't end up with two
        document.body.classList.add('hide-global-launchpad');

        // Generate infinite mock data pieces
        for (let i = 0; i < 60; i++) {
            if (i % 15 === 0) {
                this.shelfBatchA.push({
                    isCatalog: true,
                    title: `INDEX A.${Math.floor(i / 15) + 1} > PROTOCOLS`,
                });
                this.shelfBatchB.push({
                    isCatalog: true,
                    title: `INDEX B.${Math.floor(i / 15) + 1} > CORE OS`,
                });
            }

            this.shelfBatchA.push({
                isCatalog: false,
                id: `mF-${Math.floor(Math.random() * 1000)}`,
                title: `Intelligence Module ${i}`,
                category: i % 2 === 0 ? 'Protocol' : 'Design',
                description: 'Advanced contextual mappings for agentic infrastructure...',
            });
            this.shelfBatchB.push({
                isCatalog: false,
                id: `fx-${Math.floor(Math.random() * 1000)}`,
                title: `Core Module ${i + 60}`,
                category: i % 3 === 0 ? 'AI' : 'Perimeter',
                description: 'Ecosystem connections and perimeter safeguards...',
            });
        }
    }

    onSelect(eventPayload: any) {
        this.isCurating = true;
        // The item is the actual element emitting the click, which we passed via mouseEvent.currentTarget
        const element = eventPayload.event.currentTarget as HTMLElement;
        this.animService.pullToCenter(element, this.hud.nativeElement);
    }

    toggleSearch() {
        this.searching = !this.searching;
    }

    ngOnDestroy() {
        // Restore global launchpad visibility when leaving the library
        document.body.classList.remove('hide-global-launchpad');
    }
}
