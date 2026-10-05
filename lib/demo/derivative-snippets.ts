export const DERIVATIVE_BUILD_COMMAND = `npx derivative build

derivative: 3 releases, 7 entries
  wrote public/changelog.json`

export const DERIVATIVE_EMBED = `<derivative-widget src="/changelog.json"></derivative-widget>
<script type="module">
  import "@sweberdev/derivative/widget"
</script>`
