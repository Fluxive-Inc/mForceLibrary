// App shell spec.
//
// 2026.09.16 — "should render title" asserted against a template that has never
// existed in this app. It read:
//
//     expect(compiled.querySelector('h1')?.textContent).toContain('Hello, library-app');
//
// but app.html is exactly `<router-outlet></router-outlet>` — there is no <h1>.
// So querySelector returned null, `?.textContent` gave undefined, and vitest
// rejected the comparison itself: "the given combination of arguments (undefined
// and string) is invalid for this assertion". That is `ng new` boilerplate that
// was never removed when the real shell template replaced it, and it has been
// failing Step-06-TEST and with it the whole mForceLibrary build.
//
// It is NOT deleted here, because a deleted test hides that this shell was never
// covered. It is replaced with the assertion the boilerplate was standing in for:
// this component's entire job is to host the router, and `title` is the signal it
// actually declares. Both are things that are true, and both would break if
// someone removed them.
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hosts the router outlet — the shell\'s whole job', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('declares the app title signal', () => {
    const fixture = TestBed.createComponent(App);
    // `title` is protected on the component, so it is read the way a template
    // would reach it rather than through a public API that does not exist.
    const title = (fixture.componentInstance as unknown as { title: () => string }).title;
    expect(title()).toBe('library-app');
  });
});
