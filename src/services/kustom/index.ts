import {
  HasChildren,
  HasLevel,
  HasParent,
  KLWE,
  KLWE_ATTRIBUTE,
} from '@/interfaces';
import { kustomStore } from '@/stores';
import { Item, Overlap, Preset, Stack, Text } from 'kustom';
import { dataService } from '..';
import { PreviewService } from './preview';

class KustomService {
  _previewService: PreviewService;

  loadPreset(): void {
    const preset = kustomStore.preset.load();

    this.initPreset(preset);
  }

  clearPreset() {
    kustomStore.preset.clear();
  }

  initPreset(preset: Preset) {
    function initItem(item: Item & KLWE) {
      item[KLWE_ATTRIBUTE] ??= {};
      if (!(item as Stack | Overlap).viewgroup_items) return;

      ((item as Stack | Overlap).viewgroup_items as (Item &
        HasParent)[]).forEach((i) => {
        initItem(i);
        i[KLWE_ATTRIBUTE].parent = item as Stack | Overlap;
      });
    }

    preset.preset_root.viewgroup_items.forEach(initItem);

    kustomStore.preset.set(preset);
  }

  getFlatChildItems(item: Item, level?: number) {
    if (
      !('viewgroup_items' in item) ||
      !item.viewgroup_items ||
      !item[KLWE_ATTRIBUTE].isOpen
    )
      return [];

    const res: (Item & HasLevel)[] = [];
    (item as Overlap | Stack).viewgroup_items.forEach(
      (item: Item & HasLevel) => {
        item[KLWE_ATTRIBUTE].level = level;

        res.push(item, ...this.getFlatChildItems(item, level + 1));
      },
    );
    return res;
  }

  toggleIsOpen(item: Overlap | Stack) {
    item[KLWE_ATTRIBUTE].isOpen = !item[KLWE_ATTRIBUTE].isOpen;

    kustomStore.preset.update((v) => v);
  }

  createItemOfType(type: Item['internal_type']) {
    const { $preset } = kustomStore;

    const item = {
      internal_type: type,
      isRoot: true,
      [KLWE_ATTRIBUTE]: {},
    } as Item;

    switch (type) {
      case 'OverlapLayerModule':
      case 'StackLayerModule':
        (item as Overlap | Stack).viewgroup_items = [];
        break;
      case 'TextModule':
        (item as Text).text_expression = '$df(hh:mm)$';
        break;
      case 'ShapeModule':
        break;
    }

    $preset.preset_root.viewgroup_items.push(item);
    kustomStore.preset.update((v) => v);
  }

  removeItem(item: Item) {
    const { $preset } = kustomStore;
    const parent =
      (item as Item & HasParent)[KLWE_ATTRIBUTE].parent ?? $preset.preset_root;

    // remove from parent
    const index = parent.viewgroup_items.findIndex((v) => v === item);
    parent.viewgroup_items.splice(index, 1);

    kustomStore.preset.update((v) => v);
  }

  getParent(item: Item): Overlap | Stack {
    return (item as Item & HasParent)[KLWE_ATTRIBUTE].parent;
  }

  moveItem(
    item: Item,
    target: Item,
    position: 'before' | 'into' | 'after',
  ): number {
    const { preset, $preset } = kustomStore;

    const itemParentRaw = (item as Item & HasParent)[KLWE_ATTRIBUTE].parent;
    const itemParent = itemParentRaw ?? $preset.preset_root;
    let itemIndex = itemParent.viewgroup_items.findIndex((v) => v === item);

    const targetParentRaw = (target as Item & HasParent)[KLWE_ATTRIBUTE].parent;
    const targetParent = targetParentRaw ?? $preset.preset_root;
    let targetIndex = targetParent.viewgroup_items.findIndex(
      (v) => v === target,
    );
    const itemCopy: Item & HasParent = {
      ...item,
      [KLWE_ATTRIBUTE]: {
        parent:
          position === 'into' ? (target as Overlap | Stack) : targetParentRaw,
      },
    };

    console.log(
      'MOVE',
      dataService.getItemName(item),
      position,
      dataService.getItemName(target),
    );

    switch (position) {
      case 'into': {
        (target as Overlap | Stack).viewgroup_items.unshift(itemCopy);
        (target as (Overlap | Stack) & HasChildren)[
          KLWE_ATTRIBUTE
        ].isOpen = true;
        break;
      }
      case 'before': {
        targetParent.viewgroup_items.splice(targetIndex, 0, itemCopy);
        break;
      }
      case 'after': {
        if (targetIndex >= targetParent.viewgroup_items.length)
          targetIndex = targetParent.viewgroup_items.length - 1;
        targetParent.viewgroup_items.splice(targetIndex + 1, 0, itemCopy);
        break;
      }
    }

    itemIndex = itemParent.viewgroup_items.findIndex((v) => v === item);
    itemParent.viewgroup_items.splice(itemIndex, 1);

    preset.update((v) => v);

    debugger;

    return kustomStore.$flatItems.findIndex((v) => v === itemCopy);
  }
}

export const kustomService = new KustomService();
export * from './data';
