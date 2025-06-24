import { Tag, Category } from '../types/job';
import { TAG_CATEGORIES } from '../constants';

export const extractTags = (description: string): Tag[] => {
  const normalizedDescription = description.toLowerCase().trim();
  const tags: Tag[] = [];

  TAG_CATEGORIES.forEach((category: Category) => {
    category.subcategorías.forEach((subcategory) => {
      subcategory.tags.forEach((tag) => {
        if (normalizedDescription.includes(tag.toLowerCase())) {
          tags.push({ categoría: category.categoría, subcategoría: subcategory.nombre, tag, count: 0 });
        }
      });
    });
  });

  if (tags.length === 0) {
    tags.push({ categoría: 'Otros', subcategoría: 'Sin categoría', tag: 'general', count: 0 });
  }

  const maxTags = 5;
  if (tags.length > maxTags) {
    const tagCounts: { [key: string]: number } = {};
    tags.forEach((tag) => {
      const matches = (normalizedDescription.match(new RegExp(tag.tag, 'gi')) || []).length;
      tagCounts[tag.tag] = matches;
    });
    tags.sort((a, b) => (tagCounts[b.tag] || 0) - (tagCounts[a.tag] || 0));
    return tags.slice(0, maxTags).filter((tag, index, self) =>
      index === self.findIndex((t) => t.tag === tag.tag)
    );
  }

  return tags;
};

export const countTags = (jobs: Job[]): Tag[] => {
  const tagMap = new Map<string, Tag>();
  const jobIds = new Set<string>();

  jobs.forEach((job) => {
    if (!jobIds.has(job.id)) {
      job.tags.forEach((tag) => {
        const tagKey = `${tag.tag}-${tag.categoría}-${tag.subcategoría}`;
        if (tagMap.has(tagKey)) {
          const existingTag = tagMap.get(tagKey)!;
          existingTag.count += 1;
        } else {
          tagMap.set(tagKey, { ...tag, count: 1 });
        }
      });
      jobIds.add(job.id);
    }
  });

  return Array.from(tagMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
};