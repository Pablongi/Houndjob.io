export interface FilterState {
  search: string;
  selectedCategories: Set<string>;
  selectedSubcategories: Set<string>;
  selectedTags: Set<string>;
  selectedPortals: Set<string>;
  selectedCountries: Set<string>;
  selectedRegions: Set<string>;
  company: string;
}