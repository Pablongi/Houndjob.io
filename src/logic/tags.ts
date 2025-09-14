import { Tag } from '@/types/job';
import { TAG_CATEGORIES } from '@/constants';
import { normalizeText } from '@/logic/filterUtils';

const ALL_TAGS = TAG_CATEGORIES.flatMap(category =>
  category.subcategorías.flatMap(subcategory =>
    subcategory.tags.map(tag => ({
      tag,
      categoría: category.categoría,
      subcategoría: subcategory.nombre,
    }))
  )
);

export const extractTags = (description: string): Tag[] => {
  const normalizedDescription = normalizeText(description);
  const foundTags: Tag[] = [];

  ALL_TAGS.forEach(({ tag, categoría, subcategoría }) => {
    const normalizedTag = normalizeText(tag);
    if (normalizedDescription.includes(normalizedTag)) {
      foundTags.push({
        tag,
        count: 1,
        categoría,
        subcategoría,
      });
    }
  });

  const uniqueTags = Array.from(
    new Map(foundTags.map(item => [item.tag, item])).values()
  );

  return uniqueTags;
};