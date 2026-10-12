# WCAG 2.2 coverage of Surjection

55 success criteria at level A and AA: 11 mostly automatic, 16 partly automatic, 28 manual only.
A passing run is no proof of conformance, not even for "mostly automatic" criteria.

| Criterion | Level | Name | Coverage | Rules |
| --- | --- | --- | --- | --- |
| 1.1.1 | A | Non-text Content | partly automatic | `aria-meter-name`, `aria-progressbar-name`, `image-alt`, `input-image-alt`, `object-alt`, `role-img-alt`, `svg-img-alt` |
| 1.2.1 | A | Audio-only and Video-only (Prerecorded) | partly automatic | `audio-caption` |
| 1.2.2 | A | Captions (Prerecorded) | partly automatic | `video-caption` |
| 1.2.3 | A | Audio Description or Media Alternative (Prerecorded) | manual only | - |
| 1.2.4 | AA | Captions (Live) | manual only | - |
| 1.2.5 | AA | Audio Description (Prerecorded) | manual only | - |
| 1.3.1 | A | Info and Relationships | partly automatic | `aria-hidden-body`, `aria-required-children`, `aria-required-parent`, `definition-list`, `dlitem`, `list`, `listitem`, `p-as-heading`, `table-fake-caption`, `td-has-header`, `td-headers-attr`, `th-has-data-cells` |
| 1.3.2 | A | Meaningful Sequence | manual only | - |
| 1.3.3 | A | Sensory Characteristics | manual only | - |
| 1.3.4 | AA | Orientation | partly automatic | `css-orientation-lock` |
| 1.3.5 | AA | Identify Input Purpose | mostly automatic | `autocomplete-valid` |
| 1.4.1 | A | Use of Color | partly automatic | `link-in-text-block` |
| 1.4.2 | A | Audio Control | partly automatic | `no-autoplay-audio` |
| 1.4.3 | AA | Contrast (Minimum) | mostly automatic | `color-contrast` |
| 1.4.4 | AA | Resize Text | mostly automatic | `meta-viewport` |
| 1.4.5 | AA | Images of Text | manual only | - |
| 1.4.10 | AA | Reflow | mostly automatic | `surjection-reflow` |
| 1.4.11 | AA | Non-text Contrast | manual only | - |
| 1.4.12 | AA | Text Spacing | mostly automatic | `avoid-inline-spacing`, `surjection-text-spacing` |
| 1.4.13 | AA | Content on Hover or Focus | manual only | - |
| 2.1.1 | A | Keyboard | partly automatic | `frame-focusable-content`, `scrollable-region-focusable`, `server-side-image-map` |
| 2.1.2 | A | No Keyboard Trap | mostly automatic | `surjection-focus-trap` |
| 2.1.4 | A | Character Key Shortcuts | manual only | - |
| 2.2.1 | A | Timing Adjustable | partly automatic | `meta-refresh` |
| 2.2.2 | A | Pause, Stop, Hide | partly automatic | `blink`, `marquee` |
| 2.3.1 | A | Three Flashes or Below Threshold | manual only | - |
| 2.4.1 | A | Bypass Blocks | mostly automatic | `bypass` |
| 2.4.2 | A | Page Titled | mostly automatic | `document-title` |
| 2.4.3 | A | Focus Order | partly automatic | `surjection-focus-order` |
| 2.4.4 | A | Link Purpose (In Context) | partly automatic | `area-alt`, `link-name` |
| 2.4.5 | AA | Multiple Ways | manual only | - |
| 2.4.6 | AA | Headings and Labels | manual only | - |
| 2.4.7 | AA | Focus Visible | partly automatic | `surjection-focus-visible` |
| 2.4.11 | AA | Focus Not Obscured (Minimum) | manual only | - |
| 2.5.1 | A | Pointer Gestures | manual only | - |
| 2.5.2 | A | Pointer Cancellation | manual only | - |
| 2.5.3 | A | Label in Name | partly automatic | `label-content-name-mismatch` |
| 2.5.4 | A | Motion Actuation | manual only | - |
| 2.5.7 | AA | Dragging Movements | manual only | - |
| 2.5.8 | AA | Target Size (Minimum) | mostly automatic | `target-size` |
| 3.1.1 | A | Language of Page | mostly automatic | `html-has-lang`, `html-lang-valid`, `html-xml-lang-mismatch` |
| 3.1.2 | AA | Language of Parts | partly automatic | `valid-lang` |
| 3.2.1 | A | On Focus | manual only | - |
| 3.2.2 | A | On Input | manual only | - |
| 3.2.3 | AA | Consistent Navigation | manual only | - |
| 3.2.4 | AA | Consistent Identification | manual only | - |
| 3.2.6 | A | Consistent Help | manual only | - |
| 3.3.1 | A | Error Identification | manual only | - |
| 3.3.2 | A | Labels or Instructions | partly automatic | `form-field-multiple-labels` |
| 3.3.3 | AA | Error Suggestion | manual only | - |
| 3.3.4 | AA | Error Prevention (Legal, Financial, Data) | manual only | - |
| 3.3.7 | A | Redundant Entry | manual only | - |
| 3.3.8 | AA | Accessible Authentication (Minimum) | manual only | - |
| 4.1.2 | A | Name, Role, Value | mostly automatic | `area-alt`, `aria-allowed-attr`, `aria-braille-equivalent`, `aria-command-name`, `aria-conditional-attr`, `aria-deprecated-role`, `aria-hidden-body`, `aria-hidden-focus`, `aria-input-field-name`, `aria-prohibited-attr`, `aria-required-attr`, `aria-roledescription`, `aria-roles`, `aria-tab-name`, `aria-toggle-field-name`, `aria-tooltip-name`, `aria-valid-attr`, `aria-valid-attr-value`, `button-name`, `duplicate-id-aria`, `frame-title`, `frame-title-unique`, `input-button-name`, `input-image-alt`, `label`, `link-name`, `nested-interactive`, `select-name`, `summary-name` |
| 4.1.3 | AA | Status Messages | manual only | - |
