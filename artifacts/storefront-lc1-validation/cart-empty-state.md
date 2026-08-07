# LC1 Cart empty-state validation

Status: passed

The Cart empty-state correction is included in LC1 validation. The populated-cart structure and behavior were not changed.

| Viewport | Card size | Headline | Center offset | Page scroll | Footer visible | Horizontal overflow |
| --- | --- | --- | ---: | --- | --- | --- |
| 1920×1080 | 560×331px | 48px | 0px | No | Yes | No |
| 1366×768 | 560×331px | 47.8px | 0px | No | Yes | No |
| 1280×720 | 560×321px | 44.8px | 0px | No | Yes | No |
| 390×844 | 362×323px | 39px | 0px | No | Yes | No |

Internal spacing measured 24px from headline to supporting copy and 24px from supporting copy to the Browse Products button at every tested viewport.

Validated requirements:

- Exact approved headline retained.
- Content-sized card with no fixed or minimum height.
- Browse Products link retained.
- StoreShell and compact footer retained.
- No desktop page scrolling at the required baselines.
- No horizontal overflow.
- Mobile remains compact and responsive.
