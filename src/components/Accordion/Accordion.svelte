<script lang ts>
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  export let title: string;

  let labelDOM, contentDOM;
  let isOpen = true;

  onMount(() => {
    labelDOM.addEventListener('mousedown', () => {
      isOpen = !isOpen;
      console.log(isOpen);
    });
  });
</script>

<div class="accordion">
  <div class="label" bind:this={labelDOM}>
    <span class="title">{title + ' ' + isOpen}</span>
    <!-- A collapse or expand icon :TODO: -->
  </div>

  {#if isOpen}
    <div
      class="content"
      bind:this={contentDOM}
      transition:slide
      class:expand={isOpen}
    >
      <slot />
    </div>
  {/if}
</div>

<style lang="scss">
  @use '@/styles/abstracts' as *;
  .accordion .label {
    background: #e2abab;
    cursor: pointer;
    padding: size(md);
    width: 100%;
    text-align: left;
  }

  .accordion .content {
    padding: 0;
    max-height: 0;
    height: max-content;
    overflow: hidden;
    transition: 0.5s;
  }

  .accordion .expand {
    padding: size(md);
    max-height: fit-content;
  }
</style>
