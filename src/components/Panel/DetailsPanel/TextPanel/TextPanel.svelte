<script lang="ts" context="module">
  import {
    AnchorInput,
    ColorInput,
    OffsetInput,
    Option,
    PaddingInput,
    Select,
    SimpleInput,
  } from '@/components/Input';
  import { TextTabsType, KLWE_ATTRIBUTE } from '@/interfaces';
  import { dataService } from '@/services';
  import { Text } from 'kustom';
  import { beforeUpdate } from 'svelte';

  const TextTabs: { [key in TextTabsType]: string } = {
    TEXT: 'Text',
    PAINT: 'Paint',
    POSITION: 'Position',
    ANIMATION: 'Animation',
    TOUCH: 'Touch',
  } as const;
</script>

<script lang="ts">
  import Accordion from '@/components/Accordion/Accordion.svelte';

  export let item: Text;

  let value: TextTabsType = 'TEXT',
    text = TextTabs[value];

  beforeUpdate(() => {
    item.paint_color ??= '#FFFFFFFF';
  });
</script>

<Accordion title="Text">
  <SimpleInput title="Text" bind:value={item.text_expression} multiline />
  <ColorInput bind:color={item.paint_color} />
</Accordion>

{#if dataService.hasAnchor(item)}
  <AnchorInput {item} />
{/if}
{#if item[KLWE_ATTRIBUTE].parent}
  <PaddingInput {item} />
{:else}
  <OffsetInput {item} />
{/if}
